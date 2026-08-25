"use client";

import { useState, useEffect } from "react";

const STEPS = [
  {
    icon: "🪙",
    title: "Welcome to SkillBridge!",
    subtitle: "Your learning journey starts here",
    body: "You received **100 free credits** to begin. Credits are the currency of SkillBridge — spend them to get help from peer tutors, or earn more by teaching others.",
    visual: (
      <div className="flex items-center justify-center gap-4 my-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
          <span className="text-4xl">🪙</span>
        </div>
        <div className="text-left">
          <div className="text-4xl font-black text-orange-600">100</div>
          <div className="text-sm text-slate-500 font-medium">starting credits</div>
        </div>
      </div>
    ),
  },
  {
    icon: "📝",
    title: "Post or Accept Requests",
    subtitle: "The core of SkillBridge",
    body: "Need help? **Post a help request** with your topic and tags. A tutor will accept and you'll enter an anonymous chat room. Teach someone? **Browse requests** and accept to earn credits.",
    visual: (
      <div className="flex gap-3 my-6">
        <div className="flex-1 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
          <div className="text-2xl mb-2">🎓</div>
          <div className="text-sm font-bold text-blue-700">Learner</div>
          <div className="text-xs text-blue-500 mt-1">Post requests, spend credits</div>
        </div>
        <div className="flex items-center text-slate-300 text-xl">→</div>
        <div className="flex-1 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
          <div className="text-2xl mb-2">👨‍🏫</div>
          <div className="text-sm font-bold text-green-700">Tutor</div>
          <div className="text-xs text-green-500 mt-1">Accept requests, earn credits</div>
        </div>
      </div>
    ),
  },
  {
    icon: "🤖",
    title: "Meet SkillBot",
    subtitle: "Your AI study assistant",
    body: "Click the **orange chat button** in the bottom-right corner anytime. SkillBot can recommend free courses (NPTEL, YouTube), create study plans, and answer CS questions — all for free!",
    visual: (
      <div className="flex items-center justify-center my-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25 text-3xl">
            🤖
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        </div>
      </div>
    ),
  },
];

export default function OnboardingModal() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Only show if user hasn't seen onboarding
    const seen = localStorage.getItem("skillbridge_onboarded");
    if (!seen) {
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleFinish = () => {
    localStorage.setItem("skillbridge_onboarded", "true");
    setShow(false);
  };

  if (!show) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl relative overflow-hidden">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-orange-500" : i < step ? "w-4 bg-orange-300" : "w-4 bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="text-center mb-4">
          <span className="text-5xl">{current.icon}</span>
        </div>

        {/* Content */}
        <h2 className="text-2xl font-black text-slate-900 text-center mb-1">{current.title}</h2>
        <p className="text-sm text-orange-500 text-center font-medium mb-4">{current.subtitle}</p>

        {/* Visual */}
        {current.visual}

        {/* Body */}
        <p className="text-sm text-slate-600 text-center leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: current.body.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
          }}
        />

        {/* Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={isLast ? handleFinish : () => setStep((s) => s + 1)}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25"
          >
            {isLast ? "Let's Go! 🚀" : "Next →"}
          </button>
        </div>

        {/* Skip */}
        {!isLast && (
          <button
            onClick={handleFinish}
            className="w-full mt-3 py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Skip tour
          </button>
        )}
      </div>
    </div>
  );
}
