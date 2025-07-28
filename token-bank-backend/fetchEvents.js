// fetchEvents.js
import { createPublicClient, http, parseAbiItem } from 'viem';
import { localhost } from 'viem/chains';
import mongoose from 'mongoose';
import BankEvent from './models/BankEvent.js';

// 配置为 Anvil 本地网络
const anvilChain = { ...localhost, id: 31337 };

const publicClient = createPublicClient({
  chain: anvilChain,
  transport: http('http://localhost:8545'),
});

const tokenBankAddress = '0xdc64a140aa3e981100a9beca4e685f962f0cf6c9';

// 事件 ABI 定义
const depositEvent = parseAbiItem('event Deposit(address indexed user, uint256 amount)');
const withdrawEvent = parseAbiItem('event Withdraw(address indexed user, uint256 amount)');

export async function fetchEvents(fromBlock, toBlock) {
  const blocks = {};

  // 👇 监听 Deposit
  const depositLogs = await publicClient.getLogs({
    address: tokenBankAddress,
    fromBlock,
    toBlock,
    event: depositEvent,
  });

  for (const log of depositLogs) {
    if (!blocks[log.blockNumber]) {
      const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
      blocks[log.blockNumber] = block.timestamp;
    }

    const { user, amount } = log.args;

    await BankEvent.create({
      type: 'deposit',
      user: user.toLowerCase(),
      amount: amount.toString(),
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      timestamp: blocks[log.blockNumber],
    });
  }

  // 👇 监听 Withdraw
  const withdrawLogs = await publicClient.getLogs({
    address: tokenBankAddress,
    fromBlock,
    toBlock,
    event: withdrawEvent,
  });

  for (const log of withdrawLogs) {
    if (!blocks[log.blockNumber]) {
      const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
      blocks[log.blockNumber] = block.timestamp;
    }

    const { user, amount } = log.args;

    await BankEvent.create({
      type: 'withdraw',
      user: user.toLowerCase(),
      amount: amount.toString(),
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      timestamp: blocks[log.blockNumber],
    });
  }

  console.log(`Fetched ${depositLogs.length} deposit logs`);
  console.log(`Fetched ${withdrawLogs.length} withdraw logs`);
}