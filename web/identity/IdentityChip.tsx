"use client";
import { useWalletSession } from "./wallet-session";
export function IdentityChip(){const w=useWalletSession();if(!w.connected)return <button className="identity-chip" onClick={()=>w.connect()} disabled={w.busy}>{w.busy?"Connecting…":"Connect"}</button>;if(!w.correctNetwork)return <button className="identity-chip" onClick={()=>w.switchNetwork()}>Switch to 61999</button>;return <span className="identity-chip">● {w.address!.slice(0,6)}…{w.address!.slice(-4)}</span>}
