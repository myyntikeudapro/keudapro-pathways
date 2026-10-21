import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RECIPIENT = "heikki.kallunki@keuda.fi";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const organization = String(body.organization ?? "").trim();
    const meetingFormat = String(body.meetingFormat ?? "").trim();
    const message = String(body.message ?? "").trim();
    const source = String(body.source ?? "").trim();

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (name.length < 2 || name.length > 100 || !emailOk || email.length > 255) {
      return new Response(JSON.stringify({ error: "Tarkista nimi ja sähköpostiosoite." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (message.length < 5 || message.length > 3000) {
      return new Response(JSON.stringify({ error: "Tarkista viestin sisältö." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: dbError } = await supabase.from("booking_requests").insert({
      name,
      email,
      phone: phone || null,
      organization: organization || null,
      meeting_format: meetingFormat || "ei valittu",
      message,
      source: source || null,
    });

    if (dbError) {
      console.error("DB insert failed:", dbError.message);
      return new Response(JSON.stringify({ error: "Tallennus epäonnistui.", details: dbError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const gmailKey = Deno.env.get("GOOGLE_MAIL_API_KEY");
    let emailSent = false;

    if (lovableKey && gmailKey) {
      const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const html = `
        <h2>Uusi yhteydenotto (${esc(meetingFormat || "ei valittu")})</h2>
        <p><strong>Nimi:</strong> ${esc(name)}</p>
        <p><strong>Sähköposti:</strong> ${esc(email)}</p>
        <p><strong>Puhelin:</strong> ${esc(phone || "-")}</p>
        <p><strong>Organisaatio:</strong> ${esc(organization || "-")}</p>
        <p><strong>Mistä lähetetty:</strong> ${esc(source || "-")}</p>
        <hr />
        <p style="white-space:pre-wrap">${esc(message)}</p>
      `;
      const b64 = (s: string) =>
        btoa(Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join(""));
      const hdr = (v: string) => (/^[\x00-\x7F]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=`);
      const subject = `Yhteydenotto – ${name}${meetingFormat ? ` (${meetingFormat})` : ""}`;
      const raw = [
        `From: ${hdr("KeudaPRO")} <myynti@keudapro.com>`,
        `To: ${RECIPIENT}`,
        `Reply-To: ${email}`,
        `Subject: ${hdr(subject)}`,
        "MIME-Version: 1.0",
        'Content-Type: text/html; charset="UTF-8"',
        "Content-Transfer-Encoding: base64",
        "",
        b64(html),
      ].join("\r\n");
      const encoded = b64(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

      const res = await fetch("https://connector-gateway.lovable.dev/google_mail/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": gmailKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: encoded }),
      });

      if (!res.ok) {
        console.error(`Gmail send failed [${res.status}]: ${await res.text()}`);
      } else {
        emailSent = true;
      }
    } else {
      console.warn("Gmail connection missing — request stored but email not sent.");
    }

    return new Response(JSON.stringify({ ok: true, emailSent }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-booking-request error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
