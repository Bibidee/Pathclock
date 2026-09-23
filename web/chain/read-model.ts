import { DEPLOYMENT, requireDeployment } from "./deployment";
import { readClient } from "./genlayer-client";
import type { Authorization, FrozenSpec, Review, ReviewBundle } from "@/domain/review/model";
function parse<T>(value:any):T|null{if(!value)return null;if(typeof value==="string")return JSON.parse(value) as T;return value as T}
async function readContractWithRetry(client:any,args:any){
  let last:any;
  for(let attempt=0;attempt<4;attempt++){
    try{return await client.readContract(args)}catch(error){
      last=error;
      const message=String((error as any)?.message||error||"").toLowerCase();
      const transient=/failed to fetch|unknown rpc|network|connection reset|econnreset/.test(message);
      if(!transient||attempt===3)throw error;
      await new Promise(resolve=>setTimeout(resolve,1500));
    }
  }
  throw last;
}
export async function listReviews():Promise<Review[]>{requireDeployment();const c:any=readClient();const raw=await readContractWithRetry(c,{address:DEPLOYMENT.reviewEngine,functionName:"list_reviews",args:[0,50]});return (parse<{items:Review[]}>(raw)?.items)||[]}
export async function listSpecs():Promise<FrozenSpec[]>{requireDeployment();const c:any=readClient();const raw=await readContractWithRetry(c,{address:DEPLOYMENT.registry,functionName:"list_specs",args:[0,50]});return (parse<{items:FrozenSpec[]}>(raw)?.items)||[]}
export async function getReviewBundle(reviewKey:string):Promise<ReviewBundle|null>{requireDeployment();const c:any=readClient();const rr=await readContractWithRetry(c,{address:DEPLOYMENT.reviewEngine,functionName:"get_review",args:[reviewKey]});const review=parse<Review>(rr);if(!review)return null;const [sr,ar]=await Promise.all([readContractWithRetry(c,{address:DEPLOYMENT.registry,functionName:"get_spec",args:[review.spec_id]}),readContractWithRetry(c,{address:DEPLOYMENT.authority,functionName:"get_authorization_for_review",args:[reviewKey]})]);return{review,spec:parse<FrozenSpec>(sr),authorization:parse<Authorization>(ar)}}
export async function findProof(receiptOrReviewKey:string):Promise<ReviewBundle|null>{const direct=await getReviewBundle(receiptOrReviewKey).catch(()=>null);if(direct?.authorization)return direct;const reviews=await listReviews();for(const r of reviews){const b=await getReviewBundle(r.review_key);if(b?.authorization?.receipt_key===receiptOrReviewKey)return b}return direct}
