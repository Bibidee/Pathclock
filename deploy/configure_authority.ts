import { TransactionStatus } from "genlayer-js/types";
export default async function main(client:any){
  const authority=process.env.PATHCLOCK_AUTHORITY_ADDRESS;
  const engine=process.env.PATHCLOCK_REVIEW_ENGINE_ADDRESS;
  if(!authority||!engine) throw new Error("Set PATHCLOCK_AUTHORITY_ADDRESS and PATHCLOCK_REVIEW_ENGINE_ADDRESS");
  const write={address:authority,functionName:"configure_review_engine",args:[engine],value:0n};
  const estimate=await client.estimateTransactionFeesForWrite(write);
  const hash=await client.writeContract({...write,fees:{distribution:estimate.distribution,feeValue:estimate.feeValue}});
  const receipt=await client.waitForTransactionReceipt({hash,status:TransactionStatus.FINALIZED,retries:200,interval:3000});
  console.log(JSON.stringify({name:"configure_review_engine",hash,receipt},null,2));
}
