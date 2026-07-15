"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { QUIZ_QUESTIONS } from "@/lib/content/bible-character-quiz";
import { getQuizResult } from "@/lib/tools/bible-character-quiz";
import { captureError, trackEvent } from "@/lib/analytics";

const TOOL_ID = "bible-character-quiz";

export function BibleCharacterQuiz() {
  const router = useRouter();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerIds, setAnswerIds] = useState<string[]>([]);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = QUIZ_QUESTIONS[questionIndex];
  const selectedAnswerId = answerIds[questionIndex];
  const isLastQuestion = questionIndex === QUIZ_QUESTIONS.length - 1;
  const progress = ((questionIndex + 1) / QUIZ_QUESTIONS.length) * 100;

  function chooseAnswer(answerId: string) {
    if (!started) {
      setStarted(true);
      trackEvent("tool_start", { tool_id: TOOL_ID });
    }
    setError(null);
    setAnswerIds((current) => {
      const next = [...current];
      next[questionIndex] = answerId;
      return next;
    });
  }

  function continueQuiz() {
    if (!selectedAnswerId) {
      setError("Choose the answer that feels closest to you.");
      return;
    }

    if (!isLastQuestion) {
      setQuestionIndex((current) => current + 1);
      setError(null);
      return;
    }

    try {
      const result = getQuizResult(answerIds);
      trackEvent("tool_complete", {
        tool_id: TOOL_ID,
        character_id: result.id,
        question_count: QUIZ_QUESTIONS.length,
      });
      router.push(`/tools/bible-character-quiz/result/${result.slug}`);
    } catch (caught) {
      captureError(caught, "bible-character-quiz-complete");
      setError("We could not calculate the result. Please restart the quiz.");
    }
  }

  function goBack() {
    setQuestionIndex((current) => Math.max(0, current - 1));
    setError(null);
  }

  function restartQuiz() {
    setQuestionIndex(0);
    setAnswerIds([]);
    setStarted(false);
    setError(null);
  }

  return (
    <section
      aria-labelledby="quiz-question"
      className="rounded-2xl border border-[oklch(0.88_0.02_85)] bg-white/85 p-5 shadow-sm sm:p-7"
    >
      <div className="flex items-center justify-between gap-4 text-xs font-medium text-[oklch(0.48_0.04_255)]">
        <span>
          Question {questionIndex + 1} of {QUIZ_QUESTIONS.length}
        </span>
        <button
          type="button"
          onClick={restartQuiz}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-2 text-[oklch(0.35_0.04_255)] hover:bg-[oklch(0.96_0.01_85)]"
        >
          <RotateCcw className="size-3.5" />
          Restart
        </button>
      </div>

      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-[oklch(0.91_0.02_85)]"
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuemin={1}
        aria-valuemax={QUIZ_QUESTIONS.length}
        aria-valuenow={questionIndex + 1}
      >
        <div
          className="h-full rounded-full bg-[oklch(0.55_0.1_85)] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h2
        id="quiz-question"
        className="font-display mt-7 text-2xl font-semibold leading-snug text-[oklch(0.24_0.05_255)]"
      >
        {question.prompt}
      </h2>

      <div className="mt-5 grid gap-3" role="radiogroup" aria-labelledby="quiz-question">
        {question.answers.map((answer, index) => {
          const selected = answer.id === selectedAnswerId;
          return (
            <button
              key={answer.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => chooseAnswer(answer.id)}
              className={`flex min-h-14 items-start gap-3 rounded-2xl border p-4 text-left text-sm leading-relaxed transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.1_85)] ${
                selected
                  ? "border-[oklch(0.55_0.1_85)] bg-[oklch(0.96_0.03_85)] text-[oklch(0.24_0.05_255)] shadow-sm"
                  : "border-[oklch(0.86_0.02_85)] bg-white/75 text-[oklch(0.36_0.03_255)] hover:border-[oklch(0.72_0.1_85)] hover:bg-white"
              }`}
            >
              <span
                aria-hidden
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  selected
                    ? "bg-[oklch(0.3_0.05_255)] text-white"
                    : "bg-[oklch(0.94_0.02_85)] text-[oklch(0.4_0.04_255)]"
                }`}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="pt-0.5">{answer.label}</span>
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="mt-4 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={questionIndex === 0}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[oklch(0.78_0.06_85)] bg-white px-4 py-2.5 text-sm font-medium text-[oklch(0.3_0.05_255)] transition hover:bg-[oklch(0.97_0.01_85)] disabled:invisible"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <button
          type="button"
          onClick={continueQuiz}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[oklch(0.28_0.05_255)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[oklch(0.34_0.05_255)]"
        >
          {isLastQuestion ? "See my reflection" : "Next"}
          <ArrowRight className="size-4" />
        </button>
      </div>
    </section>
  );
}
