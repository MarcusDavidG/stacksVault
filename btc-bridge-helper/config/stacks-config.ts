export interface StacksConfig {
  network: 'mainnet' | 'testnet';
  contractAddress: string;
  contractName: string;
  apiUrl: string;
}

export const TESTNET_CONFIG: StacksConfig = {
  network: 'testnet',
  contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contractName: 'btc-bridge-helper',
  apiUrl: 'https://stacks-node-api.testnet.stacks.co'
};

export const MAINNET_CONFIG: StacksConfig = {
  network: 'mainnet',
  contractAddress: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contractName: 'btc-bridge-helper',
  apiUrl: 'https://stacks-node-api.mainnet.stacks.co'
};

export const getConfig = (isMainnet: boolean = false): StacksConfig => {
  return isMainnet ? MAINNET_CONFIG : TESTNET_CONFIG;
};

export const CONTRACT_FUNCTIONS = {
  READ_ONLY: [
    'get-balance',
    'get-info',
    'get-status'
  ],
  PUBLIC: [
    'execute-function',
    'update-status',
    'transfer'
  ]
};
