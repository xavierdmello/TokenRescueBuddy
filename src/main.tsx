import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";
import { ThemeProvider, Theme } from "@mui/material/styles";
import { SafeThemeProvider } from "@safe-global/safe-react-components";
import "@safe-global/safe-react-components/dist/fonts.css";

// Rainbowkit imports
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig,  } from "wagmi";
import { mainnet, arbitrum, bsc, polygon, gnosis } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient } = configureChains([mainnet, bsc, polygon, arbitrum, gnosis], [publicProvider()]);

const { connectors } = getDefaultWallets({
  appName: "Token Rescue Buddy",
  projectId: "e75ba7ecc035793252084642ce0ce7ce",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={darkTheme({
          accentColor: "#12FF80",
          accentColorForeground: "#121312",
        })}
        modalSize="compact"
      >
        <SafeThemeProvider mode="dark">
          {(safeTheme: Theme) => (
            <ThemeProvider theme={safeTheme}>
              <App />
            </ThemeProvider>
          )}
        </SafeThemeProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);
