import { AddressLink } from "../components/AddressLink";
import ReactTimeAgo from "react-time-ago";
import { useState } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/20/solid";
import ClipLoader from "react-spinners/ClipLoader";

export function Hat({ hatData, hatLoading, hatError, network }) {
  const [activeTab, setActiveTab] = useState("Basic Info");

  return (
    <div className="shadow-md bg-white rounded-r-md h-128  w-1/2 flex flex-col">
      <div className=" flex-initial rounded-tr-md bg-slate-200">
        <h1 className=" ml-2 mb-2 font-bold">Hat</h1>
        <div className="flex">
          <TabButton
            id="Basic Info"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          ></TabButton>
          <TabButton
            id="Wearers"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          ></TabButton>
        </div>
      </div>
      {hatLoading ? (
        <div className=" flex-grow flex justify-center items-center">
          <ClipLoader loading={hatLoading} />
        </div>
      ) : hatError ? (
        <p>{hatError.message}</p>
      ) : hatData?.hat === undefined ? (
        <p className=" m-2">No hat chosen</p>
      ) : (
        <div className=" flex-auto">
          <HatBasicInfo
            hatData={hatData}
            network={network}
            id="Basic Info"
            activeTab={activeTab}
          ></HatBasicInfo>
          <HatWearers
            hatData={hatData}
            network={network}
            id="Wearers"
            activeTab={activeTab}
          ></HatWearers>
        </div>
      )}
    </div>
  );
}

function TabButton({ id, activeTab, setActiveTab }) {
  if (id == activeTab) {
    return (
      <button
        onClick={() => setActiveTab(id)}
        className="font-medium text-left border-b-2 border-b-blue-500 text-blue-500 mr-6"
      >
        <p className=" mx-2">{id}</p>
      </button>
    );
  }
  return (
    <button
      onClick={() => setActiveTab(id)}
      className="font-medium text-left border-b-2 hover:text-blue-500 mr-6"
    >
      <p className=" mx-2">{id}</p>
    </button>
  );
}

function HatBasicInfo({ hatData, network, activeTab, id }) {
  if (activeTab == id) {
    return (
      <>
        <div className="flex mx-2 border-b">
          <div className=" flex-none w-36 my-2">Id:</div>
          <div className=" truncate break-all my-2">{hatData.hat.id}</div>
        </div>
        <div className="flex mx-2 border-b">
          <div className=" flex-none w-36 my-2">Status:</div>
          <div className=" my-2">
            {hatData.hat.status ? "Active" : "Not Active"}
          </div>
        </div>
        <div className="flex mx-2 border-b">
          <div className=" flex-none w-36 my-2">Details:</div>
          <div className=" my-2">{hatData.hat.details}</div>
        </div>
        <div className="flex mx-2 border-b">
          <div className=" flex-none w-36 my-2">Image URI:</div>
          <div className=" my-2">{hatData.hat.imageUri}</div>
        </div>
        <div className="flex mx-2 border-b">
          <div className=" flex-none w-36 my-2">Max Supply:</div>
          <div className=" my-2">{hatData.hat.maxSupply}</div>
        </div>
        <div className="flex mx-2 border-b">
          <div className=" flex-none w-36 my-2">Current Supply:</div>
          <div className=" my-2">{hatData.hat.currentSupply}</div>
        </div>
        <div className="flex mx-2 border-b">
          <div className=" flex-none w-36 my-2">Eligibility:</div>
          <div className=" my-2">
            <AddressLink address={hatData.hat.eligibility} network={network} />
          </div>
        </div>
        <div className="flex mx-2 border-b">
          <div className=" flex-none w-36 my-2">Toggle:</div>
          <div className=" my-2">
            <AddressLink address={hatData.hat.toggle} network={network} />
          </div>
        </div>
        <div className="flex mx-2 border-b">
          <div className=" flex-none w-36 my-2">Mutable:</div>
          <div className=" my-2">{hatData.hat.mutable ? "True" : "False"}</div>
        </div>
        <div className="flex mx-2 border-b">
          <div className=" flex-none w-36 my-2">Level:</div>
          <div className=" my-2">{hatData.hat.levelAtLocalTree}</div>
        </div>
        <div className="flex mx-2">
          <div className=" flex-none w-36 my-2">Created At:</div>
          <div className=" my-2">
            <ReactTimeAgo
              date={new Date(Number(hatData.hat.createdAt) * 1000)}
              locale="en-US"
            />
          </div>
        </div>
      </>
    );
  } else {
    return null;
  }
}

function HatWearers({ hatData, network, activeTab, id }) {
  if (hatData.hat.wearers.length == 0) {
    return null;
  }

  const [currentPage, setCurrentPage] = useState(1);

  const WEARERS_PER_PAGE = 5;
  const pageNumbers = [];
  for (
    let i = 1;
    i <= Math.ceil(hatData.hat.wearers.length / WEARERS_PER_PAGE);
    i++
  ) {
    pageNumbers.push(i);
  }

  const decrementCurrentPage = () => {
    if (currentPage == 1) {
      return;
    }

    setCurrentPage((curr) => curr - 1);
  };

  const incrementCurrentPage = () => {
    if (currentPage == pageNumbers.length) {
      return;
    }

    setCurrentPage((curr) => curr + 1);
  };

  // Get current wearers
  const indexOfLastWearer = currentPage * WEARERS_PER_PAGE;
  const indexOfFirstWearer = indexOfLastWearer - WEARERS_PER_PAGE;
  const currentWearers = hatData.hat.wearers.slice(
    indexOfFirstWearer,
    indexOfLastWearer
  );
  const CurrentWearersAddresses = currentWearers.map((wearer) => {
    return wearer.id;
  });

  if (activeTab == id) {
    return (
      <div className="flex flex-col h-full justify-between">
        <div className="">
          {CurrentWearersAddresses.map((wearer) => {
            return (
              <div className="flex mx-2 border-b" key={wearer}>
                <div className=" flex-none w-36 my-2">
                  <AddressLink address={wearer} network={network} />
                </div>
              </div>
            );
          })}
        </div>

        <nav className="bottom-2">
          <ul className="flex">
            <li className=" ml-2 mb-2 w-6">
              <button
                onClick={decrementCurrentPage}
                className=" text-gray-500 rounded-sm w-full"
              >
                <ChevronLeftIcon></ChevronLeftIcon>
              </button>
            </li>
            {pageNumbers.map((number) => {
              if (currentPage == number) {
                return (
                  <li key={number} className=" ml-2 mb-2 w-6">
                    <button
                      onClick={() => setCurrentPage(number)}
                      className="bg-blue-400 text-white rounded-sm w-full"
                    >
                      <p>{number}</p>
                    </button>
                  </li>
                );
              } else {
                return (
                  <li key={number} className=" ml-2 mb-2 w-6">
                    <button
                      onClick={() => setCurrentPage(number)}
                      className=" text-gray-500 rounded-sm w-full"
                    >
                      <p>{number}</p>
                    </button>
                  </li>
                );
              }
            })}
            <li className=" ml-2 mb-2 w-6">
              <button
                onClick={incrementCurrentPage}
                className=" text-gray-500 rounded-sm w-full"
              >
                <ChevronRightIcon></ChevronRightIcon>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  } else {
    return null;
  }
}
