import React, { useState } from 'react';
import { showConnect } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';
import { makeContractCall, uintCV, stringAsciiCV } from '@stacks/transactions';

const BridgeV2Interface = () => {
  const [userSession, setUserSession] = useState(null);
  const [amount, setAmount] = useState('');
  const [btcAddress, setBtcAddress] = useState('');
  const [metadata, setMetadata] = useState('');

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'BTC Bridge Helper V2',
        icon: window.location.origin + '/logo.svg',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserSession(true);
      },
      userSession,
    });
  };

  const initiateBridgeV2 = async () => {
    if (!userSession || !amount || !btcAddress) return;

    const txOptions = {
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'btc-bridge-helper-v2',
      functionName: 'initiate-bridge-v2',
      functionArgs: [
        uintCV(parseInt(amount)), 
        stringAsciiCV(btcAddress),
        stringAsciiCV(metadata || 'default')
      ],
      network: new StacksTestnet(),
      onFinish: (data) => {
        console.log('Bridge V2 initiated:', data);
      },
    };

    await makeContractCall(txOptions);
  };

  return (
    <div className="bridge-v2-interface">
      <h2>BTC Bridge Helper V2</h2>
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
          <input
            type="text"
            placeholder="Metadata (optional)"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
          />
          <button onClick={initiateBridgeV2}>Initiate Bridge V2</button>
        </div>
      )}
    </div>
  );
};

export default BridgeV2Interface;
