"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DEPLOYMENT, explorerAddress } from "@/chain/deployment";
import { findProof } from "@/chain/read-model";
import type { ReviewBundle } from "@/domain/review/model";
import { AuthorizationConsumer } from "@/features/authorization/AuthorizationConsumer";

export function PublicProofScreen({ receiptKey }: { receiptKey: string }) {
  const [data, setData] = useState<ReviewBundle | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const bundle = await findProof(receiptKey);
      if (!bundle?.authorization) throw new Error("This receipt could not be verified on Studionet. Check your connection and retry.");
      setData(bundle);
      setError("");
    } catch (reason: any) { setError(reason?.message || "Unable to verify this proof from Studionet."); }
    finally { setLoading(false); }
  }, [receiptKey]);
  useEffect(() => { void load(); }, [load]);
  if (!data?.authorization && error) return <main className="proof-wrap"><div className="proof-top"><Link className="wordmark" href="/"><img src="/mark.svg" alt=""/>PATHCLOCK</Link><span className="network-pulse"><i/>PUBLIC FINAL PROOF</span></div><div className="error-box" role="alert">{error}</div><button className="secondary-action" onClick={() => void load()} disabled={loading}>{loading ? "Retrying…" : "Try again"}</button><p className="technical">The proof page will retry when you press the button.</p></main>;
  if (!data?.authorization) return <div className="loading">Verifying finalized PATHCLOCK receipt…</div>;
  const { review, spec, authorization } = data;
  return <main className="proof-wrap">
    <div className="proof-top"><Link className="wordmark" href="/"><img src="/mark.svg" alt=""/>PATHCLOCK</Link><span className="network-pulse"><i/>PUBLIC FINAL PROOF</span></div>
    <section className="proof-card"><div className="final">FINALIZED CONSEQUENCE PRESENT</div><h1>{review.outcome.replaceAll("_", " ")}</h1><p>Candidate {review.candidate_version} received PATHCLOCK release authority because the GenLayer-reviewed remediation result produced a finality-gated authorization record.</p>
      <div className="proof-facts"><div className="proof-fact"><span>review</span><code>{review.review_key}</code></div><div className="proof-fact"><span>requirement</span><div>{spec?.security_requirement}</div></div><div className="proof-fact"><span>candidate</span><code>{review.candidate_version} · {review.candidate_commit}</code></div><div className="proof-fact"><span>evidence commitment</span><code>{authorization.evidence_digest}</code></div><div className="proof-fact"><span>receipt key</span><code>{authorization.receipt_key}</code></div><div className="proof-fact"><span>authorized at</span><code>{authorization.authorized_at}</code></div><div className="proof-fact"><span>consumed</span><code>{String(authorization.consumed)}</code></div></div>
      <a className="primary-action" href={explorerAddress(DEPLOYMENT.authority)} target="_blank" rel="noreferrer">Verify authority contract ↗</a>
      <AuthorizationConsumer authorization={authorization} onUpdated={bundle => { if (bundle?.authorization) setData(bundle); else void load(); }}/>
    </section>
  </main>;
}
