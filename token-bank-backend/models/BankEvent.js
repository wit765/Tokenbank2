import mongoose from 'mongoose';

const BankEventSchema = new mongoose.Schema({
  type: String, // 'deposit' 或 'withdraw'
  user: String,
  amount: String,
  txHash: String,
  blockNumber: Number,
  timestamp: Number,
});

const BankEvent = mongoose.model('BankEvent', BankEventSchema);

export default BankEvent;  // 这里必须是 default 导出