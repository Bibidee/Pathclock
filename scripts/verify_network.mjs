const expected = { chainId: 61999, rpc: "https://studio.genlayer.com/api" };
const rpc = process.env.GENLAYER_RPC_URL || expected.rpc;
const res = await fetch(rpc, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] }),
});
if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
const body = await res.json();
const chainId = Number.parseInt(body.result, 16);
if (chainId !== expected.chainId) throw new Error(`Wrong chain: ${chainId}; expected 61999`);
console.log(JSON.stringify({ ok: true, rpc, chainId }, null, 2));
