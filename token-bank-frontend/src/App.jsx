import { useEffect, useState } from "react";
import { createPublicClient, createWalletClient, custom, parseEther } from "viem";
import { localhost } from "viem/chains";

// TokenBank2 和 MyToken 的合约地址
const TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const BANK_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// MyToken ABI（部分）
const TOKEN_ABI = [
  { "type": "function", "name": "balanceOf", "inputs": [{ "name": "account", "type": "address" }], "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "approve", "inputs": [{ "name": "spender", "type": "address" }, { "name": "value", "type": "uint256" }], "outputs": [{ "name": "", "type": "bool" }], "stateMutability": "nonpayable" },
  { "type": "function", "name": "decimals", "inputs": [], "outputs": [{ "name": "", "type": "uint8" }], "stateMutability": "view" }
];

// TokenBank2 ABI（部分）
const BANK_ABI = [
  { "type": "function", "name": "balanceOf", "inputs": [{ "name": "account", "type": "address" }], "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "deposit", "inputs": [{ "name": "amount", "type": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "withdraw", "inputs": [{ "name": "amount", "type": "uint256" }], "outputs": [], "stateMutability": "nonpayable" }
];

// 修改 localhost 链的 ID
const anvilChain = { ...localhost, id: 31337 };

const publicClient = createPublicClient({
  chain: anvilChain,
  transport: custom(window.ethereum)
});

export default function App() {
  const [account, setAccount] = useState("");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [bankBalance, setBankBalance] = useState("0");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // 连接钱包
  async function connectWallet() {
    if (!window.ethereum) {
      alert("请先安装 MetaMask");
      return;
    }
    const [addr] = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(addr);
  }

  // 查询余额
  async function fetchBalances(addr) {
    if (!addr) return;
    const [token, bank, dec] = await Promise.all([
      publicClient.readContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: "balanceOf",
        args: [addr],
      }),
      publicClient.readContract({
        address: BANK_ADDRESS,
        abi: BANK_ABI,
        functionName: "balanceOf",
        args: [addr],
      }),
      publicClient.readContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: "decimals",
      })
    ]);
    setTokenBalance((Number(token) / 10 ** dec).toString());
    setBankBalance((Number(bank) / 10 ** dec).toString());
  }

  useEffect(() => {
    if (account) fetchBalances(account);
  }, [account]);

  // 存款
  async function handleDeposit() {
    if (!depositAmount || isNaN(depositAmount)) return;
    setLoading(true);
    try {
      const walletClient = createWalletClient({
        chain: anvilChain,
        transport: custom(window.ethereum)
      });
      // 先授权
      const amount = BigInt(parseEther(depositAmount));
      await walletClient.writeContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: "approve",
        args: [BANK_ADDRESS, amount],
        account,
      });
      // 再存款
      await walletClient.writeContract({
        address: BANK_ADDRESS,
        abi: BANK_ABI,
        functionName: "deposit",
        args: [amount],
        account,
      });
      await fetchBalances(account);
      setDepositAmount("");
    } catch (e) {
      alert("存款失败: " + (e?.message || e));
    }
    setLoading(false);
  }

  // 取款
  async function handleWithdraw() {
    if (!withdrawAmount || isNaN(withdrawAmount)) return;
    setLoading(true);
    try {
      const walletClient = createWalletClient({
        chain: anvilChain,
        transport: custom(window.ethereum)
      });
      const amount = BigInt(parseEther(withdrawAmount));
      await walletClient.writeContract({
        address: BANK_ADDRESS,
        abi: BANK_ABI,
        functionName: "withdraw",
        args: [amount],
        account,
      });
      await fetchBalances(account);
      setWithdrawAmount("");
    } catch (e) {
      alert("取款失败: " + (e?.message || e));
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 12 }}>
      <h2>TokenBank2 前端演示</h2>
      {account ? (
        <>
          <div>当前账户：<b>{account}</b></div>
          <div>Token 余额：<b>{tokenBalance}</b></div>
          <div>银行存款余额：<b>{bankBalance}</b></div>
          <hr />
          <div>
            <input
              type="number"
              placeholder="存款数量"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              disabled={loading}
              style={{ width: 120, marginRight: 8 }}
            />
            <button onClick={handleDeposit} disabled={loading}>存款</button>
          </div>
          <div style={{ marginTop: 16 }}>
            <input
              type="number"
              placeholder="取款数量"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              disabled={loading}
              style={{ width: 120, marginRight: 8 }}
            />
            <button onClick={handleWithdraw} disabled={loading}>取款</button>
          </div>
        </>
      ) : (
        <button onClick={connectWallet}>连接钱包</button>
      )}
    </div>
  );
}
