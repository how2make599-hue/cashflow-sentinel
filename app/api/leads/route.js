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
async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "YOUR_RESEND_API_KEY") return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.RESEND_FROM, to, subject, html })
  });
}
const number = v => Number.isFinite(Number(v)) ? Number(v) : 0;
export async function POST(request) {
  try {
    const b = await request.json();
    if (!b.name || !b.email || !b.company || !b.consent) return NextResponse.json({ error: "Please complete the required fields and consent." }, { status: 400 });
    const overdue = number(b.overdue), revenue = number(b.revenue), terms = number(b.terms);
    const exposure = overdue + Math.max(0, revenue * (terms / 30) * 0.15);
    const priority = exposure >= 50000 ? "High" : exposure >= 15000 ? "Medium" : "Watch";
    const email = String(b.email).trim().toLowerCase();
    const existing = await supabase("leads?select=id&email=eq." + encodeURIComponent(email) + "&limit=1");
    if (existing && existing.length) return NextResponse.json({ ok: true, duplicate: true, priority, cashExposure: exposure });
    const lead = { name: String(b.name).trim(), email, company: String(b.company).trim(), phone: String(b.phone || "").trim(), active_projects: number(b.projects), overdue_cash: overdue, monthly_revenue: revenue, payment_terms_days: terms || 30, payment_pressure: b.pressure === "yes", cash_exposure: exposure, priority, status: "new", source: "cashflow-audit", consent_at: new Date().toISOString() };
    const created = await supabase("leads", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(lead) });
    const id = created && created[0] && created[0].id;
    await supabase("lead_events", { method: "POST", body: JSON.stringify({ lead_id: id, event_type: "lead_created", metadata: {} }) });
    await sendEmail(email, "Your Cashflow Sentinel audit is received", "<p>Thanks for completing the cashflow audit. Your initial priority is <strong>" + priority + "</strong>.</p><p>We have recorded your assessment and will follow up with the next practical step.</p>");
    if (process.env.INTERNAL_LEAD_EMAIL) await sendEmail(process.env.INTERNAL_LEAD_EMAIL, "New " + priority + " Cashflow Sentinel lead", "<p>" + lead.company + "</p><p>" + lead.name + " · " + email + "</p><p>Estimated exposure: £" + Math.round(exposure).toLocaleString() + "</p>");
    return NextResponse.json({ ok: true, id, priority, cashExposure: exposure });
  } catch (error) { return NextResponse.json({ error: error.message || "Something went wrong." }, { status: 500 }); }
}
export async function GET(request) {
  if (new URL(request.url).searchParams.get("token") !== process.env.ADMIN_DASHBOARD_TOKEN) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  return NextResponse.json({ leads: await supabase("leads?select=*&order=created_at.desc&limit=100") });
}