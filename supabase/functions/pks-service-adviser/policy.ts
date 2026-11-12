// Fail closed until the next approved instruction/knowledge activation step.
export const publicAdviserPolicy = {
  id: "tyonhakijan-yksilovalmennus-pks",
  enabled: false,
  maxMessages: 20,
  maxMessageLength: 2000,
  maxBodyBytes: 48000,
  allowedActions: ["entry", "faq", "copy-message"],
  booking: false,
  storage: "none",
  cache: "none",
  profile: "none",
} as const;

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