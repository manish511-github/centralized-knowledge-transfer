"use client";
import {
  useState,
  type ChangeEvent,
  useRef,
  useEffect,
  type KeyboardEvent,
} from "react";

const InputBar = ({ fetchContent }: { fetchContent: any }) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 200); // Max height of 200px
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = newHeight === 200 ? "auto" : "hidden";
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent new line insertion
      if (message.trim()) {
        setMessage("");
        fetchContent(message);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative rounded-xl border shadow-lg">
        <textarea
          ref={textareaRef}
          id="prompt-textarea"
          tabIndex={0}
          dir="auto"
          rows={1}
          placeholder="Ask what do you need."
          className="w-full resize-none border-0 bg-transparent py-4 pl-5 pr-16 placeholder-zinc-500 focus:ring-0 focus-visible:ring-0 outline-none"
          spellCheck={false}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          style={{
            minHeight: "60px",
          }}
        ></textarea>

        <div className="absolute right-3 bottom-3 flex items-center space-x-2">
          {message.trim() && (
            <button
              data-testid="send-button"
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none text-zinc-400 hover:text-white"
              onClick={() => {
                if (message.trim()) {
                  setMessage("");
                  fetchContent(message);
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          )}

          <button className="flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none text-zinc-400 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19 7-7 3 3-7 7-3-3z" />
              <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="m2 2 7.586 7.586" />
              <circle cx="11" cy="11" r="2" />
            </svg>
          </button>

          <button className="flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none text-zinc-400 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19 7-7 3 3-7 7-3-3z" />
              <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="m2 2 7.586 7.586" />
              <circle cx="11" cy="11" r="2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputBar;
