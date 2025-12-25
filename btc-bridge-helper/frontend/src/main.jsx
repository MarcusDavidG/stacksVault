import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { WalletConnectModal } from "@walletconnect/modal";

// You need to get a project ID from https://cloud.walletconnect.com
const projectId = "YOUR_PROJECT_ID";

if (!projectId || projectId === "YOUR_PROJECT_ID") {
  throw new Error("You need to provide a projectId from WalletConnect Cloud");
}

const modal = new WalletConnectModal({
  projectId,
  // The WalletConnect modal does not natively support Stacks, so we can't define it here.
  // We will request the 'stacks_mainnet' namespace during the connection request.
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);