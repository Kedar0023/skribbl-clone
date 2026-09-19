import { useState, useRef, useEffect } from "react";
import useGameStore from "../store/gameStore";
import { DrawablyButton, DrawablyDivider, DrawablyInput } from "drawably/react";

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
    <aside className="w-64 sm:w-80 bg-[#fff0d6]  flex flex-col select-none shrink-0">
      {/* Header */}
      <div className="p-3 border-b-2 border-lilac/15 flex items-center justify-between ">
        <h3 className="text-base font-black text-ink flex items-center gap-1.5">
          💬 Chat & Guesses
        </h3>
        <span className="text-[11px] font-bold text-lilac bg-[#f1edff] px-2 py-0.5 rounded-full">
          {chatMessages.length} msgs
        </span>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-2 bg-paper/60">
        {chatMessages.length === 0 ? (
          <div className="text-center text-xs text-muted italic mt-6">
            No messages yet. Type your guess below!
          </div>
        ) : (
          chatMessages.map((msg) => {
            if (msg.isSystem || msg.isCorrectGuess) {
              return (
                <div
                  key={msg.id}
                  className="bg-[#fff0d6] text-ink text-sm px-2.5 py-1.5 rounded-xl font-black text-center border-2 border-sun/50"
                >
                  {msg.message}
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className="text-xl sm:text-md text-ink p-1 wrap-break-word flex border-b border-lilac/10"
              >
                <p className="font-black text-rose mr-1.5">
                  {msg.sender}:
                </p>
                <p className="font-semibold text-ink/90">{msg.message}</p>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message / Guess Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t-2 border-lilac/15 bg-white/70 flex items-center gap-2"
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
            stroke="#302b3d" fill="#fffaf0" className="w-full text-xs sm:text-sm bg-paper text-ink placeholder:text-muted font-semibold disabled:opacity-50"
          />
        </div>
        <DrawablyButton
          type="submit"
          disabled={isDrawer || !inputMessage.trim()}
          variant="solid"
          stroke="#121212" fill="#6256d9" className="text-xs sm:text-sm px-3.5 py-1.5 font-black text-white disabled:opacity-50"
        >
          Send
        </DrawablyButton>
      </form>
    </aside>
  );
}
