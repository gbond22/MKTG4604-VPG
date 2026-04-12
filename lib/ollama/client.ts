/**
 * Ollama HTTP adapter.
 *
 * Wraps the /api/chat endpoint (preferred over /api/generate because it
 * provides a native system-message slot, which is used by the parser to
 * cleanly separate extraction instructions from untrusted offer text).
 *
 * Configuration (via environment variables):
 *   OLLAMA_BASE_URL  — default: http://localhost:11434
 *   OLLAMA_MODEL     — default: mistral
 *   OLLAMA_TIMEOUT_MS — default: 30000
 */

const BASE_URL =
  process.env.OLLAMA_BASE_URL?.replace(/\/+$/, "") ?? "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL ?? "mistral";
const DEFAULT_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS ?? "30000");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  /** Override the model for this call. Defaults to OLLAMA_MODEL env var. */
  model?: string;
  /** Force JSON output. Not all models honour this. */
  format?: "json";
  /** Per-call timeout in ms. Defaults to OLLAMA_TIMEOUT_MS env var. */
  timeoutMs?: number;
}

// ---------------------------------------------------------------------------
// Core call
// ---------------------------------------------------------------------------

/**
 * Send a chat request to the local Ollama server and return the assistant
 * message content as a string.
 *
 * Throws on network error, timeout, or non-2xx HTTP status.
 */
export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const model = options.model ?? DEFAULT_MODEL;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        ...(options.format ? { format: options.format } : {}),
      }),
      signal: controller.signal,
    });
  } catch (err) {
    // AbortError means timeout; rethrow with a clearer message
    if ((err as { name?: string }).name === "AbortError") {
      throw new Error(
        `Ollama request timed out after ${timeoutMs}ms (model: ${model})`
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "(unreadable)");
    throw new Error(`Ollama HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    message?: { content: string };
    error?: string;
  };

  if (data.error) {
    throw new Error(`Ollama error: ${data.error}`);
  }
  if (!data.message?.content) {
    throw new Error("Ollama returned an empty message");
  }

  return data.message.content;
}

// ---------------------------------------------------------------------------
// Health probe
// ---------------------------------------------------------------------------

/**
 * Returns true if the local Ollama server answers within the given timeout.
 * Uses a short default so callers can quickly decide to fall back.
 */
export async function isOllamaReachable(timeoutMs = 2_000): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}/api/tags`, {
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
