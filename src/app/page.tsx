"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hai 👋 Aku DeepSeek Web Bot.\n\nKamu bisa tanya apa saja atau upload foto untuk aku analisa."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() && !imageDataUrl) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: input.trim() || "(Mengirim gambar tanpa teks)"
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: newHistory,
          userMessage: input.trim(),
          imageDataUrl
        })
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.reply
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Terjadi error koneksi ke API. Coba lagi."
        }
      ]);
    } finally {
      setIsLoading(false);
      setImagePreview(null);
      setImageDataUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Hanya mendukung upload gambar.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setImagePreview(result);
        setImageDataUrl(result);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <h1 className="text-lg font-semibold">DeepSeek AI Chat</h1>
        <button
          onClick={() => setMessages([])}
          className="text-xs border border-slate-700 px-3 py-1 rounded-xl hover:bg-slate-800"
        >
          New Chat
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-emerald-400 text-slate-900 rounded-br-none"
                  : "bg-slate-800 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="text-xs text-slate-400 animate-pulse">
            DeepSeek sedang mengetik...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {imagePreview && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-3 border border-slate-700 bg-slate-900 p-3 rounded-xl">
            <img
              src={imagePreview}
              alt="preview"
              className="w-12 h-12 object-cover rounded-lg"
            />
            <button
              onClick={() => {
                setImagePreview(null);
                setImageDataUrl(null);
              }}
              className="text-xs text-red-400"
            >
              Hapus
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="px-4 py-3 border-t border-slate-800 flex items-end gap-2"
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="border border-slate-700 px-3 py-2 rounded-xl text-xs hover:bg-slate-800"
        >
          📎 Foto
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pesan..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2 text-sm resize-none"
        />

        <button
          type="submit"
          disabled={isLoading || (!input.trim() && !imageDataUrl)}
          className="bg-emerald-400 text-slate-900 px-4 py-2 rounded-xl font-medium disabled:opacity-50"
        >
          Kirim
        </button>
      </form>
    </main>
  );
}
