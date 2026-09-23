"use client";
import { DEPLOYMENT, NETWORK, requireDeployment } from "./deployment";
import { provider, walletClient } from "./genlayer-client";
import type { TxPhase } from "@/domain/review/transitions";
export type TxUpdate={phase:TxPhase;hash?:string;message?:string;receipt?:any};
export type Watch=(u:TxUpdate)=>void;

async function waitForReceipt(client:any,args:any){
  let last:any;
  for(let attempt=0;attempt<4;attempt++){
    try{return await client.waitForTransactionReceipt(args)}catch(error){
      last=error;
      const message=String((error as any)?.message||error||"").toLowerCase();
      const transient=/failed to fetch|unknown rpc|network|connection reset|econnreset/.test(message);
      if(!transient||attempt===3)throw error;
      await new Promise(resolve=>setTimeout(resolve,1500));
    }
  }
  throw last;
}

function executionSucceeded(receipt:any){
  const n=String(receipt?.txExecutionResultName||receipt?.executionResultName||receipt?.execution_result||"").toUpperCase();
  if(["FINISHED_WITH_RETURN","SUCCESS","OK","SUCCEEDED"].some(x=>n===x||n.includes(x)))return true;
  // Current GenLayer receipts expose the authoritative VM result inside
  // consensus_data.leader_receipt rather than txExecutionResultName.
  const consensus=receipt?.consensus_data||receipt?.consensusData;
  const leaders=consensus?.leader_receipt||consensus?.leaderReceipt;
  if(!Array.isArray(leaders)||leaders.length===0)return false;
  // GenLayer includes quorum-cancelled validator receipts alongside the
  // authoritative leader receipt. Those validator entries may be ERROR with
  // VALIDATOR_QUORUM_REACHED even when the contract execution succeeded.
  const leader=leaders.find((entry:any)=>String(entry?.mode||"").toLowerCase()==="leader");
  if(leader)return String(leader?.execution_result||leader?.executionResult||"").toUpperCase()==="SUCCESS";
  return leaders.some((entry:any)=>String(entry?.execution_result||entry?.executionResult||"").toUpperCase()==="SUCCESS");
}
async function waitFinal(client:any,hash:string,watch:Watch){watch({phase:"CONSENSUS_RUNNING",hash});const accepted=await waitForReceipt(client,{hash,status:"ACCEPTED" as any,retries:120,interval:3000});watch({phase:"ACCEPTED_PROVISIONAL",hash,receipt:accepted,message:"Consensus accepted this result, but it is not final."});let finalized:any;try{finalized=await waitForReceipt(client,{hash,status:"FINALIZED" as any,retries:18,interval:3000})}catch{watch({phase:"READY_TO_FINALIZE",hash,receipt:accepted,message:"Appeal window complete or finalization is available."});watch({phase:"FINALIZING",hash});await client.finalizeTransaction({txId:hash});finalized=await waitForReceipt(client,{hash,status:"FINALIZED" as any,retries:80,interval:3000})}if(!executionSucceeded(finalized))throw new Error("Transaction finalized but contract execution did not succeed.");watch({phase:"FINALIZED",hash,receipt:finalized});return finalized}
async function waitTriggeredChildren(client:any,parentHash:string,watch:Watch){
  if(typeof client.getTriggeredTransactionIds!=="function") return;
  let children:string[]=[];
  for(let attempt=0;attempt<20 && children.length===0;attempt++){
    try{children=await client.getTriggeredTransactionIds({hash:parentHash})||[]}catch{}
    if(children.length===0) await new Promise(resolve=>setTimeout(resolve,3000));
  }
  if(children.length===0){watch({phase:"STATE_REREAD",hash:parentHash,message:"Parent finalized; waiting for the release-authority child transaction."});return;}
  for(const child of children){
    watch({phase:"SUBMITTED",hash:child,message:"Finality-triggered child transaction detected."});
    const receipt=await waitForReceipt(client,{hash:child,status:"FINALIZED" as any,retries:80,interval:3000});
    if(!executionSucceeded(receipt)) throw new Error("Release-authority child transaction finalized but execution failed.");
    watch({phase:"FINALIZED",hash:child,receipt,message:"Release-authority child transaction finalized."});
  }
}
async function assertWallet(account:string){requireDeployment();const injected=provider();if(!injected)throw new Error("Injected wallet not found.");const [accounts,chainHex]=await Promise.all([injected.request({method:"eth_accounts"}),injected.request({method:"eth_chainId"})]);if(Number.parseInt(chainHex,16)!==NETWORK.chainId)throw new Error("Switch to GenLayer Studionet before submitting this transaction.");if(!accounts?.[0]||accounts[0].toLowerCase()!==account.toLowerCase())throw new Error("The connected wallet changed. Reconnect the expected account before submitting.");return walletClient(account)}
async function write(address:string,account:string,functionName:string,args:any[],watch:Watch,followChildren=false){const client:any=await assertWallet(account);const call={address,functionName,args,value:0n};watch({phase:"AWAITING_SIGNATURE"});const hash=await client.writeContract(call);watch({phase:"SUBMITTED",hash});const finalized=await waitFinal(client,hash,watch);if(followChildren)await waitTriggeredChildren(client,hash,watch);return finalized}
export async function estimateAuthorizationConsumption(account:string,reviewKey:string){const client:any=await assertWallet(account);return client.simulateWriteContract({address:DEPLOYMENT.authority,functionName:"consume_authorization",args:[reviewKey]})}
export async function freezeSpec(account:string,input:{specId:string;repositoryUrl:string;advisoryUrl:string;securityRequirement:string;baselineRef:string;allowedOrigins:string[]},watch:Watch){return write(DEPLOYMENT.registry,account,"freeze_spec",[input.specId,input.repositoryUrl,input.advisoryUrl,input.securityRequirement,input.baselineRef,JSON.stringify({required:["advisory","patch","tests","deployment"],version:1}),JSON.stringify(input.allowedOrigins)],watch)}
export async function reviewCandidate(account:string,input:{reviewKey:string;specId:string;candidateVersion:string;candidateCommit:string;patchUrl:string;testsUrl:string;deploymentUrl:string},watch:Watch){return write(DEPLOYMENT.reviewEngine,account,"review_candidate",[input.reviewKey,input.specId,input.candidateVersion,input.candidateCommit,input.patchUrl,input.testsUrl,input.deploymentUrl],watch,true)}
export async function consumeAuthorization(account:string,reviewKey:string,watch:Watch){return write(DEPLOYMENT.authority,account,"consume_authorization",[reviewKey],watch)}
