import { SignClient } from "@walletconnect/sign-client";
import { WalletConnectModal } from "@walletconnect/modal";
import { useState, useEffect } from "react";
import { StacksMainnet } from "@stacks/network";
import { makeContractCall, principalCV, uintCV, cvToJSON, TransactionVersion, someCV, noneCV } from "@stacks/transactions";
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
  name: "Royalty Splitter V2",
  description: "A dApp for creating royalty split configurations.",
  url: window.location.origin,
  icons: [window.location.origin + "/vite.svg"],
};

const network = new StacksMainnet();
const contractAddress = "SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP";
const contractName = "royalty-splitter-v2";

// --- React Component ----------------------------------------------------

function App() {
  const [session, setSession] = useState(null);
  const [address, setAddress] = useState("");
  const [txStatus, setTxStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Split creation state
  const [r1, setR1] = useState("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3FY9H5NGR8D4F"); // Example principal
  const [r2, setR2] = useState("SPTEST.test-recipient-2-v2"); // Example principal
  const [r3, setR3] = useState(""); // Optional
  const [p1, setP1] = useState(50); // Percentage
  const [p2, setP2] = useState(30);
  const [p3, setP3] = useState(20);

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

  // Create Split function
  const createSplit = async () => {
    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }
    if (!r1 || !r2 || p1 <= 0 || p2 <= 0 || (r3 && p3 <= 0) || (p1 + p2 + p3 !== 100 && !r3)) {
        alert("Please fill in all split details correctly and ensure percentages sum to 100.");
        return;
    }

    setLoading(true);
    setTxStatus("Creating split...");

    try {
      const functionArgs = [
        principalCV(r1),
        principalCV(r2),
        r3 ? someCV(principalCV(r3)) : noneCV(),
        uintCV(p1),
        uintCV(p2),
        uintCV(p3),
      ];

      const txOptions = {
        contractAddress,
        contractName,
        functionName: "create-split",
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
      console.error("Error creating split:", error);
      setTxStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Royalty Splitter V2</h1>
        {!address ? (
          <button onClick={handleConnect}>Connect Wallet</button>
        ) : (
          <div>
            <p>Connected: {address}</p>
            <button onClick={handleDisconnect}>Disconnect Wallet</button>
          </div>
        )}

        <div className="card">
          <p>Create a new royalty split configuration on Stacks Mainnet.</p>
          <div>
            <label>Recipient 1: </label>
            <input type="text" value={r1} onChange={(e) => setR1(e.target.value)} />
          </div>
          <div>
            <label>Percentage 1 (%): </label>
            <input type="number" value={p1} onChange={(e) => setP1(parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label>Recipient 2: </label>
            <input type="text" value={r2} onChange={(e) => setR2(e.target.value)} />
          </div>
          <div>
            <label>Percentage 2 (%): </label>
            <input type="number" value={p2} onChange={(e) => setP2(parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label>Recipient 3 (Optional): </label>
            <input type="text" value={r3} onChange={(e) => setR3(e.target.value)} />
          </div>
          <div>
            <label>Percentage 3 (%): </label>
            <input type="number" value={p3} onChange={(e) => setP3(parseInt(e.target.value) || 0)} />
          </div>
          <button onClick={createSplit} disabled={!address || loading || p1 + p2 + p3 !== 100}>
            {loading ? "Processing..." : "Create Split"}
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