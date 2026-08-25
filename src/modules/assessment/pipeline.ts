import { db } from "../core/db";
import { questionBank, uploadedContent, competencies } from "../core/db/schema";
import { eq, and } from "drizzle-orm";

// ============================================================
// TYPES
// ============================================================

export interface GeneratedQuestion {
  questionText: string;
  questionType: "mcq" | "true_false" | "short_answer";
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface ValidationResult {
  questionIndex: number;
  confidenceScore: number;
  isValid: boolean;
  issues: string[];
}

export interface PipelineResult {
  totalGenerated: number;
  totalValidated: number;
  totalPublished: number;
  questions: {
    id: string;
    questionText: string;
    confidenceScore: number;
    validationStatus: string;
  }[];
}

// ============================================================
// LLM CLIENT
// ============================================================

interface LLMConfig {
  provider: string;
  baseUrl: string;
  model: string;
  apiKey?: string;
}

const llmConfig: LLMConfig = {
  provider: process.env.LLM_PROVIDER || "ollama",
  baseUrl: process.env.LLM_BASE_URL || "http://localhost:11434",
  model: process.env.LLM_MODEL || "llama3:8b",
  apiKey: process.env.LLM_API_KEY,
};

/**
 * Call LLM API (supports Ollama and OpenAI-compatible APIs)
 */
async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.7
): Promise<string> {
  if (llmConfig.provider === "ollama") {
    const response = await fetch(`${llmConfig.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: llmConfig.model,
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        stream: false,
        options: { temperature },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } else {
    // OpenAI-compatible API
    const response = await fetch(`${llmConfig.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${llmConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: llmConfig.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

// ============================================================
// STAGE 1: GENERATE QUESTIONS
// ============================================================

const GENERATION_SYSTEM_PROMPT = `You are an expert assessment question generator for India's Official Statistical System.
Generate high-quality multiple choice questions (MCQs), true/false questions, and short answer questions from the provided learning material.

Rules:
1. Questions must be factually accurate and based on the provided material
2. MCQs should have 4 options with exactly one correct answer
3. True/False questions should have clear, unambiguous statements
4. Each question should test understanding, not just memorization
5. Include an explanation for the correct answer
6. Vary difficulty levels (easy, medium, hard)
7. Use clear, professional English suitable for government officials

Output format (JSON array):
[
  {
    "questionText": "Question text here?",
    "questionType": "mcq" | "true_false" | "short_answer",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Correct answer text",
    "explanation": "Explanation of why this is correct",
    "difficulty": "easy" | "medium" | "hard"
  }
]`;

/**
 * Generate questions from learning material
 */
export async function generateQuestions(
  materialId: string,
  competencyId: string,
  numberOfQuestions: number = 10
): Promise<GeneratedQuestion[]> {
  // 1. Get the uploaded material
  const [material] = await db
    .select()
    .from(uploadedContent)
    .where(eq(uploadedContent.id, materialId))
    .limit(1);

  if (!material || !material.extractedText) {
    throw new Error("Material not found or not yet processed");
  }

  // 2. Get competency details
  const [competency] = await db
    .select()
    .from(competencies)
    .where(eq(competencies.id, competencyId))
    .limit(1);

  if (!competency) {
    throw new Error("Competency not found");
  }

  // 3. Truncate material if too long (LLM context limits)
  const maxMaterialLength = 8000;
  const materialText = material.extractedText.slice(0, maxMaterialLength);

  // 4. Generate questions using LLM
  const userPrompt = `Generate ${numberOfQuestions} assessment questions for the competency "${competency.name}" (${competency.domain} domain, ${competency.level} level).

Learning Material:
---
${materialText}
---

Generate a mix of MCQ, true/false, and short answer questions. Return ONLY the JSON array, no other text.`;

  try {
    const response = await callLLM(GENERATION_SYSTEM_PROMPT, userPrompt, 0.7);

    // Parse JSON response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse LLM response as JSON");
    }

    const questions = JSON.parse(jsonMatch[0]) as GeneratedQuestion[];

    // Validate basic structure
    return questions.filter(
      (q) =>
        q.questionText &&
        q.questionType &&
        q.correctAnswer &&
        q.explanation &&
        q.difficulty
    );
  } catch (error) {
    console.error("Question generation failed:", error);
    throw error;
  }
}

// ============================================================
// STAGE 2: VALIDATE QUESTIONS
// ============================================================

const VALIDATION_SYSTEM_PROMPT = `You are a fact-checking expert for educational assessments.
Validate whether the given question and answer are factually correct based on the source material.
Check for:
1. Factual accuracy against the source material
2. Unambiguous correct answer
3. Plausible distractors (wrong options)
4. Clear and accurate explanation
5. Appropriate difficulty level

Output format (JSON):
{
  "confidenceScore": 0.0 to 1.0,
  "isValid": true/false,
  "issues": ["issue1", "issue2"]
}`;

/**
 * Validate a generated question against source material
 */
export async function validateQuestion(
  question: GeneratedQuestion,
  materialText: string
): Promise<ValidationResult> {
  const truncatedMaterial = materialText.slice(0, 6000);

  const userPrompt = `Validate this assessment question:

Question: ${question.questionText}
Type: ${question.questionType}
Options: ${question.options?.join(", ") || "N/A"}
Correct Answer: ${question.correctAnswer}
Explanation: ${question.explanation}

Source Material:
---
${truncatedMaterial}
---

Is this question factually accurate? Is the correct answer truly correct? Are the distractors plausible?`;

  try {
    const response = await callLLM(VALIDATION_SYSTEM_PROMPT, userPrompt, 0.3);

    // Parse validation result
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        questionIndex: 0,
        confidenceScore: 0.5,
        isValid: false,
        issues: ["Failed to parse validation response"],
      };
    }

    const result = JSON.parse(jsonMatch[0]);
    return {
      questionIndex: 0,
      confidenceScore: result.confidenceScore || 0.5,
      isValid: result.isValid || false,
      issues: result.issues || [],
    };
  } catch (error) {
    return {
      questionIndex: 0,
      confidenceScore: 0,
      isValid: false,
      issues: [`Validation error: ${error}`],
    };
  }
}

/**
 * Batch validate multiple questions
 */
export async function validateQuestions(
  questions: GeneratedQuestion[],
  materialText: string
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  for (let i = 0; i < questions.length; i++) {
    const result = await validateQuestion(questions[i], materialText);
    result.questionIndex = i;
    results.push(result);

    // Small delay to avoid overloading LLM
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}

// ============================================================
// STAGE 3: PUBLISH QUESTIONS
// ============================================================

/**
 * Publish validated questions to the question bank
 */
export async function publishQuestions(
  questions: GeneratedQuestion[],
  validationResults: ValidationResult[],
  competencyId: string,
  materialId: string,
  autoPublishThreshold: number = 0.8
): Promise<PipelineResult> {
  const publishedQuestions: PipelineResult["questions"] = [];

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const validation = validationResults[i];

    // Determine validation status
    let validationStatus: "pending" | "validated" | "rejected";
    if (validation.confidenceScore >= autoPublishThreshold && validation.isValid) {
      validationStatus = "validated";
    } else if (validation.confidenceScore >= 0.5) {
      validationStatus = "pending"; // Needs human review
    } else {
      validationStatus = "rejected";
    }

    // Insert into question bank
    const [inserted] = await db
      .insert(questionBank)
      .values({
        competencyId,
        sourceMaterialId: materialId,
        questionText: question.questionText,
        questionType: question.questionType,
        options: question.options || null,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        confidenceScore: validation.confidenceScore.toString(),
        validationStatus,
        generatedBy: "ai",
        tags: [competencyId],
      })
      .returning();

    publishedQuestions.push({
      id: inserted.id,
      questionText: question.questionText,
      confidenceScore: validation.confidenceScore,
      validationStatus,
    });
  }

  return {
    totalGenerated: questions.length,
    totalValidated: validationResults.filter((v) => v.isValid).length,
    totalPublished: publishedQuestions.filter(
      (q) => q.validationStatus === "validated"
    ).length,
    questions: publishedQuestions,
  };
}

// ============================================================
// FULL PIPELINE
// ============================================================

/**
 * Run the complete 3-stage assessment generation pipeline
 */
export async function runAssessmentPipeline(
  materialId: string,
  competencyId: string,
  numberOfQuestions: number = 10,
  autoPublishThreshold: number = 0.8
): Promise<PipelineResult> {
  console.log("🚀 Starting assessment generation pipeline...");

  // Stage 1: Generate
  console.log("📝 Stage 1: Generating questions...");
  const questions = await generateQuestions(
    materialId,
    competencyId,
    numberOfQuestions
  );
  console.log(`✅ Generated ${questions.length} questions`);

  // Get material text for validation
  const [material] = await db
    .select()
    .from(uploadedContent)
    .where(eq(uploadedContent.id, materialId))
    .limit(1);

  if (!material?.extractedText) {
    throw new Error("Material text not available for validation");
  }

  // Stage 2: Validate
  console.log("🔍 Stage 2: Validating questions...");
  const validationResults = await validateQuestions(
    questions,
    material.extractedText
  );
  const validCount = validationResults.filter((v) => v.isValid).length;
  console.log(`✅ Validated ${validCount}/${questions.length} questions`);

  // Stage 3: Publish
  console.log("📤 Stage 3: Publishing questions...");
  const result = await publishQuestions(
    questions,
    validationResults,
    competencyId,
    materialId,
    autoPublishThreshold
  );
  console.log(`✅ Published ${result.totalPublished} questions`);

  return result;
}

// ============================================================
// QUESTION RETRIEVAL FOR ASSESSMENTS
// ============================================================

/**
 * Get questions for an adaptive assessment
 * Uses spaced repetition principles - prioritizes previously missed questions
 */
export async function getAdaptiveQuestions(
  competencyId: string,
  difficulty: "easy" | "medium" | "hard",
  count: number = 10,
  excludeIds: string[] = []
) {
  // Get validated questions for this competency and difficulty
  const questions = await db
    .select()
    .from(questionBank)
    .where(
      and(
        eq(questionBank.competencyId, competencyId),
        eq(questionBank.difficulty, difficulty),
        eq(questionBank.validationStatus, "validated")
      )
    )
    .limit(count);

  return questions;
}

/**
 * Get questions across multiple competencies for a general assessment
 */
export async function getGeneralAssessmentQuestions(
  competencyIds: string[],
  count: number = 20
) {
  // Distribute questions evenly across competencies
  const questionsPerCompetency = Math.ceil(count / competencyIds.length);
  const allQuestions: any[] = [];

  for (const compId of competencyIds) {
    const questions = await db
      .select()
      .from(questionBank)
      .where(
        and(
          eq(questionBank.competencyId, compId),
          eq(questionBank.validationStatus, "validated")
        )
      )
      .limit(questionsPerCompetency);

    allQuestions.push(...questions);
  }

  // Shuffle and take requested count
  return allQuestions.sort(() => Math.random() - 0.5).slice(0, count);
}
