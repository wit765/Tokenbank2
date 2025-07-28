import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fetchEvents } from './fetchEvents.js';
import historyRouter from './routes/history.js';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/history', historyRouter);

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.RPC_URL),
});

async function fetchLatestBlockNumber() {
  const latestBlock = await client.getBlockNumber();
  return BigInt(latestBlock);
}

async function start() {
  try {
    // 连接 MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // 获取最新区块号
    const latest = await fetchLatestBlockNumber();

    // 拉取最近 10000 个区块内的事件，注意调整区块范围适合你的链
    const fromBlock = latest > 1000n ? latest - 1000n : 0n;
    const toBlock = latest;

    console.log(`Fetching events from block ${fromBlock} to ${toBlock}...`);
    await fetchEvents(fromBlock, toBlock);
    console.log('Events fetched and saved.');

    // 启动 Express 服务
    app.listen(3001, () => {
      console.log('Server listening on port 3001');
    });

  } catch (err) {
    console.error('Error starting app:', err);
  }
}

start();
