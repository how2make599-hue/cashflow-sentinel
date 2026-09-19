import { NextResponse } from "next/server";
async function db(path, options = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const r = await fetch(process.env.SUPABASE_URL + "/rest/v1/" + path, { ...options, headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json", ...(options.headers || {}) }, cache: "no-store" });
  if (!r.ok) throw new Error("Database request failed");
  return r.status === 204 ? null : r.json();
}
export async function GET(request) {
  if (request.headers.get("authorization") !== "Bearer " + process.env.CRON_SECRET) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const cutoff = new Date(Date.now() - 3 * 86400000).toISOString();
  const leads = await db("leads?select=*&status=eq.new&follow_up_sent_at=is.null&created_at=lt." + encodeURIComponent(cutoff) + "&limit=25");
  let sent = 0;
  for (const lead of leads) {
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.RESEND_FROM, to: lead.email, subject: "A quick follow-up on your cashflow audit", html: "<p>Hi " + lead.name + "</p><p>I wanted to follow up on the cashflow audit you completed. Your assessment was marked <strong>" + lead.priority + "</strong>.</p><p>If the issue is still relevant, the next step is a short review of the numbers and where recovery effort is most likely to pay back.</p>" }) });
    if (!r.ok) continue;
    await db("leads?id=eq." + lead.id, { method: "PATCH", body: JSON.stringify({ follow_up_sent_at: new Date().toISOString(), status: "follow-up" }) });
    await db("lead_events", { method: "POST", body: JSON.stringify({ lead_id: lead.id, event_type: "follow_up_sent", metadata: { stage: 1 } }) });
    sent++;
  }
  return NextResponse.json({ processed: leads.length, sent });
}