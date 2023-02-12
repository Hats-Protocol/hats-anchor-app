import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, goerli } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
} from "@apollo/client";
import NavBar from "../components/Navbar";

const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/hats-protocol/hats-protocol-goerli",
  cache: new InMemoryCache(),
});

const { chains, provider } = configureChains(
  [goerli],
  [
    alchemyProvider({ apiKey: "-IkTtrUkCqsPF6vDnJL9fmQk8c2nlWRf" }),
    publicProvider(),
  ]
);
const { connectors } = getDefaultWallets({
  appName: "Hats Anchor App",
  chains,
});
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MyApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider
          chains={chains}
          theme={lightTheme({ borderRadius: "medium" })}
        >
          <div className="flex flex-col min-h-screen">
            <NavBar></NavBar>
            <Component {...pageProps} />
          </div>
        </RainbowKitProvider>
      </WagmiConfig>
    </ApolloProvider>
  );
}

export default MyApp;
