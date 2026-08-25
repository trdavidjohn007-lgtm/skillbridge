import { NextRequest, NextResponse } from "next/server";
import { runAssessmentPipeline } from "@/modules/assessment/pipeline";
import { requireAuth, requirePermission } from "@/modules/core/auth/middleware";

// POST /api/assessments/generate - Generate assessment from uploaded material
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "assessments:write");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { materialId, competencyId, numberOfQuestions = 10, autoPublishThreshold = 0.8 } =
      body;

    if (!materialId || !competencyId) {
      return NextResponse.json(
        { error: "Missing required fields: materialId, competencyId" },
        { status: 400 }
      );
    }

    // Run the 3-stage pipeline
    const result = await runAssessmentPipeline(
      materialId,
      competencyId,
      numberOfQuestions,
      autoPublishThreshold
    );

    return NextResponse.json({
      message: "Assessment generation complete",
      result: {
        totalGenerated: result.totalGenerated,
        totalValidated: result.totalValidated,
        totalPublished: result.totalPublished,
        questions: result.questions,
      },
    });
  } catch (error) {
    console.error("Failed to generate assessment:", error);
    return NextResponse.json(
      { error: "Failed to generate assessment" },
      { status: 500 }
    );
  }
}
