import { SignClient } from "@walletconnect/sign-client";
import { WalletConnectModal } from "@walletconnect/modal";
import { useState, useEffect } from "react";
import { StacksMainnet } from "@stacks/network";
import { callReadOnlyFunction, cvToJSON, principalCV, stringUtf8CV } from "@stacks/transactions";
import "./App.css";

// --- WalletConnect and Contract Configuration -------------------------

// You need to get a project ID from https://cloud.walletconnect.com
const projectId = "YOUR_PROJECT_ID"; 
const signClient = new SignClient();
const modal = new WalletConnectModal({ projectId });

const appMetadata = {
  name: "BTC Bridge Helper",
  description: "A dApp for interacting with the BTC Bridge Helper contract.",
  url: window.location.origin,
  icons: [window.location.origin + "/vite.svg"],
};

const network = new StacksMainnet();
const contractAddress = "SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP";
const contractName = "btc-bridge-helper";
const functionName = "get-formatted-message";

// --- React Component ----------------------------------------------------

function App() {
  const [session, setSession] = useState(null);
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!projectId || projectId === "YOUR_PROJECT_ID") {
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
            methods: ["stacks_signMessage", "stacks_stxTransfer", "stacks_contractCall"],
            chains: ["stacks:1"], // Stacks Mainnet
            events: [],
          },
        },
      });

      if (uri) {
        modal.openModal({ uri });
      }

      const session = await approval();
      setSession(session);
      const acc = session.namespaces.stacks.accounts[0];
      setAddress(acc.split(":")[2]);
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
    }
  }

  // Call the read-only contract function
  const fetchMessage = async () => {
    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const result = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName,
        functionArgs: [stringUtf8CV("Hello from the frontend!")], // This function expects a string arg
        network,
        senderAddress: address,
      });

      const resultJson = cvToJSON(result);
       if (resultJson.success) {
         // The contract returns (ok (tuple (message (string-utf8 ...))))
         setMessage(resultJson.value.value.message.value);
       } else {
         console.error("Contract call failed:", resultJson.error);
         setMessage("Contract call failed. Check console.");
       }
    } catch (error) {
      console.error("Error fetching message:", error);
      setMessage("Error fetching message. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>BTC Bridge Helper</h1>
        {!address ? (
          <button onClick={handleConnect}>Connect Wallet</button>
        ) : (
          <div>
            <p>Connected: {address}</p>
            <button onClick={handleDisconnect}>Disconnect Wallet</button>
          </div>
        )}

        <div className="card">
          <p>Interact with the contract on Stacks Mainnet.</p>
          <button onClick={fetchMessage} disabled={!address || loading}>
            {loading ? "Loading..." : "Get Formatted Message"}
          </button>
          {message && (
            <div className="message-container">
              <h3>Contract Message:</h3>
              <p>{message}</p>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;