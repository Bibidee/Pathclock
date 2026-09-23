"use client";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { NETWORK } from "./deployment";

export type InjectedProvider = {
  request(args: { method: string; params?: unknown[] }): Promise<any>;
  on?(event: string, handler: (...args: any[]) => void): void;
  removeListener?(event: string, handler: (...args: any[]) => void): void;
};

declare global { interface Window { ethereum?: InjectedProvider } }

export function provider() { return typeof window === "undefined" ? undefined : window.ethereum; }
export function readClient() { return createClient({ chain: studionet, endpoint: NETWORK.rpc } as any); }
export function walletClient(account: string) {
  return createClient({ chain: studionet, endpoint: NETWORK.rpc, account: account as `0x${string}` } as any);
}
