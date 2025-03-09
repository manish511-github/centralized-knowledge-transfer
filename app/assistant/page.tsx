"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ChatMessage from "@/components/ChatMessage";
import InputBar from "@/components/InputBar";
import { Moon, Sun } from "lucide-react";

type Message = { text: string; isBot: boolean };

export default function Page() {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [controller, setController] = useState<AbortController | null>(null);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      setIsAutoScrollEnabled(scrollHeight - scrollTop <= clientHeight + 10);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current && isAutoScrollEnabled) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [isAutoScrollEnabled]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, scrollToBottom]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
      return () => chatContainer.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const fetchContent = async (userQuery: string) => {
    const addMessageToHistory = (text: string, isBot: boolean) => {
      setChatHistory((prev) => [...prev, { text, isBot }]);
    };

    if (controller) controller.abort();
    const newController = new AbortController();
    setController(newController);

    try {
      addMessageToHistory(userQuery, false);
      const response = await fetch(`https://megamind.saurav.co/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
        signal: newController.signal,
      });

      if (!response.ok) {
        addMessageToHistory("Server is not responding well", true);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        addMessageToHistory("Response body is empty", true);
        return;
      }

      const decoder = new TextDecoder();
      addMessageToHistory("", true);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        updateLastBotMessage(decoder.decode(value));
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        addMessageToHistory("Something went wrong. Please try again.", true);
      }
    }
  };

  const updateLastBotMessage = useCallback((message: string) => {
    setChatHistory((prevChatHistory) => {
      if (prevChatHistory.length === 0) return prevChatHistory;
      return prevChatHistory.map((chat, index) => {
        if (index === prevChatHistory.length - 1 && chat.isBot) {
          return { ...chat, text: chat.text + message };
        }
        return chat;
      });
    });
  }, []);

  const memoizedChatMessages = useMemo(
    () => chatHistory.map((d, idx) => <ChatMessage key={idx} message={d} />),
    [chatHistory]
  );

  const isEmpty = chatHistory.length === 0;

  return (
    <main className="relative flex flex-col h-screen w-full mx-auto p-4 bg-white dark:bg-black text-black dark:text-white">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800"
      >
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </button>
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-4xl font-bold mb-12">
            What can I help you find?
          </h1>
          <div className="w-full max-w-3xl">
            <InputBar fetchContent={fetchContent} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-grow items-center">
          <div
            className="flex flex-col flex-grow overflow-y-auto w-full max-w-4xl hide-scrollbar"
            ref={chatContainerRef}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {memoizedChatMessages}
          </div>
          <div className="sticky bottom-0 w-full max-w-4xl p-2 bg-white dark:bg-black">
            <InputBar fetchContent={fetchContent} />
          </div>
        </div>
      )}
    </main>
  );
}
