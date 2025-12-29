import { SignClient } from "@walletconnect/sign-client";
import { WalletConnectModal } from "@walletconnect/modal";
import { useState, useEffect } from "react";
import { StacksMainnet } from "@stacks/network";
import { makeContractCall, stringAsciiCV, uintCV, cvToJSON, TransactionVersion } from "@stacks/transactions";
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
  name: "Name Registry",
  description: "A dApp for interacting with the Name Registry contract.",
  url: window.location.origin,
  icons: [window.location.origin + "/vite.svg"],
};

const network = new StacksMainnet();
const contractAddress = "SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP";
const contractName = "name-registry";

// --- React Component ----------------------------------------------------

function App() {
  const [session, setSession] = useState(null);
  const [address, setAddress] = useState("");
  const [txStatus, setTxStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Name registration state
  const [nameToRegister, setNameToRegister] = useState("my-name");
  const [registrationDuration, setRegistrationDuration] = useState(5000); // blocks

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

  // Register Name function
  const registerName = async () => {
    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }
    if (!nameToRegister || registrationDuration <= 0) {
        alert("Please enter a valid name and duration.");
        return;
    }

    setLoading(true);
    setTxStatus(`Registering name "${nameToRegister}"...`);

    try {
      const functionArgs = [
        stringAsciiCV(nameToRegister),
        uintCV(registrationDuration),
      ];

      const txOptions = {
        contractAddress,
        contractName,
        functionName: "register",
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
      console.error("Error registering name:", error);
      setTxStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Name Registry</h1>
        {!address ? (
          <button onClick={handleConnect}>Connect Wallet</button>
        ) : (
          <div>
            <p>Connected: {address}</p>
            <button onClick={handleDisconnect}>Disconnect Wallet</button>
          </div>
        )}

        <div className="card">
          <p>Register a new name on Stacks Mainnet.</p>
          <div>
            <label>Name: </label>
            <input type="text" value={nameToRegister} onChange={(e) => setNameToRegister(e.target.value)} />
          </div>
          <div>
            <label>Duration (blocks): </label>
            <input type="number" value={registrationDuration} onChange={(e) => setRegistrationDuration(parseInt(e.target.value) || 0)} />
          </div>
          <button onClick={registerName} disabled={!address || loading || !nameToRegister || registrationDuration <= 0}>
            {loading ? "Processing..." : "Register Name"}
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