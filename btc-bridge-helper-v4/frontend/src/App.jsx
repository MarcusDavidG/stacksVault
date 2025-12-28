import { useState, useEffect } from "react";
import { AppConfig, UserSession, showConnect } from "@stacks/connect";
import { StacksTestnet } from "@stacks/network";
import { callReadOnlyFunction, principalCV } from "@stacks/transactions";
import "./App.css";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

// NOTE: Using Testnet configuration as Mainnet deployment details were not found in the project.
const network = new StacksTestnet();
const contractAddress = "ST3P3DPDB69YP0Z259SS6MSA16GBQEBF8KG8P96D2";
const contractName = "btc-bridge-helper";
const functionName = "get-formatted-message";

function App() {
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    }
  }, []);

  const handleConnect = () => {
    showConnect({
      appDetails: {
        name: "BTC Bridge Helper",
        icon: window.location.origin + "/vite.svg",
      },
      redirectTo: "/",
      onFinish: () => {
        window.location.reload();
      },
      userSession,
    });
  };

  const handleDisconnect = () => {
    userSession.signUserOut("/");
  };

  const fetchMessage = async () => {
    if (!userData) {
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
        functionArgs: [principalCV(userData.profile.stxAddress.testnet)],
        network,
        senderAddress: userData.profile.stxAddress.testnet,
      });
      console.log("Raw contract call result:", result);
      // Assuming the result is a tuple with a 'message' property
      // This might need adjustment based on the actual return type of the contract function
      if (result && typeof result.value !== 'undefined') {
         // The contract returns (ok (tuple (message (string-utf8 ...))))
         const resultValue = result.value.data.message.data;
         setMessage(resultValue);
      } else {
        setMessage("Could not parse message from contract response.");
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
        {userData ? (
          <div>
            <p>Connected: {userData.profile.stxAddress.testnet}</p>
            <button onClick={handleDisconnect}>Disconnect Wallet</button>
          </div>
        ) : (
          <button onClick={handleConnect}>Connect Wallet</button>
        )}

        <div className="card">
          <button onClick={fetchMessage} disabled={!userData || loading}>
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