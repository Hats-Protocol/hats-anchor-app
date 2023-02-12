import { useQuery, gql, useLazyQuery } from "@apollo/client";
import { GET_TREE, GET_HAT } from "../../queries/graph-queries";
import TreeGraph from "react-d3-tree";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import ReactTimeAgo from "react-time-ago";
import { TransactionLink } from "../../components/TransactionLink";
import { Hat } from "../../components/Hat";
import { useRouter } from "next/router";
import ClipLoader from "react-spinners/ClipLoader";

TimeAgo.addLocale(en);

export default function Tree() {
  const networkId = "Goerli";
  const router = useRouter();
  const { treeId } = router.query;
  const [getHat, { loading: hatLoading, error: hatError, data: hatData }] =
    useLazyQuery(GET_HAT);
  const {
    loading: treeLoading,
    error: treeError,
    data: treeData,
  } = useQuery(GET_TREE, {
    variables: { id: treeId },
  });

  if (treeLoading)
    return (
      <div className=" flex-grow flex justify-center items-center bg-slate-50">
        <ClipLoader loading={treeLoading} />
      </div>
    );
  if (treeError) return <p>Error : {treeError.message}</p>;

  let tree = toTreeStructure(treeData);
  //console.log(JSON.stringify(tree));

  return (
    <div className="bg-slate-50 flex-grow">
      <div className="flex flex-col max-w-screen-xl m-auto">
        <div className="flex justify-between gap-8">
          {/* info table */}
          <div className=" shadow-lg rounded-md w-full bg-white mt-8">
            <div className="border-b-2 bg-slate-200 rounded-t-md">
              <h1 className=" ml-2 font-medium">Info</h1>
            </div>
            <div className="flex mx-2 border-b">
              <div className=" flex-none w-36 my-2">Network:</div>
              <div className=" my-2">{networkId}</div>
            </div>
            <div className="flex mx-2">
              <div className=" flex-none w-36 my-2">Tree ID:</div>
              <div className=" my-2">{treeId}</div>
            </div>
          </div>
          {/* recent events table */}
          <div className="shadow-lg w-full bg-white mt-8 rounded-md ">
            <div className="border-b-2 rounded-t-md bg-slate-200">
              <div className="ml-2 font-medium">Recent Events</div>
            </div>
            <EventRow
              id={treeData.tree.events[0].id.split("-")[0]}
              transactionId={treeData.tree.events[0].transactionID}
              timestamp={treeData.tree.events[0].timestamp}
              network={networkId}
              last={false}
            ></EventRow>
            <EventRow
              id={treeData.tree.events[1].id.split("-")[0]}
              transactionId={treeData.tree.events[1].transactionID}
              timestamp={treeData.tree.events[1].timestamp}
              network={networkId}
              last={false}
            ></EventRow>
            <EventRow
              id={treeData.tree.events[2].id.split("-")[0]}
              transactionId={treeData.tree.events[2].transactionID}
              timestamp={treeData.tree.events[2].timestamp}
              network={networkId}
              last={false}
            ></EventRow>
            <EventRow
              id={treeData.tree.events[3].id.split("-")[0]}
              transactionId={treeData.tree.events[3].transactionID}
              timestamp={treeData.tree.events[3].timestamp}
              network={networkId}
              last={false}
            ></EventRow>
            <EventRow
              id={treeData.tree.events[4].id.split("-")[0]}
              transactionId={treeData.tree.events[4].transactionID}
              timestamp={treeData.tree.events[4].timestamp}
              network={networkId}
              last={true}
            ></EventRow>
          </div>
        </div>
        <div className="flex mt-16 justify-between rounded-md h-128">
          {/* tree explorer */}
          <div className="shadow-md border-r-2 rounded-l-md bg-white w-1/2 border-neutral-300">
            <TreeGraph
              data={tree}
              orientation="vertical"
              collapsible={false}
              rootNodeClassName="node__root"
              branchNodeClassName="node__branch"
              leafNodeClassName="node__leaf"
              nodeSize={{ x: 200, y: 200 }}
              translate={{ x: 200, y: 200 }}
              onNodeClick={(node, event) =>
                getHat({ variables: { id: prettyIdToId(node.data.name) } })
              }
            />
          </div>
          {/* hat data */}
          <Hat
            hatData={hatData}
            hatLoading={hatLoading}
            hatError={hatError}
            network={networkId}
          ></Hat>
        </div>
      </div>
    </div>
  );
}

function toTreeStructure(data) {
  let hatsArray = data.tree.hats.map((hat) => {
    if (hat.admin.prettyId === hat.prettyId) {
      return { hatName: hat.prettyId, hatParent: "dummy" };
    }
    return {
      hatName: hat.prettyId,
      hatParent: hat.admin.prettyId,
    };
  });

  return arrayToTreeRecursive(
    [{ hatName: "dummy", hatParent: "null" }, ...hatsArray],
    "dummy"
  );
}

function arrayToTreeRecursive(arr, parent) {
  return arr
    .filter((item) => item.hatParent === parent)
    .map((child) => ({
      name: child.hatName,
      attributes: { details: child.details },
      children: arrayToTreeRecursive(arr, child.hatName),
    }));
}

function prettyIdToId(id) {
  return id.replaceAll(".", "").padEnd(66, "0");
}

function EventRow({ id, timestamp, transactionId, network, last }) {
  if (last) {
    return (
      <div className="flex mx-2">
        <div className=" flex-none w-36 my-2">
          <ReactTimeAgo
            date={new Date(Number(timestamp) * 1000)}
            locale="en-US"
          />
        </div>
        <div className=" my-2">{id.split("-")[0]}</div>
        <div className=" my-2 ml-4">
          <TransactionLink
            tx={transactionId}
            network={network}
          ></TransactionLink>
        </div>
      </div>
    );
  }

  return (
    <div className="flex mx-2 border-b">
      <div className=" flex-none w-36 my-2">
        <ReactTimeAgo
          date={new Date(Number(timestamp) * 1000)}
          locale="en-US"
        />
      </div>
      <div className=" my-2">{id.split("-")[0]}</div>
      <div className=" my-2 ml-4">
        <TransactionLink tx={transactionId} network={network}></TransactionLink>
      </div>
    </div>
  );
}
