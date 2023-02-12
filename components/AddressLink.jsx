const networkToURL = {
  goerli: "https://goerli.etherscan.io/tx/",
};

export function AddressLink({ network, address }) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={`https://goerli.etherscan.io/address/${address}`}
      className=" text-blue-500"
    >
      {address}
    </a>
  );
}
