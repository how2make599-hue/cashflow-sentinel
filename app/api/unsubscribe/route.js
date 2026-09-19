import { NextResponse } from "next/server";

async function db(path, options = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const base = process.env.SUPABASE_URL;
  if (!key || !base) throw new Error("Database configuration is missing.");
  const r = await fetch(base + "/rest/v1/" + path, {
    ...options,
    headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json", ...(options.headers || {}) },
    cache: "no-store"
  });
  if (!r.ok) throw new Error("Database request failed");
  return r.status === 204 ? null : r.json();
}

export async function GET(request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return new NextResponse("Missing unsubscribe ID.", { status: 400 });
    await db("leads?id=eq." + encodeURIComponent(id), {
      method: "PATCH",
      body: JSON.stringify({ unsubscribed_at: new Date().toISOString(), status: "unsubscribed" })
    });
    await db("lead_events", {
      method: "POST",
      body: JSON.stringify({ lead_id: id, event_type: "unsubscribed", metadata: {} })
    });
    return new NextResponse("<h1>Unsubscribed</h1><p>You will not receive further Cashflow Sentinel follow-up emails.</p>", {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  } catch {
    return new NextResponse("Unable to process unsubscribe request.", { status: 500 });
  }
}
