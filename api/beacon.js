// Vercel serverless proxy — FALLBACK ONLY. Used if the visitor's browser can't
// reach the public beacon nodes directly (CORS/network restrictions).
const BASES = {
  mainnet: "https://ethereum-beacon-api.publicnode.com",
  hoodi: "https://ethereum-hoodi-beacon-api.publicnode.com",
};

const OK = [
  /^\/eth\/v1\/beacon\/genesis$/,
  /^\/eth\/v1\/config\/spec$/,
  /^\/eth\/v1\/beacon\/headers\/head$/,
];

export default async function handler(req, res) {
  const { net, path } = req.query;
  if (!BASES[net] || !OK.some((r) => r.test(path || ""))) {
    return res.status(400).json({ error: "bad request" });
  }
  const r = await fetch(BASES[net] + path);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(r.status).send(await r.text());
}
