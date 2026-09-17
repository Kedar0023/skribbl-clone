import { useState, useRef, useEffect } from "react";
import useGameStore from "../store/gameStore";
import { DrawablyButton, DrawablyInput } from "drawably/react";

export default function ChatBox() {
  const {
    chatMessages,
    isDrawer,
    actions: { sendChat },
  } = useGameStore();

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed) return;

    sendChat(trimmed);
    setInputMessage("");
  };

  return (
    <aside className="w-64 sm:w-80 bg-slate-900 border-l-2 border-slate-700 flex flex-col select-none flex-shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-slate-700">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
          💬 Chat & Guesses
        </h3>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-2">
        {chatMessages.length === 0 ? (
          <div className="text-center text-xs text-slate-500 italic mt-6">
            No messages yet. Type a guess below!
          </div>
        ) : (
          chatMessages.map((msg) => {
            if (msg.isSystem || msg.isCorrectGuess) {
              return (
                <div
                  key={msg.id}
                  className="bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 text-xs px-2.5 py-1.5 rounded-lg shadow-sm font-semibold text-center"
                >
                  {msg.message}
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className="text-xs sm:text-sm bg-slate-800/80 border border-slate-700/60 p-2 rounded-lg break-words"
              >
                <span className="font-bold text-amber-300 mr-1.5">{msg.sender}:</span>
                <span className="text-slate-200">{msg.message}</span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message / Guess Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-slate-700 bg-slate-950/80 flex items-center gap-2"
      >
        <div className="flex-1">
          <DrawablyInput
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              isDrawer ? "You are drawing..." : "Type your guess here..."
            }
            disabled={isDrawer}
            className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 disabled:opacity-50"
          />
        </div>
        <DrawablyButton
          type="submit"
          disabled={isDrawer || !inputMessage.trim()}
          variant="solid"
          className="text-xs sm:text-sm px-3 py-1 font-bold disabled:opacity-50"
        >
          Send
        </DrawablyButton>
      </form>
    </aside>
  );
}
