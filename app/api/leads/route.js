import { NextResponse } from "next/server";

async function supabase(path, options = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const r = await fetch(process.env.SUPABASE_URL + "/rest/v1/" + path, {
    ...options,
    headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json", ...(options.headers || {}) },
    cache: "no-store"
  });
  if (!r.ok) throw new Error("Database request failed");
  return r.status === 204 ? null : r.json();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) return;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.RESEND_FROM, to, subject, html })
  });
  if (!r.ok) throw new Error("Email delivery request failed");
}
const number = v => Number.isFinite(Number(v)) ? Number(v) : 0;
const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

export async function POST(request) {
  try {
    const b = await request.json();
    if (b.website) return NextResponse.json({ ok: true });
    if (!b.name || !b.email || !b.company || !b.consent) return NextResponse.json({ error: "Please complete the required fields and consent." }, { status: 400 });
    const email = String(b.email).trim().toLowerCase();
    if (!validEmail(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

    const overdue = Math.max(0, number(b.overdue));
    const revenue = Math.max(0, number(b.revenue));
    const terms = Math.max(0, number(b.terms));
    const exposure = overdue + Math.max(0, revenue * (terms / 30) * 0.15);
    const priority = exposure >= 50000 ? "High" : exposure >= 15000 ? "Medium" : "Watch";

    const existing = await supabase("leads?select=id&email=eq." + encodeURIComponent(email) + "&limit=1");
    if (existing?.length) return NextResponse.json({ ok: true, duplicate: true, priority, cashExposure: exposure });

    const lead = {
      name: String(b.name).trim().slice(0, 120),
      email,
      company: String(b.company).trim().slice(0, 160),
      phone: String(b.phone || "").trim().slice(0, 50),
      active_projects: Math.max(0, Math.round(number(b.projects))),
      overdue_cash: overdue,
      monthly_revenue: revenue,
      payment_terms_days: Math.round(terms || 30),
      payment_pressure: b.pressure === "yes",
      cash_exposure: exposure,
      priority,
      status: "new",
      source: "cashflow-audit",
      consent_at: new Date().toISOString()
    };

    const created = await supabase("leads", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(lead) });
    const id = created?.[0]?.id;
    if (!id) throw new Error("Lead could not be created");

    await supabase("lead_events", { method: "POST", body: JSON.stringify({ lead_id: id, event_type: "lead_created", metadata: {} }) });

    const unsubscribe = process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL + "/api/unsubscribe?id=" + encodeURIComponent(id) : "";
    await sendEmail(email, "Your Cashflow Sentinel audit is received",
      "<p>Thanks for completing the cashflow audit. Your initial priority is <strong>" + escapeHtml(priority) +
      "</strong>.</p><p>We have recorded your assessment and will follow up with the next practical step.</p>" +
      (unsubscribe ? "<p><small><a href=\"" + unsubscribe + "\">Unsubscribe from follow-up emails</a></small></p>" : ""));
    if (process.env.INTERNAL_LEAD_EMAIL) {
      await sendEmail(process.env.INTERNAL_LEAD_EMAIL, "New " + priority + " Cashflow Sentinel lead",
        "<p><strong>" + escapeHtml(lead.company) + "</strong></p><p>" + escapeHtml(lead.name) + " · " + escapeHtml(email) +
        "</p><p>Estimated exposure: £" + Math.round(exposure).toLocaleString() + "</p>");
    }
    return NextResponse.json({ ok: true, id, priority, cashExposure: exposure });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Something went wrong." }, { status: 500 });
  }
}

export async function GET(request) {
  if (request.headers.get("authorization") !== "Bearer " + process.env.ADMIN_DASHBOARD_TOKEN) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  return NextResponse.json({ leads: await supabase("leads?select=*&order=created_at.desc&limit=100") });
}