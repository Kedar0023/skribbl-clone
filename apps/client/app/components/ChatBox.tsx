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
    <aside className="w-64 sm:w-80 bg-primary border-l-4 border-primary/80 flex flex-col select-none flex-shrink-0 text-bg">
      {/* Header */}
      <div className="p-3 border-b-2 border-primary/80 flex items-center justify-between">
        <h3 className="text-base font-black text-bg flex items-center gap-1.5">
          💬 Chat & Guesses
        </h3>
        <span className="text-[11px] font-bold text-secondary bg-primary/90 px-2 py-0.5 rounded-full">
          {chatMessages.length} msgs
        </span>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-2 bg-primary/30">
        {chatMessages.length === 0 ? (
          <div className="text-center text-xs text-bg/70 italic mt-6">
            No messages yet. Type your guess below!
          </div>
        ) : (
          chatMessages.map((msg) => {
            if (msg.isSystem || msg.isCorrectGuess) {
              return (
                <div
                  key={msg.id}
                  className="bg-accent text-primary text-xs px-2.5 py-1.5 rounded-xl shadow-md font-black text-center border-2 border-bg"
                >
                  {msg.message}
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className="text-xs sm:text-sm bg-bg text-primary p-2.5 rounded-2xl border-2 border-primary/20 shadow-sm break-words"
              >
                <span className="font-black text-primary mr-1.5">
                  {msg.sender}:
                </span>
                <span className="font-semibold text-primary/90">{msg.message}</span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message / Guess Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t-2 border-primary/80 bg-primary/90 flex items-center gap-2"
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
            className="w-full text-xs sm:text-sm bg-bg text-primary placeholder:text-primary/60 font-semibold disabled:opacity-50 border-2 border-primary"
          />
        </div>
        <DrawablyButton
          type="submit"
          disabled={isDrawer || !inputMessage.trim()}
          variant="solid"
          className="text-xs sm:text-sm px-3.5 py-1.5 font-black bg-accent text-primary border-2 border-bg hover:brightness-105 disabled:opacity-50"
        >
          Send
        </DrawablyButton>
      </form>
    </aside>
  );
}

