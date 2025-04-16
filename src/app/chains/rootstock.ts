// chains/rootstock.ts
import { defineChain } from "thirdweb";

export const rootstockMainnet = defineChain({
  id: 30,
  name: "Rootstock Mainnet",
  rpc: "https://30.rpc.thirdweb.com",
  nativeCurrency: {
    name: "RBTC",
    symbol: "RBTC",
    decimals: 18,
  },
  blockExplorers: [
    { name: "RSK Explorer", url: "https://explorer.rsk.co" },
    { name: "Blockscout", url: "https://rootstock.blockscout.com" },
  ]
});

export const rootstockTestnet = defineChain({
  id: 31,
  name: "Rootstock Testnet",
  rpc: "https://public-node.testnet.rsk.co",
  nativeCurrency: {
    name: "tRBTC",
    symbol: "tRBTC",
    decimals: 18,
  },
  blockExplorers: [
    { name: "RSK Testnet Explorer", url: "https://explorer.testnet.rootstock.io/" },
    { name: "Blockscout Testnet Explorer", url: "https://rootstock-testnet.blockscout.com/" },
  ],
  testnet: true,
});