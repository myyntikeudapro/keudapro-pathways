// Approved public service adviser; only recognized site origins are accepted.
export const publicAdviserPolicy = {
  id: "tyonhakijan-yksilovalmennus-pks",
  enabled: true,
  maxMessages: 20,
  maxMessageLength: 2000,
  maxBodyBytes: 48000,
  allowedActions: ["entry", "faq", "copy-message", "keudapro-contact"],
  booking: false,
  storage: "none",
  cache: "none",
  profile: "none",
} as const;

export function isAllowedAdviserOrigin(origin: string | null) {
  return origin !== null && ["http://localhost:8080", "http://127.0.0.1:8080", "https://id-preview--372569a7-94e8-4660-8a21-6fa94be31047.lovable.app", "https://keudapro.fi", "https://www.keudapro.fi", "https://keudapro.lovable.app"].includes(origin);
}

export function filterAdviserActions(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is typeof publicAdviserPolicy.allowedActions[number] =>
    publicAdviserPolicy.allowedActions.some(allowed => allowed === id)))];
}

export function sanitizeAdviserAnswer(value: unknown) {
  if (typeof value !== "string" || !value.trim() || value.length > 8000) return null;
  // Model prose never supplies clickable URLs or contact details.
  return value.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(?:https?:\/\/|www\.)\S+/gi, "[linkki löytyy toimintopainikkeista]")
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, "[yhteystiedot löytyvät ohjeesta]")
    .replace(/(?:\+358|0)\d[\d \-]{6,}\d/g, "[yhteystiedot löytyvät ohjeesta]");
}

export function validatePublicConversation(body: unknown): boolean {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  if (Object.keys(body).some(key => key !== "messages")) return false;
  if (!("messages" in body) || !Array.isArray(body.messages)) return false;
  const messages = body.messages;
  return messages.length > 0 && messages.length <= publicAdviserPolicy.maxMessages && messages.every(message =>
    message && typeof message === "object" &&
    Object.keys(message).every(key => key === "role" || key === "content") &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" && message.content.trim().length > 0 &&
    message.content.length <= publicAdviserPolicy.maxMessageLength
  );
}