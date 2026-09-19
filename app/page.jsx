"use client";
import {useState} from "react";
export default function Home(){
  const[f,setF]=useState({name:"",email:"",company:"",phone:"",projects:"",overdue:"",revenue:"",terms:"30",pressure:"yes",consent:false,website:""});
  const[r,setR]=useState(null); const[busy,setBusy]=useState(false);
  const set=e=>setF({...f,[e.target.name]:e.target.type==="checkbox"?e.target.checked:e.target.value});
  async function submit(e){e.preventDefault();setBusy(true);setR(null);try{const x=await fetch("/api/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(f)});const j=await x.json();if(!x.ok)throw Error(j.error);setR(j)}catch(e){setR({error:e.message})}finally{setBusy(false)}}
  return <main><section className="card"><div className="eyebrow">CASHFLOW SENTINEL</div><h1>Find the cash getting stuck in your business.</h1><p className="lead">A practical commercial audit that turns overdue invoices, payment terms and project exposure into a recovery priority.</p>
  <form onSubmit={submit}><div className="grid">{[["name","Your name","text"],["email","Work email","email"],["company","Company","text"],["phone","Phone","tel"],["projects","Active projects","number"],["overdue","Overdue cash (£)","number"],["revenue","Monthly revenue (£)","number"],["terms","Payment terms (days)","number"]].map(([n,l,t])=><label key={n}>{l}<input name={n} type={t} value={f[n]} required={["name","email","company"].includes(n)} onChange={set}/></label>)}</div>
  <label>Active payment pressure<select name="pressure" value={f.pressure} onChange={set}><option value="yes">Yes</option><option value="no">No</option></select></label>
  <div aria-hidden="true" style={{position:"absolute",left:"-9999px"}}><label>Website<input name="website" tabIndex="-1" autoComplete="off" value={f.website} onChange={set}/></label></div>
  <label className="check"><input type="checkbox" name="consent" checked={f.consent} onChange={set} required/> I agree to be contacted about this audit.</label>
  <button disabled={busy}>{busy?"Submitting...":"Run my cashflow audit"}</button></form>
  {r&&!r.error&&<div className="success"><h2>Audit received</h2><p>Your priority is <strong>{r.priority}</strong>. Estimated exposure: £{Number(r.cashExposure).toLocaleString()}.</p><p>Check your inbox for confirmation.</p></div>}
  {r?.error&&<div className="error">{r.error}</div>}</section></main>
}