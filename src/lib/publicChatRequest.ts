export function publicChatMessages<T extends { role: 'user' | 'assistant'; content: string }>(messages: T[]) {
  const bounded = messages.slice(-20).map(m => ({ role: m.role, content: m.content.slice(0,2000) }));
  while (bounded.length > 1 && new TextEncoder().encode(JSON.stringify({ messages: bounded })).length > 47000) bounded.shift();
  return bounded;
}
