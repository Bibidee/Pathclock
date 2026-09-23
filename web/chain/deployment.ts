export const NETWORK = {
  name: "GenLayer Studionet",
  chainId: Number(process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID || "61999"),
  rpc: process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api",
  explorer: process.env.NEXT_PUBLIC_GENLAYER_EXPLORER || "https://explorer-studio.genlayer.com",
} as const;

export const DEPLOYMENT = {
  registry: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "",
  reviewEngine: process.env.NEXT_PUBLIC_REVIEW_ENGINE_ADDRESS || "",
  authority: process.env.NEXT_PUBLIC_RELEASE_AUTHORITY_ADDRESS || "",
} as const;

export function deploymentReady() {
  return Object.values(DEPLOYMENT).every((x) => /^0x[a-fA-F0-9]{40}$/.test(x));
}
export function requireDeployment() {
  if (!deploymentReady()) throw new Error("PATHCLOCK contract addresses are not configured yet.");
}
export function explorerTx(hash: string) { return `${NETWORK.explorer}/transactions/${hash}`; }
export function explorerAddress(address: string) { return `${NETWORK.explorer}/address/${address}`; }
