import { ApiKey } from "src/models/user/apiKey.model"
import { EventLog } from "src/models/user/event-log.model"
import { ethers } from 'ethers';


const privateKey = process.env.EVM_WALLET_PRIVATE_KEY || ''
const providerUrl = process.env.PROVIDER_URL || ''
const contractAddress = process.env.NODE_ENV === 'development' ?
  process.env.USDE_SEPOLIA_CONTRACT_ADDRESS
  : process.env.USDE_MAINNET_CONTRACT_ADDRESS

export const transferToken = async (apiKey: string, walletAddress: string, amount: number) => {
  try {
    //create a log for the user
    const api = await ApiKey.findOne({ publicKey: apiKey })
    if (!api) {
      throw new Error("Invalid API Key")
    }
    const eventLog = new EventLog({
      user: api.user,
      eventType: "payment",
      walletAddress,
      amount
    })
    await eventLog.save()


    //transfer token

    const provider = new ethers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    const tokenAbi = [
      {
        inputs: [
          { internalType: 'address', name: '_to', type: 'address' },
          { internalType: 'uint256', name: '_value', type: 'uint256' },
        ],
        name: 'transfer',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ]
    const tokenContract = new ethers.Contract(contractAddress!, tokenAbi, wallet);
    const actualAmount = amount / 100

    const totalAmountInWei = ethers.parseUnits(actualAmount.toString(), 18);
    const walletBalance = await tokenContract.balanceOf(wallet.address);
    const walletBalanceBigInt = BigInt(walletBalance.toString());
    if (walletBalanceBigInt < totalAmountInWei) {
      console.error(`Insufficient funds: Wallet balance is ${ethers.formatUnits(walletBalance, 18)}, required is ${actualAmount}`);
      return;
    }
    const tx = await tokenContract.transfer(walletAddress, totalAmountInWei, {
      gasLimit: 200000
    });

    return
  } catch (error) {
    throw error
  }
}