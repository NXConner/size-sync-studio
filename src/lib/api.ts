import { z } from "zod";
export { z } from "zod";
import { withApiBase } from "./config";

export async function postJson<S extends z.ZodTypeAny>(
  url: string,
  body: unknown,
  schema: S,
  options?: { signal?: AbortSignal },
): Promise<z.output<S>> {
  const fullUrl = withApiBase(url);
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: options?.signal,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const json = await res.json();
  return schema.parse(json);
}

export async function getJson<S extends z.ZodTypeAny>(
  url: string,
  schema: S,
  options?: { signal?: AbortSignal },
): Promise<z.output<S>> {
  const fullUrl = withApiBase(url);
  const res = await fetch(fullUrl, { method: "GET", signal: options?.signal });
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

