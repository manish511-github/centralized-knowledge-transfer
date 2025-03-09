"use client";

import { useState, useRef } from "react";
import { MemoizedMarkdown } from "@/components/MemoMarkdown";
import { cn } from "@/lib/utils";
import { Copy, Check, User, Bot } from "lucide-react";
import { motion } from "framer-motion";

type MessageProps = {
  message: {
    text: string;
    isBot: boolean;
    timestamp?: Date;
  };
  isLatest?: boolean;
};

// Format timestamp to show time only (e.g., "10:30 AM")
const formatTime = (date?: Date) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
};

const UserMessage = ({
  text,
  timestamp,
}: {
  text: string;
  timestamp?: Date;
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-row gap-3 py-4 group"
    >
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <User size={18} />
        </div>
      </div>
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">You</span>
          {timestamp && (
            <span className="text-xs text-gray-400">
              {formatTime(timestamp)}
            </span>
          )}
        </div>
        <div className="relative group">
          <div className="text-base break-words  p-3 rounded-lg">{text}</div>
          <button
            onClick={copyToClipboard}
            className="absolute right-2 top-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600"
            aria-label="Copy message"
          >
            {copied ? (
              <Check size={14} className="text-green-400" />
            ) : (
              <Copy size={14} className="text-gray-300" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const BotMessage = ({
  text,
  timestamp,
  isLatest,
}: {
  text: string;
  timestamp?: Date;
  isLatest?: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-row gap-3 py-4 group"
    >
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
          <Bot size={18} />
        </div>
      </div>
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">AI Assistant</span>
          {timestamp && (
            <span className="text-xs text-gray-400">
              {formatTime(timestamp)}
            </span>
          )}
        </div>
        <div className="relative group">
          <div
            ref={contentRef}
            className={cn(
              "prose prose-invert prose-headings:mt-4 prose-headings:mb-2",
              "prose-p:my-2 prose-pre:my-2 prose-pre:bg-gray-800",
              "prose-code:bg-gray-800 prose-code:p-0.5 prose-code:rounded",
              "max-w-none p-4 rounded-lg text-black",
              "prose-strong:text-black",
              isLatest &&
                text.endsWith("_") &&
                "after:content-['▋'] after:animate-blink after:ml-0.5"
            )}
          >
            <MemoizedMarkdown content={text} />
          </div>
          <button
            onClick={copyToClipboard}
            className="absolute right-2 top-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 hover:bg-gray-600"
            aria-label="Copy message"
          >
            {copied ? (
              <Check size={14} className="text-green-400" />
            ) : (
              <Copy size={14} className="text-gray-300" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

function ChatMessage({ message, isLatest = false }: MessageProps) {
  return (
    <div className="w-full" role="listitem">
      {message.isBot ? (
        <BotMessage
          text={message.text}
          timestamp={message.timestamp}
          isLatest={isLatest}
        />
      ) : (
        <UserMessage text={message.text} timestamp={message.timestamp} />
      )}
      <hr className="border-gray-800 w-full" />
    </div>
  );
}

export default ChatMessage;
