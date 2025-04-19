import { useEffect, useState } from "react";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../utils/contract";
import { provider } from "../utils/provider";
import { Contract } from "ethers";

const EventListener = () => {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    let isSubscribed = true;

    contract
      .queryFilter("MessageSent")
      .then((events) => {
        if (isSubscribed) {
          console.log("📜 Past Events:", events);
        }
      })
      .catch((error) => console.log("Error querying filters", error));

    const onMessageSent = (
      from: string,
      message: string,
      timestamp: number
    ) => {
      if (isSubscribed) {
        console.log("📥 Event Received:", { from, message, timestamp });
        setMessages((prev) => [
          ...prev,
          `Sender: ${from}; \nMessage: ${message}; \nAt: ${new Date(
            timestamp * 1000
          ).toLocaleString()};`,
        ]);
      }
    };

    contract.on("MessageSent", onMessageSent);

    return () => {
      isSubscribed = false;
      contract.off("MessageSent", onMessageSent);
    };
  }, []);

  return (
    <div className="">
      <h2 className="text-xl font-bold mb-2">📨 On-Chain Messages</h2>
      <div className="space-y-4">
        {messages.length === 0 && <p>No messages yet.</p>}
        {messages.map((msg, i) => (
          <p
            key={i}
            className="bg-white/10 backdrop-blur  border border-black/40 p-2 rounded-md"
          >
            {msg}
          </p>
        ))}
      </div>
    </div>
  );
};

export default EventListener;
