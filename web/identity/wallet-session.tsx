"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { NETWORK } from "@/chain/deployment";
import { provider } from "@/chain/genlayer-client";

type WalletState = { address: string | null; chainId: number | null; connected: boolean; correctNetwork: boolean; busy: boolean; error: string };
type WalletCtx = WalletState & { connect(): Promise<void>; switchNetwork(): Promise<void> };
const Ctx = createContext<WalletCtx | null>(null);

export function WalletSession({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({ address:null, chainId:null, connected:false, correctNetwork:false, busy:false, error:"" });
  const sync = useCallback(async () => {
    const p = provider(); if (!p) { setState(s=>({...s,busy:false,error:"Injected wallet not found."})); return; }
    const [accounts, chainHex] = await Promise.all([p.request({method:"eth_accounts"}), p.request({method:"eth_chainId"})]);
    const chainId = Number.parseInt(chainHex,16); const address = accounts?.[0] || null;
    setState({address,chainId,connected:!!address,correctNetwork:chainId===NETWORK.chainId,busy:false,error:""});
  },[]);
  useEffect(()=>{sync().catch(()=>{}); const p=provider(); if(!p?.on)return; const h=()=>sync().catch(()=>{}); p.on("accountsChanged",h);p.on("chainChanged",h);return()=>{p.removeListener?.("accountsChanged",h);p.removeListener?.("chainChanged",h)}},[sync]);
  const switchNetwork = useCallback(async()=>{const p=provider();if(!p)throw new Error("Injected wallet not found.");const hex=`0x${NETWORK.chainId.toString(16)}`;try{await p.request({method:"wallet_switchEthereumChain",params:[{chainId:hex}]})}catch(e:any){if(e?.code===4902){await p.request({method:"wallet_addEthereumChain",params:[{chainId:hex,chainName:"GenLayer Studionet",nativeCurrency:{name:"GEN",symbol:"GEN",decimals:18},rpcUrls:[NETWORK.rpc],blockExplorerUrls:[NETWORK.explorer]}]})}else throw e}await sync()},[sync]);
  const connect = useCallback(async()=>{const p=provider();if(!p){setState(s=>({...s,error:"Install an injected EIP-1193 wallet to submit reviews."}));return;}setState(s=>({...s,busy:true,error:""}));try{await p.request({method:"eth_requestAccounts"});await sync();const chain=await p.request({method:"eth_chainId"});if(Number.parseInt(chain,16)!==NETWORK.chainId)await switchNetwork()}catch(e:any){setState(s=>({...s,busy:false,error:e?.message||"Wallet connection failed."}))}},[sync,switchNetwork]);
  const value=useMemo(()=>({...state,connect,switchNetwork}),[state,connect,switchNetwork]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useWalletSession(){const c=useContext(Ctx);if(!c)throw new Error("WalletSession missing");return c}
