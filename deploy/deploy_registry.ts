import { readFileSync } from "fs";
import path from "path";
import { TransactionStatus } from "genlayer-js/types";
export default async function main(client:any){
  const code=new Uint8Array(readFileSync(path.resolve(process.cwd(),"contracts/RemediationRegistry.py")));
  await client.initializeConsensusSmartContract();
  const hash=await client.deployContract({code,args:[]});
  const receipt=await client.waitForTransactionReceipt({hash,status:TransactionStatus.FINALIZED,retries:240,interval:3000});
  console.log(JSON.stringify({name:"RemediationRegistry",hash,receipt},null,2));
}
