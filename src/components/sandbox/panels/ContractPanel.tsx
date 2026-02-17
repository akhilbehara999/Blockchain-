import React, { useState } from 'react';
import { FileCode, Play, Plus, Zap, Code, Cpu, RefreshCw, Terminal, CheckCircle } from 'lucide-react';
import { useSandboxStore, DeployedContract } from '../../../stores/useSandboxStore';
import { useWalletStore } from '../../../stores/useWalletStore';
import { ContractVM } from '../../../engine/ContractVM';
import { VMStep } from '../../../engine/types';
import { NodeIdentity } from '../../../engine/NodeIdentity';
import SandboxPanel from '../SandboxPanel';
import ProgressBar from '../../ui/ProgressBar';

// Templates Registry
const CONTRACT_TEMPLATES = [
  {
    id: 'simple-storage',
    name: 'SimpleStorage',
    description: 'Store and retrieve a single number.',
    initialState: { value: 0 },
    functions: [
      { name: 'setValue', args: ['number'], cost: 5000 },
      { name: 'getValue', args: [], cost: 1000 }
    ]
  },
  {
    id: 'counter',
    name: 'Counter',
    description: 'Increment a counter value.',
    initialState: { count: 0 },
    functions: [
      { name: 'increment', args: [], cost: 2000 },
      { name: 'reset', args: [], cost: 1500 }
    ]
  },
  {
    id: 'token',
    name: 'MyToken',
    description: 'Simple token with mint and transfer.',
    initialState: { totalSupply: 1000, balances: { 'owner': 1000 } },
    functions: [
      { name: 'transfer', args: ['address', 'amount'], cost: 8000 },
      { name: 'mint', args: ['amount'], cost: 5000 }
    ]
  }
];

const ContractPanel: React.FC = () => {
  const { mode, deployedContracts, addContract, updateContractState, incrementMastery } = useSandboxStore();
  const { sendTransaction, wallets } = useWalletStore();

  const [selectedTemplate, setSelectedTemplate] = useState(CONTRACT_TEMPLATES[0].id);
  const [deploying, setDeploying] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  // Interaction State
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [args, setArgs] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);

  const selectedContract = deployedContracts.find(c => c.id === selectedContractId);

  const handleDeploy = () => {
    setDeploying(true);
    const template = CONTRACT_TEMPLATES.find(t => t.id === selectedTemplate)!;

    // Simulate deployment delay
    setTimeout(() => {
        const address = '0x' + Math.random().toString(16).substring(2, 42);
        const newContract: DeployedContract = {
            id: crypto.randomUUID(),
            name: template.name,
            address: address,
            state: template.initialState,
            abi: template.functions,
            createdAt: Date.now()
        };
        addContract(newContract);
        incrementMastery('contractsDeployed');
        setDeploying(false);
        setSelectedContractId(newContract.id);
    }, 1500);
  };

  const handleExecute = async () => {
    if (!selectedContract || !selectedFunction) return;

    setExecuting(true);
    setResult(null);

    // Find function definition
    const funcDef = selectedContract.abi.find((f: any) => f.name === selectedFunction);
    if (!funcDef) return;

    // Cost calculation
    const gasLimit = funcDef.cost;
    const gasPrice = 0.000001; // cheap
    const totalCost = gasLimit * gasPrice;

    // Check balance in Node Mode
    const userId = NodeIdentity.getOrCreate().getId();
    const userWallet = wallets.find(w => w.name === userId || w.name === 'You');

    if (mode === 'node') {
        if (!userWallet || userWallet.balance < totalCost) {
            setResult(`Error: Insufficient funds for gas. Need ${totalCost} coins.`);
            incrementMastery('gasFailures');
            setExecuting(false);
            return;
        }
        // Deduct gas via transaction to "Network" (burn)
        sendTransaction(userWallet.name, 'Network_Burn', totalCost, 0);
    }

    // Prepare Logic Steps based on template/function
    let steps: VMStep[] = [];

    // Logic Mapping (Simplified for Sandbox)
    if (selectedContract.name === 'SimpleStorage') {
        if (selectedFunction === 'setValue') {
            const val = parseInt(args[0]);
            steps = [{ name: 'STORE', cost: 5000, action: (s) => ({ ...s, value: val }) }];
        } else if (selectedFunction === 'getValue') {
            steps = [{ name: 'LOAD', cost: 1000, action: (s) => { setResult(`Output: ${s.value}`); return s; } }];
        }
    } else if (selectedContract.name === 'Counter') {
        if (selectedFunction === 'increment') {
             steps = [{ name: 'ADD', cost: 2000, action: (s) => ({ ...s, count: s.count + 1 }) }];
        } else if (selectedFunction === 'reset') {
             steps = [{ name: 'ZERO', cost: 1500, action: (s) => ({ ...s, count: 0 }) }];
        }
    } else if (selectedContract.name === 'MyToken') {
        if (selectedFunction === 'transfer') {
             const to = args[0];
             const amount = parseInt(args[1]);
             steps = [{ name: 'TRANSFER', cost: 8000, action: (s) => {
                 if (s.balances['owner'] >= amount) {
                     return {
                         ...s,
                         balances: {
                             ...s.balances,
                             'owner': s.balances['owner'] - amount,
                             [to]: (s.balances[to] || 0) + amount
                         }
                     };
                 }
                 throw new Error('Insufficient balance');
             }}];
        } else if (selectedFunction === 'mint') {
             const amount = parseInt(args[0]);
             steps = [{ name: 'MINT', cost: 5000, action: (s) => ({
                 ...s,
                 totalSupply: s.totalSupply + amount,
                 balances: { ...s.balances, 'owner': s.balances['owner'] + amount }
             }) }];
        }
    }

    try {
        const vm = new ContractVM(selectedContract.state);
        // Execute
        const res = await vm.execute(steps, mode === 'god' ? 1000000 : gasLimit, gasPrice);

        if (res.success) {
            updateContractState(selectedContract.id, res.result);
            if (!result) setResult(`Success! Gas used: ${res.gasUsed}`);
        } else {
            setResult(`Reverted: ${res.revertReason}`);
            incrementMastery('gasFailures');
        }
    } catch (e: any) {
        setResult(`Error: ${e.message}`);
    } finally {
        setExecuting(false);
    }
  };

  return (
    <SandboxPanel
        title="Smart Contracts"
        icon={FileCode}
        footer={
             selectedContractId ? (
                <button
                    onClick={() => setSelectedContractId(null)}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-3 h-3" /> Back to Deploy
                </button>
             ) : (
                <div className="text-[10px] text-gray-400 text-center">
                    Select a template to deploy a new contract instance.
                </div>
             )
        }
    >
      <div className="h-full flex flex-col">
        {selectedContractId && selectedContract ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-pink-500" />
                            {selectedContract.name}
                        </h4>
                        <div className="text-[10px] text-gray-500 font-mono mt-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded w-fit">
                            {selectedContract.address}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-gray-400">State Size</div>
                        <div className="text-xs font-mono font-bold text-gray-600 dark:text-gray-300">{JSON.stringify(selectedContract.state).length} B</div>
                    </div>
                </div>

                {/* State View - Code Editor Style */}
                <div className="relative group">
                    <div className="absolute top-2 right-2 text-[10px] text-gray-500 font-mono bg-gray-800/50 px-2 py-0.5 rounded">STATE</div>
                    <div className="bg-gray-900 text-gray-300 p-4 rounded-xl font-mono text-xs overflow-x-auto custom-scrollbar shadow-inner min-h-[80px]">
                        <pre>{JSON.stringify(selectedContract.state, null, 2)}</pre>
                    </div>
                </div>

                {/* Functions */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                        <Terminal className="w-3 h-3" /> Interact
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        {selectedContract.abi.map((f: any) => (
                            <button
                                key={f.name}
                                onClick={() => {
                                    setSelectedFunction(f.name);
                                    setArgs(new Array(f.args.length).fill(''));
                                    setResult(null);
                                }}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                    selectedFunction === f.name
                                    ? 'bg-pink-50 border-pink-500 text-pink-700 dark:bg-pink-900/20 dark:border-pink-500 dark:text-pink-400 shadow-sm'
                                    : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {f.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Execution Form */}
                {selectedFunction && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4 animate-in fade-in duration-300">
                        {selectedContract.abi.find((f: any) => f.name === selectedFunction)?.args.length > 0 && (
                            <div className="grid grid-cols-1 gap-3">
                                {selectedContract.abi.find((f: any) => f.name === selectedFunction)?.args.map((arg: string, i: number) => (
                                    <div key={i} className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-gray-400">{arg}</label>
                                        <input
                                            placeholder={`Enter ${arg}...`}
                                            value={args[i]}
                                            onChange={(e) => {
                                                const newArgs = [...args];
                                                newArgs[i] = e.target.value;
                                                setArgs(newArgs);
                                            }}
                                            className="w-full text-xs p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 font-mono focus:ring-2 focus:ring-pink-500 outline-none"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-gray-500 flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-yellow-500" /> Gas Limit
                                </span>
                                <span className="font-mono text-gray-700 dark:text-gray-300">
                                    {selectedContract.abi.find((f: any) => f.name === selectedFunction)?.cost}
                                </span>
                            </div>
                            <ProgressBar
                                value={100}
                                size="sm"
                                color="warning"
                                showPercentage={false}
                                animated={false}
                                className="opacity-50"
                            />
                        </div>

                        <button
                            onClick={handleExecute}
                            disabled={executing}
                            className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-pink-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {executing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                            {executing ? 'Executing...' : 'Execute Transaction'}
                        </button>
                    </div>
                )}

                {/* Result Console */}
                {result && (
                    <div className={`p-3 rounded-lg text-xs border font-mono flex items-start gap-2 ${
                        result.startsWith('Error') || result.startsWith('Reverted')
                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                        : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                    }`}>
                        <div className="mt-0.5">
                            {result.startsWith('Error') || result.startsWith('Reverted') ? <Zap className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        </div>
                        <div className="break-all">{result}</div>
                    </div>
                )}
            </div>
        ) : (
            // Deploy View
            <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 gap-3">
                    {CONTRACT_TEMPLATES.map(t => (
                        <div
                            key={t.id}
                            onClick={() => setSelectedTemplate(t.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                                selectedTemplate === t.id
                                ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 dark:bg-indigo-900/20 shadow-md'
                                : 'bg-white border-gray-200 hover:border-indigo-300 dark:bg-gray-800 dark:border-gray-700'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-lg ${selectedTemplate === t.id ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                                    <Code className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-sm text-gray-900 dark:text-white">{t.name}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 pl-11">{t.description}</p>
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                     <button
                        onClick={handleDeploy}
                        disabled={deploying}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
                     >
                        {deploying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {deploying ? 'Deploying to Network...' : 'Deploy Contract'}
                     </button>
                </div>

                {deployedContracts.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <h5 className="text-xs font-bold text-gray-400 uppercase mb-3">Active Contracts</h5>
                        <div className="space-y-2">
                            {deployedContracts.map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => setSelectedContractId(c.id)}
                                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between transition-colors group"
                                >
                                    <div className="flex items-center gap-2">
                                        <Cpu className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{c.name}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-mono bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded">{c.address.substring(0, 6)}...</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </SandboxPanel>
  );
};

export default ContractPanel;
