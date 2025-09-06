import { useEffect, useRef, useState } from "react";
import { apiChat, apiChatStream, apiFeedback, apiRedditTop, ChatResponse, RedditPayload } from "@/lib/client";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "I provide general men’s health guidance. I won’t give sexual technique or enlargement instructions. For concerns, consult a clinician.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [redditLoading, setRedditLoading] = useState(false);
  const [redditPosts, setRedditPosts] = useState<
    { id: string; title: string; permalink: string; author: string }[]
  >([]);
  const [redditError, setRedditError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [sources, setSources] = useState<{ name: string; url: string }[]>([]);
  const [lastUser, setLastUser] = useState<string>("");
  const [lastAssistant, setLastAssistant] = useState<string>("");
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function stop() {
    if (sseRef.current) {
      try {
        sseRef.current.close();
      } catch {}
      sseRef.current = null;
    }
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch {}
      abortRef.current = null;
    }
    setLoading(false);
  }

  function clearChat() {
    stop();
    setMessages([
      {
        role: "assistant",
        content:
          "I provide general men’s health guidance. I won’t give sexual technique or enlargement instructions. For concerns, consult a clinician.",
      },
    ]);
    setSources([]);
    setRedditError(null);
    setLastUser("");
    setLastAssistant("");
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLastUser(text);
    setInput("");
    if (streaming) {
      // Stream via SSE
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      const evt = apiChatStream();
      sseRef.current = evt;
      let acc = "";
      setLoading(true);
      evt.onmessage = (e) => {
        if (!e?.data) return;
        if (e.data === "[DONE]") {
          setLastAssistant(acc);
          evt.close();
          sseRef.current = null;
          setLoading(false);
          return;
        }
        try {
          const parsed = JSON.parse(e.data);
          const token: string = String(parsed.token || "");
          acc += token;
          setMessages((m) => {
            const copy = m.slice();
            // update last assistant message content
            for (let i = copy.length - 1; i >= 0; i--) {
              if (copy[i].role === "assistant") {
                copy[i] = { ...copy[i], content: acc };
                break;
              }
            }
            return copy;
          });
        } catch {
          // ignore parse errors
        }
      };
      evt.onerror = () => {
        evt.close();
        sseRef.current = null;
        setLoading(false);
      };
    } else {
      setLoading(true);
      try {
        const controller = new AbortController();
        abortRef.current = controller;
        const data: ChatResponse = await apiChat(text, { signal: controller.signal });
        setSources(data.sources ?? []);
        const reply = data.reply;
        setMessages((m) => [...m, { role: "assistant", content: reply }]);
        setLastAssistant(reply);
      } catch (err) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "There was a problem. Please try again." },
        ]);
      } finally {
        abortRef.current = null;
        setLoading(false);
      }
    }
  }

  async function sendFeedback(rating: "up" | "down") {
    try {
      await apiFeedback({ message: lastUser, reply: lastAssistant, rating, reasons: [] });
    } catch {
      // no-op
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Chat</h1>
      <div className="flex items-center gap-3 mb-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={streaming}
            onChange={(e) => setStreaming(e.target.checked)}
          />
          Streaming
        </label>
      </div>
      <div
        ref={messagesContainerRef}
        className="space-y-3 mb-4 max-h-[60vh] overflow-auto p-3 rounded-lg border"
        aria-live="polite"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "text-right" : "text-left text-muted-foreground"}
          >
            <div
              className={
                m.role === "user"
                  ? "inline-block bg-primary text-primary-foreground px-3 py-2 rounded-lg"
                  : "inline-block bg-muted px-3 py-2 rounded-lg"
              }
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 items-start">
        <textarea
          className="flex-1 px-3 py-2 rounded-lg border min-h-[42px]"
          placeholder="Ask about general wellness, recovery, sleep, stress..."
          value={input}
          rows={2}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
            disabled={loading || input.trim().length === 0}
            onClick={send}
          >
            Send
          </button>
          <button
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
            disabled={!loading}
            onClick={stop}
            aria-disabled={!loading}
          >
            Stop
          </button>
          <button className="px-4 py-2 rounded-lg border" onClick={clearChat}>
            Clear
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-sm">
        <span className="text-muted-foreground">Rate last answer:</span>
        <button
          className="px-2 py-1 rounded border hover:bg-muted"
          onClick={() => sendFeedback("up")}
        >
          👍
        </button>
        <button
          className="px-2 py-1 rounded border hover:bg-muted"
          onClick={() => sendFeedback("down")}
        >
          👎
        </button>
      </div>
      {sources.length > 0 && (
        <div className="mt-3 p-3 rounded-lg border bg-muted/50">
          <div className="text-sm font-medium mb-1">Why this answer?</div>
          <ul className="list-disc ml-5 text-sm">
            {sources.map((s, i) => (
              <li key={`${s.url}-${i}`}>
                <a className="hover:underline" href={s.url} target="_blank" rel="noreferrer">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="text-xs text-muted-foreground mt-3">
        Not medical advice. If you have symptoms or concerns, see a licensed clinician.
      </div>
      <div className="mt-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Community: r/gettingbigger</h2>
          <button
            className="px-3 py-1.5 rounded-lg border bg-muted hover:bg-muted/70 text-sm"
            onClick={async () => {
              setRedditError(null);
              setRedditLoading(true);
              try {
                const data: RedditPayload = await apiRedditTop();
                setRedditPosts(
                  (data.posts ?? []).map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    permalink: p.permalink,
                    author: p.author,
                  })),
                );
              } catch (e: any) {
                setRedditError("Could not load subreddit.");
              } finally {
                setRedditLoading(false);
              }
            }}
            disabled={redditLoading}
          >
            {redditLoading ? "Loading..." : "Load Posts"}
          </button>
        </div>
        {redditError && <div className="text-sm text-red-500 mb-2">{redditError}</div>}
        <ul className="space-y-2">
          {redditPosts.map((p) => (
            <li key={p.id} className="p-3 rounded-lg border bg-card">
              <a
                href={p.permalink}
                target="_blank"
                rel="noreferrer"
                className="font-medium hover:underline"
              >
                {p.title}
              </a>
              <div className="text-xs text-muted-foreground">u/{p.author}</div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground mt-2">
          Community posts may include unverified claims. Do not follow routines, pressures, or
          protocols without medical supervision.
        </p>
      </div>
    </div>
  );
}
