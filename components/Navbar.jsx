import { useState } from "react";
import { useRouter } from "next/router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import icon from "../public/icon.jpeg";
import Link from "next/link";
import { Combobox } from "@headlessui/react";

export default function SearchBar() {
  const [value, setValue] = useState("");
  const [network, setNetwork] = useState("Goerli");

  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    const target = e.target;
    router.push(`/tree/${target.input.value}`);
  }

  function handleValueChange(e) {
    setValue(e.target.value);
  }

  function handleNetworkChange(e) {
    setNetwork(e.target.value);
  }

  return (
    <div className=" border-b">
      <div className=" flex items-center max-w-screen-xl m-auto">
        <div className="flex gap-4 items-center">
          <Link href="/">
            <Image src={icon} alt="" className=" w-16 h-16"></Image>
          </Link>
          <Link href="/create/tree">
            <h1 className=" font-medium hover:text-blue-500">Create Tree</h1>
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex rounded-lg h-12 mb-3 mt-3 m-auto w-1/2 border shadow-md gap-0"
        >
          <select
            value={network}
            onChange={handleNetworkChange}
            name="network"
            className="rounded-l-lg focus:border-0 focus:ring-transparent border-0"
          >
            <option value="Goerli">Goerli</option>
          </select>
          <input
            type="search"
            value={value}
            onChange={handleValueChange}
            name="input"
            className="h-full w-full text-sm text-gray-900 border-0 border-l border-l-slate-200 focus:border-l-slate-200 focus:ring-transparent"
            placeholder="Search Tree Id"
          />
          <button
            type="submit"
            className="text-white bg-blue-500 hover:bg-blue-400 font-medium text-sm rounded-r-lg w-10"
          >
            <svg
              className="w-5 h-5 text-white m-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </button>
        </form>
        <ConnectButton />
      </div>
    </div>
  );
}
