import "../styles/globals.css";
import { MoralisProvider } from "react-moralis";
import Header from "../components/Header";
import Head from "next/head";
import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { arbitrum, mainnet, polygon, polygonMumbai } from "wagmi/chains";

// Define NotificationProvider using react-toast-notifications or similar
import { NotificationProvider } from "react-toast-notifications";

// Define wagmiClient using createClient function
const wagmiClient = createClient({
  chains: configureChains([mainnet, polygon, arbitrum, polygonMumbai]),
});

function MyApp({ Component, pageProps }) {
  // Define ethereumClient using EthereumClient class
  const ethereumClient = new EthereumClient({
    chainId: 1, // Change this to the appropriate chain ID
    rpcUrl: "https://mainnet.infura.io/v3/<your-project-id>", // Change this to your Infura project ID
  });

  return (
    <div>
      <Head>
        <title>NFT Marketplace</title>
        <meta name="description" content="NFT Marketplace" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
        <NotificationProvider>
          <Header />
          <Component {...pageProps} />
        </NotificationProvider>
      </MoralisProvider>
      <WagmiConfig client={wagmiClient}>
        {/* Define HomePage component or replace with appropriate component */}
        <HomePage />
      </WagmiConfig>
      <Web3Modal
        projectId="<YOUR_PROJECT_ID>"
        ethereumClient={ethereumClient}
      />
    </div>
  );
}
