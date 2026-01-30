import React, { useState } from 'react';
import { showConnect } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';
import { makeContractCall, uintCV, stringAsciiCV } from '@stacks/transactions';

const BridgeInterface = () => {
  const [userSession, setUserSession] = useState(null);
  const [amount, setAmount] = useState('');
  const [btcAddress, setBtcAddress] = useState('');

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'BTC Bridge Helper',
        icon: window.location.origin + '/logo.svg',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserSession(true);
      },
      userSession,
    });
  };

  const initiateBridge = async () => {
    if (!userSession || !amount || !btcAddress) return;

    const txOptions = {
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'btc-bridge-helper',
      functionName: 'initiate-bridge',
      functionArgs: [uintCV(parseInt(amount)), stringAsciiCV(btcAddress)],
      network: new StacksTestnet(),
      onFinish: (data) => {
        console.log('Bridge initiated:', data);
      },
    };

    await makeContractCall(txOptions);
  };

  return (
    <div className="bridge-interface">
      <h2>BTC Bridge Helper</h2>
      {!userSession ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="BTC Address"
            value={btcAddress}
            onChange={(e) => setBtcAddress(e.target.value)}
          />
          <button onClick={initiateBridge}>Initiate Bridge</button>
        </div>
      )}
    </div>
  );
};

export default BridgeInterface;
