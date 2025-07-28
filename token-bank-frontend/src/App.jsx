import { useEffect, useState } from "react";
import { createPublicClient, createWalletClient, http, custom, parseEther } from "viem";
import { localhost } from "viem/chains";

const TOKEN_ADDRESS = "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9";
const BANK_ADDRESS = "0xdc64a140aa3e981100a9beca4e685f962f0cf6c9";

const TOKEN_ABI = [
  { "type": "function", "name": "balanceOf", "inputs": [{ "name": "account", "type": "address" }], "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "approve", "inputs": [{ "name": "spender", "type": "address" }, { "name": "value", "type": "uint256" }], "outputs": [{ "name": "", "type": "bool" }], "stateMutability": "nonpayable" },
  { "type": "function", "name": "decimals", "inputs": [], "outputs": [{ "name": "", "type": "uint8" }], "stateMutability": "view" }
];

const BANK_ABI = [
  { "type": "function", "name": "balanceOf", "inputs": [{ "name": "account", "type": "address" }], "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "deposit", "inputs": [{ "name": "amount", "type": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "withdraw", "inputs": [{ "name": "amount", "type": "uint256" }], "outputs": [], "stateMutability": "nonpayable" }
];

const anvilChain = { ...localhost, id: 31337 };

const publicClient = createPublicClient({
  chain: anvilChain,
  transport: http("http://localhost:8545"),
});

export default function App() {
  const [account, setAccount] = useState("");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [bankBalance, setBankBalance] = useState("0");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // 连接钱包
  async function connectWallet() {
    if (!window.ethereum) {
      alert("请先安装 MetaMask");
      return;
    }
    
    try {
      // 请求连接钱包
      const [addr] = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(addr);
      
      // 检查当前网络
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0x7a69') {
        alert('当前网络不正确，正在切换到 Anvil 网络...');
      }
      
      // 尝试切换到 Anvil 网络
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7a69' }], // 31337 in hex
        });
      } catch (switchError) {
        // 如果网络不存在，则添加网络
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x7a69',
                chainName: 'Anvil',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['http://localhost:8545'],
                blockExplorerUrls: []
              }]
            });
          } catch (addError) {
            console.error('添加网络失败:', addError);
          }
        }
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
      alert('连接钱包失败: ' + error.message);
    }
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
      }),
    ]);
    setTokenBalance((Number(token) / 10 ** dec).toString());
    setBankBalance((Number(bank) / 10 ** dec).toString());
  }

  // 查询用户交易历史，调用后端接口
  async function fetchHistory(addr) {
    if (!addr) return setHistory([]);
    try {
      const res = await fetch(`/history/${addr}`);
      if (!res.ok) throw new Error("请求历史记录失败");
      const data = await res.json();
      setHistory(data);
    } catch (e) {
      console.error("获取历史记录失败:", e);
      setHistory([]);
    }
  }

  useEffect(() => {
    if (account) {
      fetchBalances(account);
      fetchHistory(account);
    }
    
    // 监听网络变化
    if (window.ethereum) {
      const handleChainChanged = (chainId) => {
        if (chainId !== '0x7a69') {
          alert('请切换到 Anvil 网络 (Chain ID: 31337)');
        }
      };
      
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setAccount('');
        } else {
          setAccount(accounts[0]);
        }
      };
      
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [account]);

  async function handleDeposit() {
    if (!depositAmount || isNaN(depositAmount)) return;
    setLoading(true);
    try {
      const walletClient = createWalletClient({
        chain: anvilChain,
        transport: custom(window.ethereum),
        account,
      });
      const amount = parseEther(depositAmount);
      await walletClient.writeContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: "approve",
        args: [BANK_ADDRESS, amount],
      });
      await walletClient.writeContract({
        address: BANK_ADDRESS,
        abi: BANK_ABI,
        functionName: "deposit",
        args: [amount],
      });
      await fetchBalances(account);
      await fetchHistory(account);
      setDepositAmount("");
    } catch (e) {
      alert("存款失败: " + (e?.message || e));
    }
    setLoading(false);
  }

  async function handleWithdraw() {
    if (!withdrawAmount || isNaN(withdrawAmount)) return;
    setLoading(true);
    try {
      const walletClient = createWalletClient({
        chain: anvilChain,
        transport: custom(window.ethereum),
        account,
      });
      const amount = parseEther(withdrawAmount);
      await walletClient.writeContract({
        address: BANK_ADDRESS,
        abi: BANK_ABI,
        functionName: "withdraw",
        args: [amount],
      });
      await fetchBalances(account);
      await fetchHistory(account);
      setWithdrawAmount("");
    } catch (e) {
      alert("取款失败: " + (e?.message || e));
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 12 }}>
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

          <hr />
          <h3>交易历史</h3>
          {history.length === 0 ? (
            <p>暂无交易记录</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #ccc" }}>
                  <th style={{ textAlign: "left", padding: 8 }}>类型</th>
                  <th style={{ textAlign: "left", padding: 8 }}>数量</th>
                  <th style={{ textAlign: "left", padding: 8 }}>交易哈希</th>
                  <th style={{ textAlign: "left", padding: 8 }}>时间</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 8 }}>{item.type}</td>
                    <td style={{ padding: 8 }}>{item.amount}</td>
                    <td style={{ padding: 8 }}>
                      <a href={`https://sepolia.etherscan.io/tx/${item.txHash}`} target="_blank" rel="noreferrer" style={{ color: "#3498db" }}>
                        {item.txHash.slice(0, 6)}...{item.txHash.slice(-4)}
                      </a>
                    </td>
                    <td style={{ padding: 8 }}>{new Date(item.timestamp * 1000).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : (
        <button onClick={connectWallet}>连接钱包</button>
      )}
    </div>
  );
}
