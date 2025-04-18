"use client";

import { useState } from "react";
import { useConnection } from "../hooks/useConnection";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/utils/contract";
import { Contract } from "ethers";
import EventListener from "@/components/EventListener";

export default function Home() {
  const { accountAddress, connectWallet, disconnectWallet, isLoading, signer } =
    useConnection();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendMessage = async (message: string) => {
    if (!accountAddress) return;

    try {
      setSending(true);

      if (!signer) throw new Error("Signer is not available");

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.sendMessage(message);
      const receipt = await tx.wait();

      console.log("Transaction Receipt: ", receipt);

      setSending(false);
      setMessage("");
    } catch (error) {
      console.error();
      alert("An error occured");
      setSending(false);
    }
  };

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="w-full max-w-lg py-20">
        <h1 className="text-3xl font-bold mb-4">Event Emitter</h1>
        <p className="text-lg mb-4">Send and listen to messages from the blockchain</p>

        <div className="flex justify-center mb-16">
          {!accountAddress ? (
            <button
              onClick={connectWallet}
              className="px-4 py-2 border border-white/40 bg-gray-600 text-white rounded max-w-[200px] hover:bg-gray-700 transition-colors disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <button
              onClick={disconnectWallet}
              className="px-4 py-2 bg-red-500 text-white rounded max-w-[200px] hover:bg-red-600 transition-colors disabled:cursor-not-allowed"
            >
              Disconnect Wallet
            </button>
          )}
        </div>
        {accountAddress && (
          <div className="flex flex-col gap-4 mb-20">
            <h3 className="text-xl font-medium mb-2">
              Connected Address: {accountAddress}
            </h3>
          </div>
        )}

        {/* Event Listener */}
        <div className="mb-16">
          <EventListener />
        </div>

        {/* Section to fire contract events */}
        <div className="flex flex-col gap-4">
          <span className="text-xl">
            Send Message to fire(emit) contract event
          </span>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border border-zinc-700 rounded outline-none px-4 py-2 bg-zinc-900 text-zinc-300"
            placeholder="Enter message"
          />
          <button
            onClick={() => handleSendMessage(message)}
            className="mb-4 px-4 py-2 border bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:cursor-not-allowed"
            disabled={sending}
          >
            {sending ? "Sending" : "Send Message"}
          </button>
        </div>
      </div>
    </main>
  );
}
