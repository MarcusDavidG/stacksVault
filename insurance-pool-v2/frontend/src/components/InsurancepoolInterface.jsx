import React, { useState, useEffect } from 'react';
import { showConnect } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';
import { makeContractCall, uintCV, stringAsciiCV } from '@stacks/transactions';

const InsurancepoolInterface = () => {
  const [userSession, setUserSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState(null);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Insurance-pool-v2 Interface',
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
        contractName: 'insurance-pool-v2',
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
    <div className="insurance-pool-v2-interface">
      <h2>Insurance-pool-v2 Interface</h2>
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

export default InsurancepoolInterface;
