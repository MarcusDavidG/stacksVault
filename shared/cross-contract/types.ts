export interface ContractCall {
  contract: string;
  function: string;
  args: any[];
}

export interface BatchTransaction {
  calls: ContractCall[];
  sender: string;
}

export interface ContractEvent {
  contract: string;
  event: string;
  data: any;
}
