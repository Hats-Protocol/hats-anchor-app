import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";

const networkToURL = {
  goerli: "https://goerli.etherscan.io/tx/",
};

export function TransactionLink({ network, tx }) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={`https://goerli.etherscan.io/tx/${tx}`}
    >
      <ArrowTopRightOnSquareIcon className=" h-4 w-4 text-blue-500" />
    </a>
  );
}
