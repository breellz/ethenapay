
import Web3, { EventLog } from 'web3';

type VerifyEtherTransactionResult = {
  success: string;
} | {
  error: string;
} | boolean;

const tokenAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  }
];

export function addWithPrecision(num1: number, num2: number) {
  const num1Decimals = (num1.toString().split('.')[1] || []).length;
  const num2Decimals = (num2.toString().split('.')[1] || []).length;
  const maxDecimals = Math.max(num1Decimals, num2Decimals);
  return Number((Number(num1) + Number(num2)).toFixed(maxDecimals));
}


export const getEthConfirmations = async (txHash: string, url: string) => {
  try {
    const web3 = new Web3(url);
    const trx = await web3.eth.getTransaction(txHash)
    const currentBlock = await web3.eth.getBlockNumber()
    return trx.blockNumber === null ? 0 : BigInt(currentBlock) - BigInt(trx.blockNumber || 0);

  }
  catch (error) {
    return console.log(error)
  }
}

export const confirmEtherTransaction = async (txHash: string, url: string, confirmations = 10,) => {
  let trxConfirmations = 0;

  while (trxConfirmations < confirmations) {
    trxConfirmations = Number(await getEthConfirmations(txHash, url));

    if (trxConfirmations < confirmations) {

      await new Promise(resolve => setTimeout(resolve, 10 * 1000));
    }
  }

  return {
    success: 'Transaction confirmed'
  };
}

export const verifyEtherTransaction = async (
  tokenAddress: string,
  tokenDecimal: number,
  txHash: string,
  url: string,
  walletAddress: string,
  quantity: number,
): Promise<VerifyEtherTransactionResult> => {

  try {
    const web3 = new Web3(url);

    const trx = await web3.eth.getTransaction(txHash);
    if (trx && trx.to && trx.to.toLowerCase() === tokenAddress.toLowerCase()) {

      const response = await confirmEtherTransaction(txHash, url);
      if (response && 'success' in response) {

        const contract = new web3.eth.Contract(tokenAbi, tokenAddress);
        const blockNumber = trx.blockNumber;
        console.log('blockNumber', blockNumber)
        const events = await contract.getPastEvents('allEvents', { fromBlock: blockNumber, toBlock: blockNumber });
        const transferEvents = events.filter((event): event is EventLog => typeof event !== 'string' && event.event === 'Transfer');

        // Check if there is a Transfer event to the wallet address
        for (const event of transferEvents) {
          if ('returnValues' in event &&
            typeof event.returnValues.to === 'string' &&
            event.returnValues.to.toLowerCase() === walletAddress.toLowerCase()) {

            const divisor = tokenDecimal === 18 ? 1e18 : 1e6;
            const transferredAmount = Number(event.returnValues.value) / divisor;

            // const result = addWithPrecision(quantity, fee);

            console.log('transferredAmount', transferredAmount)
            if (transferredAmount === quantity) {

              console.log('Transaction confirmed and token delivered')
              return true
            } else {
              console.log('transferedAmount not equal not the required amount')
              return false
            }
          }
        }
        console.log('Token not delivered to the expected wallet')
        return false
      }
      console.log('Transaction not confirmed after multiple checks, please investigate')
      return false
    } else {
      console.log('Transaction was not to the expected contract')
      return false
    }

  } catch (error) {
    console.log('Error verifying transaction', error)
    return false
  }

}