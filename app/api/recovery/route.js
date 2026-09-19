import { NextResponse } from "next/server";

const number = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

function daysBetween(from, to) {
  const a = new Date(from + "T00:00:00");
  const b = new Date(to + "T00:00:00");
  return Math.max(0, Math.floor((b - a) / 86400000));
}

async function supabase(path, options = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || !process.env.SUPABASE_URL) throw new Error("Database is not configured");
  const r = await fetch(process.env.SUPABASE_URL + "/rest/v1/" + path, {
    ...options,
    headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json", ...(options.headers || {}) },
    cache: "no-store"
  });
  if (!r.ok) throw new Error("Database request failed");
  return r.status === 204 ? null : r.json();
}

export async function POST(request) {
  try {
    const b = await request.json();
    const amount = Math.max(0, number(b.invoiceAmount));
    const rate = Math.max(0, number(b.rate));
    if (!amount || !b.dueDate) return NextResponse.json({ error: "Invoice amount and due date are required." }, { status: 400 });
    if (b.email && !validEmail(b.email)) return NextResponse.json({ error: "Invalid email address." }, { status: 400 });

    const endDate = b.paidDate || new Date().toISOString().slice(0, 10);
    const overdue = new Date(endDate + "T00:00:00") > new Date(b.dueDate + "T00:00:00");
    const days = overdue ? daysBetween(b.dueDate, endDate) : 0;
    const interest = overdue ? amount * (rate / 100) * (days / 365) : 0;
    const fee = overdue ? (amount < 1000 ? 40 : amount < 10000 ? 70 : 100) : 0;

    await supabase("recovery_checks", {
      method: "POST",
      body: JSON.stringify({
        invoice_amount: amount,
        due_date: b.dueDate,
        paid_date: b.paidDate || null,
        reference_rate: Math.max(0, rate - 8),
        statutory_rate: rate,
        days_overdue: days,
        interest_estimate: Number(interest.toFixed(2)),
        recovery_fee: fee,
        total_recoverable: Number((interest + fee).toFixed(2)),
        email: b.email ? String(b.email).trim().toLowerCase() : null
      })
    });

    return NextResponse.json({ ok: true, days, interest, fee, total: interest + fee });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Something went wrong." }, { status: 500 });
  }
}
