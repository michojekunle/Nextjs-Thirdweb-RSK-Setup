"use client";

import Image from "next/image";
import {
  ConnectButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import thirdwebIcon from "@public/thirdweb.svg";
import { client } from "./client";
import { rootstockTestnet } from "./chains/rootstock";
import {
  getContract,
  prepareContractCall,
  sendAndConfirmTransaction,
} from "thirdweb";
import { useState } from "react";

export default function Home() {
  const account = useActiveAccount();
  const [newString, setNewString] = useState("");
  const [updating, setUpdating] = useState(false);

  const contract = getContract({
    address: "0x53b4fF9D9A424971539cdb96Cabc95c19eDaaFfA",
    chain: rootstockTestnet,
    client,
  });

  const { data: storedString, isPending: isLoading, refetch, isRefetching } = useReadContract({
    contract,
    method: "function get() external view returns (string memory)",
    params: [],
  });

  const handleSetStoredString = async (newString: string) => {
    if (!account) return;
    try {
      setUpdating(true);

      const setTx = prepareContractCall({
        contract: contract,
        method: "function set(string memory _newString) external",
        params: [newString],
      });

      await sendAndConfirmTransaction({
        transaction: setTx,
        account,
      });

      setUpdating(false);
      setNewString("");
      alert("Update string on chain successul")
    } catch (error) {
      console.error();
      alert("An error occured");
      setUpdating(false);
    }
  };

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />

        <div className="flex justify-center mb-16">
          <ConnectButton client={client} chain={rootstockTestnet} />
        </div>

        {account && (
          <div className="flex flex-col gap-4 mb-20">
            <h3 className="text-2xl font-medium mb-2">
              Stored String: {isLoading || isRefetching ? "fetching..." : storedString}
            </h3>
            <button
              onClick={() => refetch()}
              className="mb-4 px-4 py-2 border bg-gray-600 text-white rounded max-w-[140px] hover:bg-gray-700 transition-colors disabled:cursor-not-allowed"
              disabled={isLoading || isRefetching}
              >
                {isRefetching ? "Refreshing" : "Refresh string" }
            </button>
            <div className="flex flex-col gap-4">
              <span className="text-xl">Update stored string</span>
              <input
                type="text"
                value={newString}
                onChange={(e) => setNewString(e.target.value)}
                className="border border-zinc-700 rounded outline-none px-4 py-2 bg-zinc-900 text-zinc-300"
                placeholder="Enter new string"
              />
              <button
                onClick={() => handleSetStoredString(newString)}
                className="px-4 py-2 max-w-[140px] bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:cursor-not-allowed"
                disabled={updating || !newString}
              >
                {updating ? "Updating" : "Update"}
              </button>
            </div>
          </div>
        )}

        <ThirdwebResources />
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <Image
        src={thirdwebIcon}
        alt=""
        className="size-[150px] md:size-[150px]"
        style={{
          filter: "drop-shadow(0px 0px 24px #a726a9a8)",
        }}
      />

      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        <span className="inline-block -skew-x-6 text-orange-500">
          RootStock
        </span>
        <span className="text-zinc-300 inline-block mx-1"> + </span>
        thirdweb SDK
        <span className="text-zinc-300 inline-block mx-1"> + </span>
        <span className="inline-block -skew-x-6 text-blue-500"> Next.js </span>
      </h1>

      <p className="text-zinc-300 text-base">
        Read the{" "}
        <code className="bg-zinc-800 text-zinc-300 px-2 rounded py-1 text-sm mx-1">
          README.md
        </code>{" "}
        file to get started.
      </p>
    </header>
  );
}

function ThirdwebResources() {
  return (
    <div className="grid gap-4 lg:grid-cols-3 justify-center">
      <ArticleCard
        title="thirdweb SDK Docs"
        href="https://portal.thirdweb.com/typescript/v5"
        description="thirdweb TypeScript SDK documentation"
      />

      <ArticleCard
        title="Components and Hooks"
        href="https://portal.thirdweb.com/typescript/v5/react"
        description="Learn about the thirdweb React components and hooks in thirdweb SDK"
      />

      <ArticleCard
        title="thirdweb Dashboard"
        href="https://thirdweb.com/dashboard"
        description="Deploy, configure, and manage your smart contracts from the dashboard."
      />
    </div>
  );
}

function ArticleCard(props: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <a
      href={props.href + "?utm_source=next-template"}
      target="_blank"
      className="flex flex-col border border-zinc-800 p-4 rounded-lg hover:bg-zinc-900 transition-colors hover:border-zinc-700"
    >
      <article>
        <h2 className="text-lg font-semibold mb-2">{props.title}</h2>
        <p className="text-sm text-zinc-400">{props.description}</p>
      </article>
    </a>
  );
}
