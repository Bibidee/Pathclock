"use client";
import Link from "next/link";import {useEffect,useMemo,useState} from "react";import {IdentityChip} from "@/identity/IdentityChip";import {listReviews} from "@/chain/read-model";import {deploymentReady} from "@/chain/deployment";import type{Review}from "@/domain/review/model";import {ComposeReview} from "@/features/compose-review/ComposeReview";import {useRouter} from "next/navigation";
export function ReleaseConsoleScreen(){
  const[reviews,setReviews]=useState<Review[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[query,setQuery]=useState(""),[compose,setCompose]=useState(false);
  const router=useRouter();
  async function refresh(){
    setLoading(true);
    try{setReviews(await listReviews());setError("")}
    catch(e:any){setError(e?.message||"Unable to read reviews from Studionet. Check your connection and retry.")}
    finally{setLoading(false)}
  }
  useEffect(()=>{
    if(!deploymentReady()){setLoading(false);return}
    void refresh();
    const timer=setInterval(()=>void refresh(),15000);
    return()=>clearInterval(timer);
  },[]);
  const filtered=useMemo(()=>reviews.filter(r=>JSON.stringify(r).toLowerCase().includes(query.toLowerCase())),[reviews,query]);
  return <div className="page-shell"><header className="mast"><Link className="wordmark" href="/"><img src="/mark.svg" alt=""/>PATHCLOCK</Link><div className="mast-actions"><span className="network-pulse"><i/>STUDIONET 61999</span><IdentityChip/></div></header><main className="workspace"><div className="workspace-title"><div><div className="eyebrow">release queue</div><h1>Security reviews</h1></div><p>Each review binds a frozen security requirement to one candidate release and one evidence set.</p></div><div className="queue-toolbar"><input className="searchbox" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search version, commit, outcome…"/><button className="primary-action" style={{marginTop:0}} onClick={()=>setCompose(true)}>+ Start review</button></div>{!deploymentReady()&&<div className="info-box">Deployment addresses are intentionally blank in this handoff. The finishing agent must deploy the three contracts to Studionet 61999 and populate the environment before live reads/writes are enabled.</div>}{error&&<div className="error-box" role="alert">Couldn’t refresh the release queue. {reviews.length?"Showing the previously loaded reviews. ":"No review data has been loaded yet. "}<button className="quiet-button" onClick={()=>void refresh()} disabled={loading}>{loading?"Retrying…":"Try again"}</button><div className="technical">{error}</div></div>}{loading&&!reviews.length?<div className="loading">Reading final contract state…</div>:filtered.length?<div className="review-grid">{filtered.map(r=><Link className="review-tile" key={r.review_key} href={`/release/${encodeURIComponent(r.review_key)}`}><div className="tile-top"><div><div className="tile-label">{r.spec_id}</div><div className="tile-title">{r.candidate_version}</div><div className="tile-meta">{r.candidate_commit}</div></div><span className={`status-chip ${r.outcome.toLowerCase()}`}>{r.outcome}</span></div></Link>)}</div>:error?<div className="loading">Waiting to load reviews from Studionet…</div>:!loading?<div className="empty-state">No live review records yet. Start the first review after deployment.</div>:null}</main>{compose&&<ComposeReview onClose={()=>setCompose(false)} onComplete={key=>{setCompose(false);router.push(`/release/${encodeURIComponent(key)}`)}}/>}</div>
}
