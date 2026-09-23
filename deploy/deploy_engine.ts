import { readFileSync } from "fs";
import path from "path";
import { TransactionStatus } from "genlayer-js/types";
export default async function main(client:any){
  const registry=process.env.PATHCLOCK_REGISTRY_ADDRESS;
  const authority=process.env.PATHCLOCK_AUTHORITY_ADDRESS;
  if(!registry||!authority) throw new Error("Set PATHCLOCK_REGISTRY_ADDRESS and PATHCLOCK_AUTHORITY_ADDRESS");
  const code=new Uint8Array(readFileSync(path.resolve(process.cwd(),"contracts/PatchReviewEngine.py")));
  await client.initializeConsensusSmartContract();
  const hash=await client.deployContract({code,args:[registry,authority]});
  const receipt=await client.waitForTransactionReceipt({hash,status:TransactionStatus.FINALIZED,retries:240,interval:3000});
  console.log(JSON.stringify({name:"PatchReviewEngine",hash,receipt},null,2));
}
