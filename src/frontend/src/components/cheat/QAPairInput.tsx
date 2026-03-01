import { useCallback, useEffect, useRef } from "react";
import type { QAPair } from "../../utils/cheatTypes";

interface QAPairInputProps {
  index: number;
  pair: QAPair;
  onChange: (
    index: number,
    field: "question" | "answer",
    value: string,
  ) => void;
  hasError: boolean;
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export function QAPairInput({
  index,
  pair,
  onChange,
  hasError,
}: QAPairInputProps) {
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const answerRef = useRef<HTMLTextAreaElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: resize after external value change
  useEffect(() => {
    if (questionRef.current) autoResize(questionRef.current);
  }, [pair.question]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: resize after external value change
  useEffect(() => {
    if (answerRef.current) autoResize(answerRef.current);
  }, [pair.answer]);

  const handleQuestionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(index, "question", e.target.value);
      autoResize(e.target);
    },
    [index, onChange],
  );

  const handleAnswerChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(index, "answer", e.target.value);
      autoResize(e.target);
    },
    [index, onChange],
  );

  const qLen = pair.question.length;
  const qWords = countWords(pair.question);
  const aLen = pair.answer.length;
  const aWords = countWords(pair.answer);
  const isEmpty = !pair.question.trim() && !pair.answer.trim();

  return (
    <div className="qa-pair-card">
      <div className="flex items-start gap-3 mb-2">
        <div className="qa-pair-number mt-1" aria-hidden="true">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          {/* Question */}
          <label
            className="block text-xs font-semibold mb-1.5 font-mono"
            style={{ color: "rgba(0,255,255,0.8)" }}
            htmlFor={`q-${index}`}
          >
            Q —
          </label>
          <textarea
            id={`q-${index}`}
            ref={questionRef}
            className={`cheat-textarea${hasError && !pair.question.trim() ? " error" : ""}`}
            placeholder="Enter your question here..."
            value={pair.question}
            onChange={handleQuestionChange}
            rows={1}
            aria-label={`Question ${index + 1}`}
          />
          <div className="counter-badge mt-1 flex gap-3" aria-live="polite">
            <span>{qLen} chars</span>
            <span>{qWords} words</span>
          </div>

          {/* Answer */}
          <label
            className="block text-xs font-semibold mb-1.5 mt-3 font-mono"
            style={{ color: "rgba(191,0,255,0.8)" }}
            htmlFor={`a-${index}`}
          >
            A —
          </label>
          <textarea
            id={`a-${index}`}
            ref={answerRef}
            className={`cheat-textarea${hasError && !pair.answer.trim() && !isEmpty ? " error" : ""}`}
            placeholder="Enter your answer here..."
            value={pair.answer}
            onChange={handleAnswerChange}
            rows={2}
            aria-label={`Answer ${index + 1}`}
          />
          <div className="counter-badge mt-1 flex gap-3" aria-live="polite">
            <span>{aLen} chars</span>
            <span>{aWords} words</span>
          </div>
        </div>
      </div>
    </div>
  );
}
