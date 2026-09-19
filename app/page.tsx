"use client";

import { useMemo, useState } from "react";

type Rate = { role:string; department:string; cost:number; sell:number };
type Line = { id:number; category:string; description:string; qty:number; unit:number; waste:number };

const seedRates:Rate[]=[
 {role:"Project Manager",department:"Delivery",cost:58,sell:82},
 {role:"Estimator / Proposal Engineer",department:"Commercial",cost:52,sell:76},
 {role:"Design Engineer",department:"Engineering",cost:48,sell:70},
 {role:"Electrical Engineer",department:"Engineering",cost:55,sell:80},
 {role:"Mechanical Engineer",department:"Engineering",cost:55,sell:80},
 {role:"CAD Technician",department:"Engineering",cost:34,sell:52},
 {role:"Site Supervisor",department:"Site",cost:46,sell:68},
 {role:"Site Technician",department:"Site",cost:38,sell:58},
 {role:"Commissioning Engineer",department:"Site",cost:52,sell:76},
 {role:"Procurement",department:"Supply Chain",cost:36,sell:52},
];

const seedLines:Line[]=[
 {id:1,category:"Equipment",description:"Chemical dosing skid / package",qty:1,unit:25000,waste:0},
 {id:2,category:"Materials",description:"Pipework, valves & fittings",qty:1,unit:6500,waste:5},
 {id:3,category:"Labour",description:"Engineering & design",qty:40,unit:48,waste:0},
 {id:4,category:"Labour",description:"Manufacture / assembly",qty:80,unit:38,waste:0},
 {id:5,category:"Site",description:"Installation & commissioning",qty:32,unit:52,waste:0},
];

export default function Home(){
 const [tab,setTab]=useState("estimate");
 const [sector,setSector]=useState("Water & Wastewater");
 const [project,setProject]=useState("New Dosing System");
 const [client,setClient]=useState("Example Client");
 const [markup,setMarkup]=useState(15);
 const [contingency,setContingency]=useState(5);
 const [overhead,setOverhead]=useState(8);
 const [lines,setLines]=useState(seedLines);
 const [rates,setRates]=useState(seedRates);
 const [rateSearch,setRateSearch]=useState("");
 const [saved,setSaved]=useState(false);

 const direct=useMemo(()=>lines.reduce((s,l)=>s+l.qty*l.unit*(1+l.waste/100),0),[lines]);
 const oh=direct*overhead/100, cont=(direct+oh)*contingency/100, cost=direct+oh+cont, sell=cost*(1+markup/100), gross=sell-cost, margin=sell?gross/sell*100:0;
 const labour=lines.filter(l=>l.category==="Labour"||l.category==="Site").reduce((s,l)=>s+l.qty*l.unit*(1+l.waste/100),0);

 function updateLine(id:number,key:keyof Line,value:string){setLines(ls=>ls.map(l=>l.id===id?{...l,[key]:key==="description"||key==="category"?value:Number(value)}:l))}
 function addLine(){setLines(ls=>[...ls,{id:Date.now(),category:"Materials",description:"New cost item",qty:1,unit:0,waste:0}])}
 function removeLine(id:number){setLines(ls=>ls.filter(l=>l.id!==id))}
 function updateRate(i:number,key:"cost"|"sell",value:string){setRates(rs=>rs.map((r,n)=>n===i?{...r,[key]:Number(value)}:r))}
 const filteredRates=rates.filter(r=>(r.role+" "+r.department).toLowerCase().includes(rateSearch.toLowerCase()));

 return <main>
  <header className="topbar">
   <div className="brand"><div className="mark">AZ</div><div><strong>ESTIMATE</strong><span>GROUP COMMERCIAL ENGINE</span></div></div>
   <div className="top-actions"><span className="live"><i/> LIVE MODEL</span><button className="ghost">Import</button><button className="primary" onClick={()=>setSaved(true)}>{saved?"Saved ✓":"Save Estimate"}</button></div>
  </header>

  <section className="hero">
   <div><div className="eyebrow">RSE GROUP • ESTIMATION PLATFORM</div><h1>Build a sharper estimate.</h1><p>One controlled model for equipment, engineering, labour, site delivery and commercial margin.</p></div>
   <div className="hero-meta"><span>Estimate ID <b>EST-260919-01</b></span><span>Version <b>01</b></span><span>Status <b className="green">Draft</b></span></div>
  </section>

  <nav className="tabs">
   {[["estimate","Estimate"],["dashboard","Dashboard"],["rates","Cost / Employee Rates"]].map(([k,t])=><button key={k} className={tab===k?"active":""} onClick={()=>setTab(k)}>{t}</button>)}
  </nav>

  {tab==="estimate" && <div className="workspace">
   <section className="panel project-panel">
    <div className="panel-head"><div><span className="eyebrow">PROJECT CONTROL</span><h2>Estimate setup</h2></div><span className="badge">LIVE</span></div>
    <div className="formgrid">
     <label>Sector<select value={sector} onChange={e=>setSector(e.target.value)}><option>Water & Wastewater</option><option>Industrial / Process</option><option>Infrastructure</option><option>Energy</option><option>Group / Other</option></select></label>
     <label>Client / framework<input value={client} onChange={e=>setClient(e.target.value)}/></label>
     <label>Project / package<input value={project} onChange={e=>setProject(e.target.value)}/></label>
     <label>Currency<select><option>GBP £</option><option>EUR €</option><option>USD $</option></select></label>
    </div>
   </section>

   <section className="stats">
    <div><span>Direct cost</span><strong>£{direct.toLocaleString(undefined,{maximumFractionDigits:0})}</strong><small>Materials + labour + site</small></div>
    <div><span>Total cost</span><strong>£{cost.toLocaleString(undefined,{maximumFractionDigits:0})}</strong><small>Including OH + contingency</small></div>
    <div><span>Sell value</span><strong>£{sell.toLocaleString(undefined,{maximumFractionDigits:0})}</strong><small>{markup}% commercial markup</small></div>
    <div className="accent"><span>Gross margin</span><strong>{margin.toFixed(1)}%</strong><small>£{gross.toLocaleString(undefined,{maximumFractionDigits:0})} contribution</small></div>
   </section>

   <section className="panel">
    <div className="panel-head"><div><span className="eyebrow">COST BUILD-UP</span><h2>Estimate lines</h2></div><button className="secondary" onClick={addLine}>＋ Add line</button></div>
    <div className="table-wrap"><table><thead><tr><th>Category</th><th>Description</th><th>Qty</th><th>Rate</th><th>Waste / risk</th><th>Extended</th><th></th></tr></thead><tbody>
     {lines.map(l=><tr key={l.id}><td><select value={l.category} onChange={e=>updateLine(l.id,"category",e.target.value)}><option>Equipment</option><option>Materials</option><option>Labour</option><option>Site</option><option>Subcontract</option><option>Other</option></select></td><td><input value={l.description} onChange={e=>updateLine(l.id,"description",e.target.value)}/></td><td><input className="num" type="number" value={l.qty} onChange={e=>updateLine(l.id,"qty",e.target.value)}/></td><td><div className="money">£<input className="num" type="number" value={l.unit} onChange={e=>updateLine(l.id,"unit",e.target.value)}/></div></td><td><div className="pct"><input className="num" type="number" value={l.waste} onChange={e=>updateLine(l.id,"waste",e.target.value)}/>%</div></td><td className="extended">£{(l.qty*l.unit*(1+l.waste/100)).toLocaleString(undefined,{maximumFractionDigits:0})}</td><td><button className="delete" onClick={()=>removeLine(l.id)}>×</button></td></tr>)}
    </tbody></table></div>
   </section>

   <div className="bottom-grid">
    <section className="panel"><div className="panel-head"><div><span className="eyebrow">COMMERCIAL SETTINGS</span><h2>Model controls</h2></div></div>
     <div className="controls"><label>Overhead <b>{overhead}%</b><input type="range" min="0" max="25" value={overhead} onChange={e=>setOverhead(+e.target.value)}/></label><label>Contingency <b>{contingency}%</b><input type="range" min="0" max="20" value={contingency} onChange={e=>setContingency(+e.target.value)}/></label><label>Markup <b>{markup}%</b><input type="range" min="0" max="40" value={markup} onChange={e=>setMarkup(+e.target.value)}/></label></div>
    </section>
    <section className="panel snapshot"><span className="eyebrow">DELIVERY SNAPSHOT</span><div><span>Labour / site</span><b>£{labour.toLocaleString(undefined,{maximumFractionDigits:0})}</b></div><div><span>Labour share</span><b>{direct?((labour/direct)*100).toFixed(1):"0.0"}%</b></div><div><span>Contingency allowance</span><b>£{cont.toLocaleString(undefined,{maximumFractionDigits:0})}</b></div></section>
   </div>
  </div>}

  {tab==="dashboard" && <div className="dashboard">
   <section className="stats"><div><span>Estimates this month</span><strong>28</strong><small>+12% vs previous month</small></div><div><span>Pipeline value</span><strong>£4.82m</strong><small>14 live opportunities</small></div><div><span>Average gross margin</span><strong>17.8%</strong><small>Across current estimates</small></div><div className="accent"><span>Conversion</span><strong>64%</strong><small>Last 90 days</small></div></section>
   <div className="dash-grid"><section className="panel chart"><div className="panel-head"><div><span className="eyebrow">COMMERCIAL PERFORMANCE</span><h2>Estimate activity</h2></div><span className="muted">Last 6 months</span></div><div className="bars">{[42,58,51,76,68,91].map((v,i)=><div key={i}><span style={{height:v+"%"}}/><small>{["Apr","May","Jun","Jul","Aug","Sep"][i]}</small></div>)}</div></section><section className="panel"><div className="panel-head"><div><span className="eyebrow">CONTROL ROOM</span><h2>Key indicators</h2></div></div><div className="indicator"><span>Estimates needing review</span><b>6</b></div><div className="indicator"><span>Margin below target</span><b>3</b></div><div className="indicator"><span>Rates due for review</span><b>4</b></div><div className="indicator"><span>Open commercial risks</span><b>9</b></div></section></div>
   <section className="panel"><div className="panel-head"><div><span className="eyebrow">RECENT ESTIMATES</span><h2>Activity</h2></div></div><table><thead><tr><th>Estimate</th><th>Client</th><th>Sector</th><th>Value</th><th>Margin</th><th>Status</th></tr></thead><tbody>{[["EST-260919-01","Example Client","Water & Wastewater","£184,200","18.4%","Draft"],["EST-260918-07","Regional Water Co.","Water & Wastewater","£412,800","16.1%","Submitted"],["EST-260917-03","Process Partner","Industrial / Process","£96,450","21.8%","Won"],["EST-260916-11","Framework North","Infrastructure","£275,900","14.7%","Review"]].map(r=><tr key={r[0]}>{r.map((c,i)=><td key={i} className={i===5?"status":""}>{c}</td>)}</tr>)}</tbody></table></section>
  </div>}

  {tab==="rates" && <div className="rates-page"><section className="panel"><div className="panel-head"><div><span className="eyebrow">MASTER DATA</span><h2>Cost / employee rates</h2><p className="sub">Central rates drive every estimate. Edit cost and sell rates here, then publish a controlled version for the group.</p></div><button className="primary" onClick={()=>setSaved(true)}>{saved?"Published ✓":"Publish rates"}</button></div><div className="rate-tools"><input placeholder="Search role or department..." value={rateSearch} onChange={e=>setRateSearch(e.target.value)}/><button className="secondary">＋ Add role</button></div><div className="table-wrap"><table><thead><tr><th>Role</th><th>Department</th><th>Employee cost / hr</th><th>Charge / sell rate</th><th>Gross contribution</th><th>Utilisation</th></tr></thead><tbody>{filteredRates.map((r,i)=><tr key={r.role}><td><b>{r.role}</b></td><td><span className="pill">{r.department}</span></td><td><div className="money">£<input className="num" type="number" value={r.cost} onChange={e=>updateRate(rates.indexOf(r),"cost",e.target.value)}/></div></td><td><div className="money">£<input className="num" type="number" value={r.sell} onChange={e=>updateRate(rates.indexOf(r),"sell",e.target.value)}/></div></td><td className="extended">£{(r.sell-r.cost).toFixed(0)}</td><td><div className="util"><span style={{width:(55+(i*5)%35)+"%"}}/></div></td></tr>)}</tbody></table></div></section><div className="note"><b>Designed for group rollout.</b> Next layer can add business unit, grade, location, effective date, approval owner, rate history and locked published versions without changing the estimating model.</div></div>}
 </main>
}
