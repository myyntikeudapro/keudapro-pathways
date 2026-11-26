import { expect, it } from 'vitest';
import { publicChatMessages } from './publicChatRequest';
it('outgoing public history retains at most 20 messages and last user input', () => { const rows = Array.from({length:31},(_,i) => ({ role: i===30 ? 'user' as const : 'assistant' as const, content: String(i) })); const result = publicChatMessages(rows); expect(result).toHaveLength(20); expect(result.at(-1)).toEqual({role:'user',content:'30'}); });
it('each outgoing turn respects the 2000 character boundary', () => { expect(publicChatMessages([{role:'user',content:'x'.repeat(3000)}])[0].content).toHaveLength(2000); });
it('multibyte history fits the actual byte boundary', () => { const result=publicChatMessages(Array.from({length:20},()=>({role:'user' as const,content:'漢'.repeat(2000)}))); expect(new TextEncoder().encode(JSON.stringify({messages:result})).length).toBeLessThanOrEqual(47000); });
