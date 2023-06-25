import "./styles/App.css";
import "@safe-global/safe-react-components/dist/fonts.css";
import Create from "./components/Create";
import Header from "./components/Header";
import { Divider } from "@mui/material";
import { useAccount } from "wagmi";
import "dotenv/config"

function App() {
  const {isConnected } = useAccount();
  return (
    <div className="App">
      <Header />
      <Divider />

      {isConnected ? <Create /> : <p className="connect-wallet-warning">Please connect your wallet.</p>}
    </div>
  );
}

export default App;
