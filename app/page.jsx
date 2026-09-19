"use client";

import { useMemo, useState } from "react";

const DEFAULT_RATE = 11.75;
const DEFAULT_BASE = 3.75;

function money(value) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value || 0);
}

function daysBetween(from, to) {
  const a = new Date(from + "T00:00:00");
  const b = new Date(to + "T00:00:00");
  return Math.max(0, Math.floor((b - a) / 86400000));
}

export default function Home() {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    invoiceAmount: "",
    dueDate: "",
    paidDate: "",
    rate: String(DEFAULT_RATE),
    email: ""
  });
  const [saved, setSaved] = useState(false);

  const result = useMemo(() => {
    const amount = Math.max(0, Number(form.invoiceAmount) || 0);
    if (!amount || !form.dueDate) return null;
    const endDate = form.paidDate || today;
    const days = daysBetween(form.dueDate, endDate);
    const rate = Math.max(0, Number(form.rate) || 0);
    const interest = amount * (rate / 100) * (days / 365);
    const fee = amount < 1000 ? 40 : amount < 10000 ? 70 : 100;
    const overdue = new Date(endDate + "T00:00:00") > new Date(form.dueDate + "T00:00:00");
    const applicableFee = overdue ? fee : 0;
    const total = interest + applicableFee;
    return { amount, days: overdue ? days : 0, interest: overdue ? interest : 0, fee: applicableFee, total, overdue };
  }, [form, today]);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  }

  async function saveCheck() {
    if (!result) return;
    try {
      const response = await fetch("/api/recovery", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          invoiceAmount: result.amount,
          dueDate: form.dueDate,
          paidDate: form.paidDate || null,
          rate: Number(form.rate) || DEFAULT_RATE,
          email: form.email || null
        })
      });
      if (response.ok) setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="eyebrow">CASHFLOW SENTINEL · FREE RECOVERY CHECK</div>
        <h1>Find money you may be entitled to recover.</h1>
        <p className="lead">
          Check a late commercial invoice in seconds. See overdue days, indicative statutory interest
          and the fixed recovery-cost amount that may be claimable.
        </p>
        <div className="trust">No account required · No payment · No data needed to run the calculation</div>
      </section>

      <section className="workspace">
        <div className="card">
          <h2>Recovery Check</h2>
          <p className="muted">Enter one commercial invoice. The calculation is indicative and should be checked against the contract and circumstances.</p>
          <div className="grid">
            <label>Invoice amount (£)
              <input name="invoiceAmount" inputMode="decimal" type="number" min="0" step="0.01" placeholder="10000" value={form.invoiceAmount} onChange={update}/>
            </label>
            <label>Payment due date
              <input name="dueDate" type="date" value={form.dueDate} onChange={update}/>
            </label>
            <label>Paid date <span className="optional">(leave blank if still unpaid)</span>
              <input name="paidDate" type="date" max={today} value={form.paidDate} onChange={update}/>
            </label>
            <label>Interest rate used (%)
              <input name="rate" type="number" min="0" step="0.01" value={form.rate} onChange={update}/>
            </label>
          </div>
          <p className="source-note">
            Default: <strong>{DEFAULT_RATE}%</strong>, based on Bank Rate {DEFAULT_BASE}% + 8 percentage points for the current UK statutory framework. 
            <a href="https://www.gov.uk/late-commercial-payments-interest-debt-recovery/charging-interest-commercial-debt" target="_blank" rel="noreferrer"> Check GOV.UK</a>
          </p>
          <button className="primary" onClick={saveCheck} disabled={!result}>Calculate recovery</button>
          {saved && <p className="saved">Saved anonymously for product research. No account was required.</p>}
        </div>

        <div className={"card result " + (!result ? "empty" : "")}>
          {!result ? (
            <>
              <div className="result-kicker">YOUR RESULT</div>
              <h2>Enter the invoice details.</h2>
              <p className="muted">Your result will appear here without requiring registration.</p>
            </>
          ) : result.overdue ? (
            <>
              <div className="result-kicker">INDICATIVE RECOVERY VALUE</div>
              <div className="big">{money(result.total)}</div>
              <p className="status">This invoice is {result.days} day{result.days === 1 ? "" : "s"} overdue.</p>
              <div className="breakdown">
                <div><span>Invoice</span><strong>{money(result.amount)}</strong></div>
                <div><span>Indicative statutory interest</span><strong>{money(result.interest)}</strong></div>
                <div><span>Fixed recovery cost</span><strong>{money(result.fee)}</strong></div>
                <div className="total"><span>Potential recovery</span><strong>{money(result.total)}</strong></div>
              </div>
              <p className="legal-note">
                UK commercial late-payment rules can provide for statutory interest at 8 percentage points
                above the Bank of England reference rate and fixed recovery costs of £40, £70 or £100 depending
                on the debt size. A contractual remedy or other circumstances can affect whether statutory interest applies.
              </p>
              <div className="next">
                <strong>Next step</strong>
                <span>Check the contract, confirm the payment date and decide whether to issue a recovery notice.</span>
              </div>
              <label className="email-capture">Email me this result (optional)
                <input name="email" type="email" placeholder="you@company.co.uk" value={form.email} onChange={update}/>
              </label>
            </>
          ) : (
            <>
              <div className="result-kicker">NO OVERDUE AMOUNT</div>
              <div className="big">{money(0)}</div>
              <p className="status">The invoice is not currently overdue based on the dates entered.</p>
              <p className="muted">If the payment date or contractual terms are different, update the inputs and recalculate.</p>
            </>
          )}
        </div>
      </section>

      <section className="how">
        <div><strong>1.</strong><span>Enter one invoice</span></div>
        <div><strong>2.</strong><span>See what may be recoverable</span></div>
        <div><strong>3.</strong><span>Take the next commercial action</span></div>
      </section>

      <footer>
        Cashflow Sentinel is a financial information tool, not legal advice. Always verify the applicable contract, dates, jurisdiction and current official guidance.
      </footer>
    </main>
  );
}
