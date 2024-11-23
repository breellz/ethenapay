
import Web3, { EventLog } from 'web3';
import axios from 'axios';

export interface VerifyEtherTransactionResult {
  success: boolean;
  transferredAmount?: number;
}


export const verifyEthenaTransaction = async (
  tokenDecimal: number,
  txHash: string,
  url: string,
  walletAddress: string,
  quantity: number,
): Promise<VerifyEtherTransactionResult> => {
  try {
    const web3 = new Web3(url);

    // Fetch transaction details using Axios
    const response = await axios.get(`${url}/transactions/${txHash}`);

    const transaction = response.data;

    // Verify the transaction details
    if (

      transaction.method === 'transfer' && transaction.status === 'ok'
    ) {
      const tokenTransfer = transaction.token_transfers.find((transfer: any) => transfer.tx_hash === txHash);

      if (tokenTransfer && tokenTransfer.to.hash === walletAddress) {
        const transferredAmount = Number(tokenTransfer.total.value) / Math.pow(10, tokenDecimal);
        if (transferredAmount === quantity) {
          return { success: true, transferredAmount };
        }
      }
    }

    return { success: false };
  } catch (error) {
    console.log('Error verifying transaction', error);
    return { success: false };
  }
};