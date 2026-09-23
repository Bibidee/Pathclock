"use client";

import { useEffect, useMemo, useState } from "react";
import { consumeAuthorization, estimateAuthorizationConsumption, type TxUpdate } from "@/chain/commands";
import { explorerTx, NETWORK } from "@/chain/deployment";
import { getReviewBundle } from "@/chain/read-model";
import { useWalletSession } from "@/identity/wallet-session";
import type { Authorization } from "@/domain/review/model";
import { phaseLabel, type TxPhase } from "@/domain/review/transitions";

export function AuthorizationConsumer({ authorization, onUpdated }: { authorization: Authorization; onUpdated(bundle: Awaited<ReturnType<typeof getReviewBundle>>): void }) {
  const wallet = useWalletSession();
  const [preflight, setPreflight] = useState<"checking" | "ready" | "failed">("checking");
  const [phase, setPhase] = useState<TxPhase>("IDLE");
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isOwner = !!wallet.address && wallet.address.toLowerCase() === authorization.release_owner.toLowerCase();
  const canConsume = isOwner && wallet.correctNetwork && !authorization.consumed && !busy;

  useEffect(() => {
    let active = true;
    setPreflight("checking");
    setError("");
    if (isOwner && wallet.correctNetwork && !authorization.consumed) {
      estimateAuthorizationConsumption(wallet.address!, authorization.review_key)
        .then(() => { if (active) setPreflight("ready"); })
        .catch(reason => { if (active) { setError(String(reason?.message || reason)); setPreflight("failed"); } });
    } else {
      setPreflight("ready");
    }
    return () => { active = false; };
  }, [authorization.consumed, authorization.review_key, isOwner, wallet.address, wallet.correctNetwork]);

  const update = (value: TxUpdate) => {
    setPhase(value.phase);
    if (value.hash) setHash(value.hash);
    if (value.message) setError(value.message);
  };

  async function consume() {
    if (!wallet.address || !canConsume || preflight !== "ready") return;
    setBusy(true); setError(""); setHash("");
    let submitted = false;
    try {
      await consumeAuthorization(wallet.address, authorization.review_key, value => { if (value.phase === "SUBMITTED") submitted = true; update(value); });
      setPhase("STATE_REREAD");
      const bundle = await getReviewBundle(authorization.review_key);
      if (!bundle?.authorization || !bundle.authorization.consumed) throw new Error("Transaction finalized, but the authority record did not confirm consumption. Check the explorer before retrying.");
      onUpdated(bundle);
      setPhase("COMPLETE");
    } catch (reason: any) {
      setError(reason?.message || "Authorization consumption failed.");
      setPhase(submitted ? "UNDETERMINED" : "FAILED");
    } finally { setBusy(false); }
  }

  return <section className="consumer-card" aria-live="polite">
    <div className="eyebrow">release authorization</div>
    <h2>{authorization.consumed ? "Authorization consumed" : "Release owner action"}</h2>
    <p>{authorization.consumed ? `This receipt was consumed${authorization.consumed_at ? ` at ${authorization.consumed_at}` : ""}. It cannot be used again.` : "Only the release owner can consume this one-time authorization. Consumption records the release action on Studionet; it does not change the review verdict."}</p>
    <div className="consumer-facts">
      <div><span>release owner</span><code>{authorization.release_owner}</code></div>
      <div><span>current account</span><code>{wallet.address || "Not connected"}</code></div>
      <div><span>network</span><code>{wallet.chainId === null ? "Not detected" : `${wallet.chainId}${wallet.correctNetwork ? " · Studionet" : " · switch required"}`}</code></div>
      {!authorization.consumed && isOwner && wallet.correctNetwork && <div><span>transaction preflight</span><code>{preflight === "checking" ? "Checking contract call…" : preflight === "ready" ? "Simulation passed · wallet shows network fee before signature" : "Simulation failed · transaction blocked"}</code></div>}
    </div>
    {!authorization.consumed && !wallet.connected && <div className="info-box">Connect the release owner’s wallet to check fees and continue.</div>}
    {!authorization.consumed && wallet.connected && !isOwner && <div className="info-box">This account is not the release owner. No consume control is available for it.</div>}
    {!authorization.consumed && isOwner && !wallet.correctNetwork && <div className="info-box">Switch the owner wallet to {NETWORK.name} (chain {NETWORK.chainId}) before continuing.</div>}
    {!authorization.consumed && isOwner && wallet.correctNetwork && error && <div className="error-box">{error}</div>}
    {!authorization.consumed && isOwner && wallet.correctNetwork && <button className="primary-action" onClick={consume} disabled={!canConsume || preflight !== "ready"}>{busy ? phaseLabel(phase) : "Consume authorization"}</button>}
    {hash && <div className="consumer-tx"><a href={explorerTx(hash)} target="_blank" rel="noreferrer">View transaction ↗</a><span>{phaseLabel(phase)}</span></div>}
  </section>;
}
