"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DEPLOYMENT, explorerAddress } from "@/chain/deployment";
import { getReviewBundle } from "@/chain/read-model";
import { IdentityChip } from "@/identity/IdentityChip";
import type { ReviewBundle } from "@/domain/review/model";
import { EvidenceDrawer } from "./evidence-drawer";
import { AuthorizationConsumer } from "@/features/authorization/AuthorizationConsumer";

const checks = (bundle: ReviewBundle) => [
  ["Requirement satisfied", bundle.review.requirement_satisfied],
  ["Candidate identity", bundle.review.candidate_identity_verified],
  ["Regression tests", bundle.review.regression_tests_pass],
  ["Patch consistency", bundle.review.patch_evidence_consistent],
  ["Deployment identity", bundle.review.deployment_evidence_consistent],
] as const;

export function ReviewRoomScreen({ reviewKey }: { reviewKey: string }) {
  const [data, setData] = useState<ReviewBundle | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawer, setDrawer] = useState(false);
  async function load() {
    setLoading(true);
    try {
      const bundle = await getReviewBundle(reviewKey);
      if (!bundle) throw new Error("This review could not be found on Studionet.");
      setData(bundle);
      setError("");
    } catch (reason: any) {
      setError(reason?.message || "Unable to read this review from Studionet. Check your connection and retry.");
    } finally { setLoading(false); }
  }
  useEffect(() => { void load(); const timer = setInterval(load, 12000); return () => clearInterval(timer); }, [reviewKey]);
  if (!data && error) return <div className="page-shell"><header className="mast"><Link className="wordmark" href="/"><img src="/mark.svg" alt=""/>PATHCLOCK</Link><IdentityChip/></header><div className="error-box">{error}</div><button className="secondary-action" onClick={() => void load()} disabled={loading}>{loading ? "Retrying…" : "Try again"}</button><p className="technical">The page will also retry automatically.</p></div>;
  if (!data) return <div className="loading">Reading review room…</div>;
  const { review, spec, authorization } = data;
  const hasFinality = !!authorization;
  return <div className="page-shell">
    <header className="mast"><Link className="wordmark" href="/"><img src="/mark.svg" alt=""/>PATHCLOCK</Link><IdentityChip/></header>
    <main className="room">
      {error && <div className="error-box" role="status">Couldn’t refresh the latest chain state. Showing the last loaded review. <button className="quiet-button" onClick={() => void load()} disabled={loading}>{loading ? "Retrying…" : "Retry now"}</button></div>}
      <div className="room-nav"><Link href="/console">← Release queue</Link><a href={explorerAddress(DEPLOYMENT.reviewEngine)} target="_blank" rel="noreferrer">Review engine ↗</a></div>
      <div className="room-title"><div><div className="eyebrow">{spec?.baseline_ref || review.spec_id} → {review.candidate_version}</div><h1>{review.spec_id}</h1><div className="commit">candidate {review.candidate_commit}</div></div><span className={`status-chip ${review.outcome.toLowerCase()}`}>{review.outcome}</span></div>
      <div className="stage-rail"><div className="stage done">01 FROZEN</div><div className="stage done">02 EVIDENCE</div><div className="stage done">03 CONSENSUS</div><div className={`stage ${hasFinality ? "done" : "active"}`}>04 FINALITY</div><div className={`stage ${hasFinality ? "done" : ""}`}>05 RELEASE</div></div>
      <section className="review-workbench">
        <div className="work-panel"><div className="eyebrow">frozen requirement</div><div className="requirement-quote">{spec?.security_requirement || "Specification unavailable"}</div><div className="evidence-list">{Object.entries(review.evidence_urls).map(([name, url]) => <div className="evidence-row" key={name}><span>{name}</span><code>{url}</code><button className="secondary-action" onClick={() => setDrawer(true)}>Inspect</button></div>)}</div></div>
        <aside className="work-panel consensus-panel"><div className="verdict-mark">consensus result</div><div className={`verdict-word ${review.outcome.toLowerCase()}`}>{review.outcome.replaceAll("_", " ")}</div>{checks(data).map(([label, ok]) => <div className="check" key={label}><span>{label}</span><b>{ok ? "YES" : "NO"}</b></div>)}
          {!authorization && review.outcome === "REMEDIATED" && <div className="provisional"><b>No release authority yet.</b><br/>The review result is not complete until its finality-triggered authorization appears in ReleaseAuthority.</div>}
          {authorization && <><div className="info-box"><b>Release authority exists.</b><br/>Receipt {authorization.receipt_key.slice(0, 16)}…</div><Link className="primary-action" href={`/proof/${authorization.receipt_key}`}>View public proof →</Link><AuthorizationConsumer authorization={authorization} onUpdated={bundle => { if (bundle) setData(bundle); }}/></>}
          <div className="technical">evidence digest<br/>{review.evidence_digest}</div>
        </aside>
      </section>
    </main>
    {drawer && <EvidenceDrawer bundle={data} onClose={() => setDrawer(false)}/>}
  </div>;
}
