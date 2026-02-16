import React, { useState } from 'react';
import { FileCode, Play, Plus, Zap, Code, Cpu, RefreshCw } from 'lucide-react';
import { useSandboxStore, DeployedContract } from '../../../stores/useSandboxStore';
import { useWalletStore } from '../../../stores/useWalletStore';
import { ContractVM } from '../../../engine/ContractVM';
import { VMStep } from '../../../engine/types';
import { NodeIdentity } from '../../../engine/NodeIdentity';

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
    // We reconstruct logic here because we can't persist it.
    // This is a mapping from function name to logic.
    let steps: VMStep[] = [];

    // Logic Mapping
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
                 // Simplified logic
                 // Assume sender is 'owner' for sandbox
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
    <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
          <FileCode className="w-4 h-4 text-pink-500" />
          Smart Contracts
        </h3>
        <button
            onClick={() => setSelectedContractId(null)}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors"
        >
            <Plus className="w-3 h-3" /> Deploy
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedContractId && selectedContract ? (
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{selectedContract.name}</h4>
                        <div className="text-[10px] text-gray-500 font-mono">{selectedContract.address}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-gray-400">State Size</div>
                        <div className="text-xs font-mono">{JSON.stringify(selectedContract.state).length} bytes</div>
                    </div>
                </div>

                {/* State View */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-200 dark:border-gray-700 font-mono text-xs overflow-x-auto">
                    <pre className="text-gray-600 dark:text-gray-300">{JSON.stringify(selectedContract.state, null, 2)}</pre>
                </div>

                {/* Functions */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase">Interact</label>
                    <div className="flex gap-2 flex-wrap">
                        {selectedContract.abi.map((f: any) => (
                            <button
                                key={f.name}
                                onClick={() => {
                                    setSelectedFunction(f.name);
                                    setArgs(new Array(f.args.length).fill(''));
                                    setResult(null);
                                }}
                                className={`px-2 py-1 text-xs rounded border transition-colors ${
                                    selectedFunction === f.name
                                    ? 'bg-pink-50 border-pink-500 text-pink-700 dark:bg-pink-900/20 dark:border-pink-500 dark:text-pink-400'
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
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded space-y-3 animate-in fade-in">
                        {selectedContract.abi.find((f: any) => f.name === selectedFunction)?.args.length > 0 && (
                            <div className="grid grid-cols-1 gap-2">
                                {selectedContract.abi.find((f: any) => f.name === selectedFunction)?.args.map((arg: string, i: number) => (
                                    <input
                                        key={i}
                                        placeholder={`${arg}`}
                                        value={args[i]}
                                        onChange={(e) => {
                                            const newArgs = [...args];
                                            newArgs[i] = e.target.value;
                                            setArgs(newArgs);
                                        }}
                                        className="text-xs p-1.5 rounded border border-gray-300 dark:border-gray-600"
                                    />
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-yellow-500" />
                                Gas Cost: {selectedContract.abi.find((f: any) => f.name === selectedFunction)?.cost}
                            </span>
                            <button
                                onClick={handleExecute}
                                disabled={executing}
                                className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded text-xs font-bold shadow-sm disabled:opacity-50"
                            >
                                {executing ? 'Running...' : 'Execute'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Result */}
                {result && (
                    <div className={`p-2 rounded text-xs border font-mono ${result.startsWith('Error') || result.startsWith('Reverted') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                        {result}
                    </div>
                )}
            </div>
        ) : (
            // Deploy View
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                    {CONTRACT_TEMPLATES.map(t => (
                        <div
                            key={t.id}
                            onClick={() => setSelectedTemplate(t.id)}
                            className={`p-3 rounded border cursor-pointer transition-all ${
                                selectedTemplate === t.id
                                ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 dark:bg-indigo-900/20'
                                : 'bg-white border-gray-200 hover:border-indigo-300 dark:bg-gray-800 dark:border-gray-700'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Code className="w-4 h-4 text-indigo-500" />
                                <span className="font-bold text-sm text-gray-900 dark:text-white">{t.name}</span>
                            </div>
                            <p className="text-xs text-gray-500">{t.description}</p>
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                     <button
                        onClick={handleDeploy}
                        disabled={deploying}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-bold shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                        {deploying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        {deploying ? 'Deploying...' : 'Deploy Contract'}
                     </button>
                </div>
            </div>
        )}

        {/* Contract List (Sidebar or Bottom if time permits, but for now we toggle views) */}
        {!selectedContractId && deployedContracts.length > 0 && (
            <div className="mt-6">
                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Deployed Contracts</h5>
                <div className="space-y-2">
                    {deployedContracts.map(c => (
                        <div
                            key={c.id}
                            onClick={() => setSelectedContractId(c.id)}
                            className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">{c.name}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">{c.address.substring(0, 6)}...</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ContractPanel;
