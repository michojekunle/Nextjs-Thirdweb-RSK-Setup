import { useState, useEffect, useCallback } from "react";
import { ethers, BrowserProvider, JsonRpcSigner } from "ethers";

const ROOTSTOCK_CHAIN_ID = "0x1f"; // 31 in hex
const ROOTSTOCK_PARAMS = {
  chainId: ROOTSTOCK_CHAIN_ID,
  chainName: "Rootstock Testnet",
  nativeCurrency: {
    name: "tRBTC",
    symbol: "tRBTC",
    decimals: 18,
  },
  rpcUrls: ["https://public-node.testnet.rsk.co"],
  blockExplorerUrls: ["https://explorer.testnet.rootstock.io/"],
};

export function useConnection() {
  const [accountAddress, setAccountAddress] = useState("");
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const connectWallet = useCallback(async () => {
    const { ethereum } = window as any;
    if (!ethereum) {
      alert("MetaMask not detected.");
      return;
    }

    setIsLoading(true);
    try {
      // ✅ Switch to Rootstock if not already there
      const currentChainId = await ethereum.request({ method: "eth_chainId" });

      if (currentChainId !== ROOTSTOCK_CHAIN_ID) {
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ROOTSTOCK_CHAIN_ID }],
          });
        } catch (switchError: any) {
          // If the chain isn't added yet, request to add it
          if (switchError.code === 4902) {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [ROOTSTOCK_PARAMS],
            });
          } else {
            throw switchError;
          }
        }
      }

      const browserProvider = new ethers.BrowserProvider(ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setAccountAddress(accounts[0]);
      setChainId(Number(network.chainId));
      setSigner(await browserProvider.getSigner());
    } catch (err) {
      console.error("Failed to connect:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccountAddress("");
    setChainId(null);
    setSigner(null);
    setProvider(null);
    console.log("🔌 Wallet disconnected");
  }, []);

  useEffect(() => {
    const { ethereum } = window as any;
    if (!ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccountAddress(accounts[0]);
        if (provider) {
          setSigner(await provider.getSigner());
        }
      }
    };

    const handleChainChanged = async (hexChainId: string) => {
      const numericChainId = parseInt(hexChainId, 16);
      setChainId(numericChainId);

      const newProvider = new ethers.BrowserProvider(ethereum);
      setProvider(newProvider);
      setSigner(await newProvider.getSigner());
    };

    const handleDisconnect = () => disconnectWallet();

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);
    ethereum.on("disconnect", handleDisconnect);

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
      ethereum.removeListener("disconnect", handleDisconnect);
    };
  }, [provider, disconnectWallet]);

  useEffect(() => {
    const tryReconnect = async () => {
      const { ethereum } = window as any;
      if (ethereum && ethereum.selectedAddress) {
        await connectWallet();
      }
    };
    tryReconnect();
  }, [connectWallet]);

  return {
    accountAddress,
    chainId,
    isLoading,
    signer,
    provider,
    connectWallet,
    disconnectWallet,
  };
}
