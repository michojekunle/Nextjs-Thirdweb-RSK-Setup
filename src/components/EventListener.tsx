import { useEffect, useState } from "react";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../utils/contract";
import { provider } from "../utils/provider";
import { Contract } from "ethers";
import { useConnection } from "@/app/hooks/useConnection";

const EventListener = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const { signer } = useConnection();

  useEffect(() => {
  provider.getNetwork().then((network) => {
    console.log("🌐 Connected to:", network.name, network.chainId);
  });

  provider.on("block", (num) => {
    console.log("📦 Block:", num);
  });

  const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

  provider.getCode(CONTRACT_ADDRESS).then((code) => {
    console.log("📦 Deployed Code Length:", code.length);
  });

  contract.queryFilter("MessageSent").then(events => {
    console.log("📜 Past Events:", events);
  }).catch(error => console.log("Error querying filters", error));

  const onMessageSent = (from: string, message: string, timestamp: number) => {
    console.log("📥 Event Received:", { from, message, timestamp });
    setMessages((prev) => [...prev, `${from}: ${message} at ${timestamp}`]);
  };

  contract.on("MessageSent", onMessageSent);
  contract.on("MessageSent", (...args) => {
    console.log("🔥 Event Triggered with Args:", args);
  });
  

  return () => {
    contract.off("MessageSent", onMessageSent);
    provider.off("block", () => {});
  };
}, []);

  return (
    <div className="">
      <h2 className="text-xl font-bold mb-2">📨 On-Chain Messages</h2>
      <div className="space-y-2">
        {messages.length === 0 && <p>No messages yet.</p>}
        {messages.map((msg, i) => (
          <p key={i} className="bg-gray-100 p-2 rounded-md">{msg}</p>
        ))}
      </div>
    </div>
  );
};

export default EventListener;