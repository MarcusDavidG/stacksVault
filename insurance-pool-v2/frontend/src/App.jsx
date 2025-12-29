import { SignClient } from "@walletconnect/sign-client";
import { WalletConnectModal } from "@walletconnect/modal";
import { useState, useEffect } from "react";
import { StacksMainnet } from "@stacks/network";
import { makeContractCall, uintCV, cvToJSON, TransactionVersion } from "@stacks/transactions";
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
  name: "Insurance Pool V2",
  description: "A dApp for interacting with the Insurance Pool V2 contract.",
  url: window.location.origin,
  icons: [window.location.origin + "/vite.svg"],
};

const network = new StacksMainnet();
const contractAddress = "SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP";
const contractName = "insurance-pool-v2";

// --- React Component ----------------------------------------------------

function App() {
  const [session, setSession] = useState(null);
  const [address, setAddress] = useState("");
  const [txStatus, setTxStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Policy creation state
  const [coverageAmount, setCoverageAmount] = useState(50000000); // 50 STX
  const [policyDuration, setPolicyDuration] = useState(1000); // blocks

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
  }, []);

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

  // Create Policy function
  const createPolicy = async () => {
    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }
    if (coverageAmount <= 0 || policyDuration <= 0) {
        alert("Please enter valid coverage and duration amounts.");
        return;
    }

    setLoading(true);
    setTxStatus("Creating policy...");

    try {
      const functionArgs = [
        uintCV(coverageAmount),
        uintCV(policyDuration),
      ];

      const txOptions = {
        contractAddress,
        contractName,
        functionName: "create-policy",
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
      console.error("Error creating policy:", error);
      setTxStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Insurance Pool V2</h1>
        {!address ? (
          <button onClick={handleConnect}>Connect Wallet</button>
        ) : (
          <div>
            <p>Connected: {address}</p>
            <button onClick={handleDisconnect}>Disconnect Wallet</button>
          </div>
        )}

        <div className="card">
          <p>Create a new insurance policy on Stacks Mainnet.</p>
          <div>
            <label>Coverage (micro-STX): </label>
            <input type="number" value={coverageAmount} onChange={(e) => setCoverageAmount(parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label>Duration (blocks): </label>
            <input type="number" value={policyDuration} onChange={(e) => setPolicyDuration(parseInt(e.target.value) || 0)} />
          </div>
          <button onClick={createPolicy} disabled={!address || loading || coverageAmount <= 0 || policyDuration <= 0}>
            {loading ? "Processing..." : "Create Policy"}
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