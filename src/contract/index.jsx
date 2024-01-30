import { ethers } from "ethers";

const Abis = require("./resource/abis.json");
const Addresses = require("./resource/addresses.json");

const supportChainId = 4002;

const RPCS = {
    // 421613: "https://goerli-rollup.arbitrum.io/rpc",
    4002: "https://rpc.ankr.com/fantom_testnet",
    // 1337: "http://localhost:7545",
    // 31337: "http://localhost:8545/",
};

const providers = {
    // 421613: new ethers.providers.JsonRpcProvider(RPCS[supportChainId]),
    4002: new ethers.providers.JsonRpcProvider(RPCS[4002]),
    // 1337: new ethers.providers.JsonRpcProvider(RPCS[1337]),
    // 31337: new ethers.providers.JsonRpcProvider(RPCS[31337]),
};

const provider = providers[supportChainId];

const PresaleContract = new ethers.Contract(
    Addresses.Presale,
    Abis.Presale,
    provider
);
const USDCContract = new ethers.Contract(Addresses.USDC, Abis.Token, provider);

export { PresaleContract, USDCContract, provider, supportChainId };
