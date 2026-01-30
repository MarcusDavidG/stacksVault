import React, { useState, useEffect } from 'react';
import { showConnect } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';
import { makeContractCall, uintCV, stringAsciiCV } from '@stacks/transactions';

const BtcbridgehelperInterface = () => {
  const [userSession, setUserSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState(null);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Btc-bridge-helper-v3 Interface',
        icon: window.location.origin + '/logo.svg',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserSession(true);
      },
      userSession,
    });
  };

  const executeContractFunction = async (functionName, args) => {
    if (!userSession) return;
    
    setLoading(true);
    try {
      const txOptions = {
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        contractName: 'btc-bridge-helper-v3',
        functionName,
        functionArgs: args,
        network: new StacksTestnet(),
        onFinish: (data) => {
          setTxResult(data);
          setLoading(false);
        },
      };

      await makeContractCall(txOptions);
    } catch (error) {
      console.error('Transaction failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className="btc-bridge-helper-v3-interface">
      <h2>Btc-bridge-helper-v3 Interface</h2>
      {!userSession ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Wallet Connected</p>
          {loading && <p>Transaction in progress...</p>}
          {txResult && <p>Transaction ID: {txResult.txId}</p>}
          <button 
            onClick={() => executeContractFunction('test-function', [])}
            disabled={loading}
          >
            Execute Function
          </button>
        </div>
      )}
    </div>
  );
};

export default BtcbridgehelperInterface;
