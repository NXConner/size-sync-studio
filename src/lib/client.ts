import { z } from "./api";
import { getJson, postJson, ChatResponseSchema, OkResponseSchema, RedditPayloadSchema } from "./api";
import { withApiBase } from "./config";

export const HealthSchema = z.object({ status: z.string() }).catchall(z.any());
export type Health = z.infer<typeof HealthSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema> & { sources: { name: string; url: string }[] };
export type OkResponse = z.infer<typeof OkResponseSchema>;
export type RedditPayload = z.infer<typeof RedditPayloadSchema> & { posts: { title: string; id: string; permalink: string; author: string }[] };

export async function apiHealth(options?: { signal?: AbortSignal }): Promise<Health> {
  return getJson("/health", HealthSchema, options);
}

export async function apiChat(message: string, options?: { signal?: AbortSignal }): Promise<ChatResponse> {
  const res = await postJson("/chat", { message }, ChatResponseSchema, options);
  return { ...res, sources: res.sources ?? [] } as ChatResponse;
}

export function apiChatStream(): EventSource {
  const full = withApiBase('/chat/stream');
  return new EventSource(full);
}

export async function apiRedditTop(options?: { signal?: AbortSignal }): Promise<RedditPayload> {
  const res = await getJson("/reddit/gettingbigger", RedditPayloadSchema, options);
  return { ...res, posts: res.posts ?? [] } as RedditPayload;
}

export async function apiFeedback(
  body: { message?: string; reply?: string; rating?: "up" | "down" | null; reasons?: string[] },
  options?: { signal?: AbortSignal },
): Promise<OkResponse> {
  return postJson("/feedback", body, OkResponseSchema, options);
}

