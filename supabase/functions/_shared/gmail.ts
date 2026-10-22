export async function sendMail(to: string, subject: string, text: string) {
  const key = Deno.env.get('LOVABLE_API_KEY');
  const connection = Deno.env.get('GOOGLE_MAIL_API_KEY');
  if (!key || !connection) throw new Error('Gmail-yhteys puuttuu');
  if (/[\r\n]/.test(to) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error('Virheellinen vastaanottaja');
  const b64 = (s: string) => btoa(Array.from(new TextEncoder().encode(s), b => String.fromCharCode(b)).join(''));
  const raw = [`From: KeudaPRO <myynti@keudapro.com>`, `To: ${to}`, 'Reply-To: heikki.kallunki@keuda.fi', `Subject: =?UTF-8?B?${b64(subject)}?=`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', b64(text)].join('\r\n');
  const response = await fetch('https://connector-gateway.lovable.dev/google_mail/gmail/v1/users/me/messages/send', {method:'POST', headers:{Authorization:`Bearer ${key}`, 'X-Connection-Api-Key':connection, 'Content-Type':'application/json'}, body:JSON.stringify({raw:b64(raw).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')})});
  const body = await response.text();
  if (!response.ok) throw new Error(`Gmail [${response.status}]: ${body}`);
  const result = JSON.parse(body);
  if (!result.id) throw new Error('Gmail ei vahvistanut lähetystä');
  return String(result.id);
}