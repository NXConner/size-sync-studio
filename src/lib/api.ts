import { z } from "zod";

export async function postJson<T>(
  url: string,
  body: unknown,
  schema: z.ZodSchema<T>,
  options?: { signal?: AbortSignal },
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: options?.signal,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const json = await res.json();
  return schema.parse(json);
}

export async function getJson<T>(
  url: string,
  schema: z.ZodSchema<T>,
  options?: { signal?: AbortSignal },
): Promise<T> {
  const res = await fetch(url, { method: "GET", signal: options?.signal });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const json = await res.json();
  return schema.parse(json);
}

export const ChatResponseSchema = z.object({
  reply: z.string(),
  safety: z.object({ refused: z.boolean() }),
  sources: z
    .array(z.object({ name: z.string(), url: z.string() }))
    .optional()
    .default([]),
});

export const OkResponseSchema = z.object({ ok: z.boolean() });

export const RedditPayloadSchema = z.object({
  posts: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        permalink: z.string(),
        author: z.string(),
      }),
    )
    .default([]),
  disclaimer: z.string().optional(),
  cachedAt: z.string().optional(),
});

