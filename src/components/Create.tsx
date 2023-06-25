import { useEffect, useState } from "react";
import "../styles/Create.css";
import { useNetwork, useSwitchNetwork, usePrepareSendTransaction, useSendTransaction, useWalletClient } from "wagmi";
import { Button, Divider, Select, TextField, Tooltip, MenuItem, InputLabel, FormControl } from "@mui/material";
import { useDebounce } from "use-debounce";
import axios from "axios";
export default function Create() {
  const { chain: currentChain } = useNetwork();
  const [safeAddress, setSafeAddress] = useState("");
  const [originChain, setOriginChain] = useState("");
  const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork();
  const [debouncedSafeAddress] = useDebounce(safeAddress, 500);
  const { data: walletClient } = useWalletClient();
  const [deployData, setDeployData] = useState<`0x${string}`>("0x");

  // PUT SCANNER URLS HERE:
  // CHAINID:SCANNER URL:SCANNER KEY
  let apiKeyMap = new Map<number, string[]>();
  const PROXY_FACTORY_ADDRESS = "0xa6b71e26c5e0845f74c812102ca7114b6a896ab2"; // SAME ACROSS ALL SUPPORTED CHAINS
  const getContractCreation = `module=contract&action=getcontractcreation&contractaddresses=${safeAddress}&apikey=`;
  // KEYS ARE PUBLIC, WILL BE FIXED LATER - COMPLICATIONS WITH .ENV
  apiKeyMap.set(42161, ["https://api.arbiscan.io/api?", "XKDKAWYX2H8H93T6GGIS3QGYG7F9UQ389X"]);
  apiKeyMap.set(1, ["https://api.etherscan.io/api?", "CIMV43RYIQI61HRB6T8WR4K8XXQMWVQV28"]);
  apiKeyMap.set(56, ["https://api.bscscan.com/api?", "RY147JT1XJEIU75CJJV6WQQBIAUQJU7KA5"]);
  apiKeyMap.set(137, ["https://api.polygonscan.com/api?", "J6KQKW3866TPVYKSC2J1W65PVFS6FJ3GTG"]);
  apiKeyMap.set(100, ["https://api.gnosisscan.io/api?", "7SBSAKGDRF1DF647Q52FCWWK5H6SR9VG3R"]);

  function handleChange(e: string) {
    const selectedChainId = chains.filter((tempChain) => tempChain.name === e)[0].id;
    switchNetwork?.(selectedChainId);
  }

  async function getDeployData() {
    const selectedOrignChainId = chains.filter((tempChain) => tempChain.name === originChain)[0].id;
    const prefix = apiKeyMap.get(selectedOrignChainId)?.[0];
    const key = apiKeyMap.get(selectedOrignChainId)?.[1];
    const data = await axios.get(prefix + getContractCreation + key);
    const txHash = data.data.result[0].txHash;
    const getTxByHash = `module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=`;
    const data2 = await axios.get(prefix + getTxByHash + key);
    const hexData: `0x${string}` = data2.data.result.input; // THATS SOME GOOD SHIT

    return hexData;
  }

  useEffect(() => {
    async function useEffectTempAsyncCall() {
      setDeployData(await getDeployData());
    }
    useEffectTempAsyncCall();
  }, [debouncedSafeAddress, originChain]);

  const { config } = usePrepareSendTransaction({
    to: PROXY_FACTORY_ADDRESS,
    value: BigInt(0),
    data: deployData,
  });
  const { sendTransaction } = useSendTransaction(config);

  return (
    <div className="Create">
      <h2 className="create-title">Redeploy safe on new chain</h2>
      <p className="create-subheading">Bring your Gnosis Safe to other chains while keeping the same address.</p>
      <Divider></Divider>
      <TextField className="safe-address-input" label="Origin safe address*" onChange={(e) => setSafeAddress(e.target.value)}></TextField>
      <FormControl fullWidth>
        <InputLabel id="origin-chain-label">Origin chain*</InputLabel>
        <Select
          labelId="origin-chain-label"
          className="origin-chain-select"
          value={originChain}
          label="Origin chain*"
          onChange={(e) => setOriginChain(e.target.value)}
        >
          {chains.map((chain) => (
            <MenuItem key={chain.name} value={chain.name}>
              {chain.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel id="destination-chain-label">Destination chain*</InputLabel>
        <Select
          labelId="destination-chain-label"
          className="destination-chain-select"
          value={currentChain ? currentChain.name : "frog"}
          label="Destination chain*"
          onChange={(e) => handleChange(e.target.value as string)}
        >
          {chains.map((chain) => (
            <MenuItem key={chain.name} value={chain.name}>
              {chain.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* Tooltip text taken from https://docs.tally.xyz/knowledge-base/managing-a-dao/gnosis-safe#owner */}
      <div className="row">
        <p className="create-safe-label">
          Your new safe will initially have the{" "}
          <Tooltip
            className="inline"
            title="An Owner is a signer of the of the Gnosis Safe smart contract wallet. Owner accounts sign off on transactions on the Gnosis Safe smart contract, such as transferring funds from the wallet."
            arrow
          >
            <p className="dotted">same owners</p>
          </Tooltip>{" "}
          and{" "}
          <Tooltip
            className="inline"
            title="The threshold is the number of signers required to confirm a transaction. Once the threshold of owner accounts have confirmed a transaction, the Safe transaction can be executed."
            arrow
          >
            <p className="dotted">threshold</p>
          </Tooltip>{" "}
          that your original safe was deployed with.
          <br />
          <br />
          You can update these later.
        </p>
        {sendTransaction ? (
          <Button className="create-safe-button" size="medium" variant="outlined" disabled={!sendTransaction} onClick={() => sendTransaction()}>
            Deploy
          </Button>
        ) : (
          <Button className="create-safe-button" size="medium" variant="outlined" disabled={!sendTransaction}>
            Deploy
          </Button>
        )}
      </div>
    </div>
  );
}
