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

    const resendKey = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;

    if (resendKey) {
      const from = Deno.env.get("EMAIL_FROM") ?? "KeudaPRO <onboarding@resend.dev>";
      const html = `
        <h2>Uusi ajanvarauspyyntö (${meetingFormat || "ei valittu"})</h2>
        <p><strong>Nimi:</strong> ${name}</p>
        <p><strong>Sähköposti:</strong> ${email}</p>
        <p><strong>Puhelin:</strong> ${phone || "-"}</p>
        <p><strong>Organisaatio:</strong> ${organization || "-"}</p>
        <p><strong>Mistä lähetetty:</strong> ${source || "-"}</p>
        <hr />
        <p style="white-space:pre-wrap">${message.replace(/</g, "&lt;")}</p>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [RECIPIENT],
          reply_to: email,
          subject: `Ajanvarauspyyntö – ${name}${meetingFormat ? ` (${meetingFormat})` : ""}`,
          html,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error(`Resend failed [${res.status}]: ${errBody}`);
      } else {
        emailSent = true;
      }
    } else {
      console.warn("RESEND_API_KEY missing — request stored but email not sent.");
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
