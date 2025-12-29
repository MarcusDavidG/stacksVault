import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { WalletConnectModal } from "@walletconnect/modal";

const projectId = "a2a35e5bb307e75b7ee528be821f5391"; // Use the provided projectId

if (!projectId || projectId === "YOUR_PROJECT_ID") {
  throw new Error("You need to provide a projectId from WalletConnect Cloud");
}

export const modal = new WalletConnectModal({
  projectId,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);