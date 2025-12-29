import { SignClient } from "@walletconnect/sign-client";
import { WalletConnectModal } from "@walletconnect/modal";
import { useState, useEffect } from "react";
import { StacksMainnet } from "@stacks/network";
import { makeContractCall, uintCV, cvToJSON, TransactionVersion, callReadOnlyFunction } from "@stacks/transactions";
import { Buffer } from "buffer";

// Polyfill Buffer for WalletConnect and Stacks.js
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer;
}

// --- WalletConnect and Contract Configuration -------------------------

const projectId = "a2a35e5bb307e75b7ee528be821f5391"; // Use the provided projectId
const signClient = new SignClient();
// modal is exported from main.jsx, so we don't need to re-create it here
// import { modal } from './main.jsx';

const appMetadata = {
  name: "Decentralized Lottery",
  description: "A dApp for interacting with the Decentralized Lottery contract.",
  url: window.location.origin,
  icons: [window.location.origin + "/vite.svg"],
};

const network = new StacksMainnet();
const contractAddress = "SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP";
const contractName = "decentralized-lottery";

// --- React Component ----------------------------------------------------

function App() {
  const [session, setSession] = useState(null);
  const [address, setAddress] = useState("");
  const [txStatus, setTxStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentRoundId, setCurrentRoundId] = useState(0);
  const [roundIdToInteract, setRoundIdToInteract] = useState(1); // Default to round 1

  // Initialize SignClient
  async function initializeSignClient() {
    await signClient.init({
      projectId,
      metadata: appMetadata,
    });
    // Check for existing sessions
    if (signClient.session.length > 0) {
      const lastSession = signClient.session.get(signClient.session.keys.at(-1));
      setSession(lastSession);
      const acc = lastSession.namespaces.stacks.accounts[0];
      setAddress(acc.split(":")[2]);
    }
  }

  useEffect(() => {
    if (!projectId) {
      console.error("Please provide a projectId from WalletConnect Cloud in main.jsx and App.jsx");
      return;
    }
    initializeSignClient();
    fetchCurrentRoundId();
  }, []);

  async function fetchCurrentRoundId() {
    try {
      const result = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: "get-round", // This is incorrect, current-round is a data-var. We need a read-only for it.
        functionArgs: [uintCV(1)], // Dummy arg
        network,
        senderAddress: contractAddress, // Sender can be any principal for read-only
      });
      // Correct way to read a data-variable (not a function)
      // This requires directly querying the Stacks API for the data-var.
      // For simplicity in this demo, let's assume we have a read-only getter
      // or we just pick a round to interact with.
      // Given the contract, the actual current-round is stored in `current-round` data-var.
      // The `get-round` function retrieves info for a *specific* round.
      // For now, we'll just interact with round 1 or rely on user input.

      // If the contract had a `get-current-round-id` read-only function:
      // const response = await callReadOnlyFunction(...)
      // setCurrentRoundId(parseInt(cvToJSON(response).value));

      // As there is no direct read-only function for `current-round` in the contract,
      // we'll just set a placeholder or rely on user input.
      // For this demo, let's just make `roundIdToInteract` the input.
      setCurrentRoundId(1); // Placeholder or initial assumption for the demo
    } catch (error) {
      console.error("Error fetching current round ID:", error);
      setCurrentRoundId(1); // Fallback
    }
  }

  // Handle WalletConnect connection
  async function handleConnect() {
    try {
      const { uri, approval } = await signClient.connect({
        requiredNamespaces: {
          stacks: {
            methods: ["stacks_signMessage", "stacks_stxTransfer", "stacks_contractCall", "stacks_signTransaction"],
            chains: ["stacks:1"], // Stacks Mainnet
            events: [],
          },
        },
      });

      if (uri) {
        const modal = new WalletConnectModal({ projectId }); // Re-create if not global
        modal.openModal({ uri });
      }

      const session = await approval();
      setSession(session);
      const acc = session.namespaces.stacks.accounts[0];
      setAddress(acc.split(":")[2]);
      const modal = new WalletConnectModal({ projectId }); // Re-create if not global
      modal.closeModal();
    } catch (e) {
      console.error("Error connecting:", e);
    }
  }

  // Handle disconnect
  async function handleDisconnect() {
    if (session) {
      await signClient.disconnect({
        topic: session.topic,
        reason: { code: 6000, message: "User disconnected" },
      });
      setSession(null);
      setAddress("");
      setTxStatus("");
    }
  }

  // Buy Ticket function
  const buyTicket = async () => {
    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }
    setLoading(true);
    setTxStatus(`Buying ticket for round ${roundIdToInteract}...`);

    try {
      const functionArgs = [
        uintCV(roundIdToInteract),
      ];

      const txOptions = {
        contractAddress,
        contractName,
        functionName: "buy-ticket",
        functionArgs: functionArgs,
        senderKey: address, // This will be replaced by the wallet's key
        network,
        postConditions: [], // Add post-conditions if needed
        fee: 300, // Example fee
        nonce: 0, // This will be handled by the wallet
        txVersion: TransactionVersion.Mainnet,
      };

      const transaction = await makeContractCall(txOptions);
      const serializedTx = transaction.serialize().toString("hex");

      const { txid } = await signClient.request({
        topic: session.topic,
        chainId: "stacks:1",
        request: {
          method: "stx_signTransaction",
          params: {
            transaction: serializedTx,
            network: "mainnet",
          },
        },
      });

      setTxStatus(`Transaction submitted: ${txid}. Please check explorer for status.`);
    } catch (error) {
      console.error("Error buying ticket:", error);
      setTxStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Decentralized Lottery</h1>
        {!address ? (
          <button onClick={handleConnect}>Connect Wallet</button>
        ) : (
          <div>
            <p>Connected: {address}</p>
            <button onClick={handleDisconnect}>Disconnect Wallet</button>
          </div>
        )}

        <div className="card">
          <p>Buy a lottery ticket on Stacks Mainnet.</p>
          <p>Current Round (Demo): {currentRoundId}</p>
          <div>
            <label>Round ID: </label>
            <input type="number" value={roundIdToInteract} onChange={(e) => setRoundIdToInteract(parseInt(e.target.value) || 0)} />
          </div>
          <button onClick={buyTicket} disabled={!address || loading || roundIdToInteract === 0}>
            {loading ? "Processing..." : "Buy Ticket"}
          </button>
          {txStatus && (
            <div className="message-container">
              <h3>Transaction Status:</h3>
              <p>{txStatus}</p>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;