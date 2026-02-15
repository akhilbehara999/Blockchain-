import React, { useState, useEffect, useRef } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { ContractVM } from '../../../engine/ContractVM';
import { VMStep } from '../../../engine/types';
import {
  Code, AlertTriangle, Check, X, Flame,
  ArrowRight, Database, Shield, Zap, Terminal, Unlock
} from 'lucide-react';

type Section = 'intro' | 'deploy' | 'interact' | 'fail' | 'oog' | 'complete';

interface LogEntry {
  step: number;
  name: string;
  status: 'pending' | 'success' | 'failed' | 'reverted';
  gasUsed: number;
}

const Step8_Contracts: React.FC = () => {
  const { completeStep } = useProgress();
  const [section, setSection] = useState<Section>('intro');
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [contractBalance, setContractBalance] = useState(0);
  const [userBalance, setUserBalance] = useState(10); // Simulated user balance
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [gasMeter, setGasMeter] = useState({ current: 0, max: 0 });
  const [error, setError] = useState<string | null>(null);

  // Scroll refs
  const deployRef = useRef<HTMLDivElement>(null);
  const interactRef = useRef<HTMLDivElement>(null);
  const completeRef = useRef<HTMLDivElement>(null);

  // VM Instance
  const vmRef = useRef<ContractVM>(new ContractVM({ balance: 0 }));

  // Scroll helper
  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  useEffect(() => {
    if (section === 'deploy') scrollTo(deployRef);
    if (section === 'interact') scrollTo(interactRef);
    if (section === 'complete') scrollTo(completeRef);
  }, [section]);

  // Contract Logic Definitions
  const DEPLOY_STEPS: VMStep[] = [
    {
      name: 'Compile Bytecode',
      cost: 150000,
      action: () => ({ deployed: true })
    },
    {
      name: 'Initialize State',
      cost: 50000,
      action: (state) => ({ ...state, balance: 0 })
    },
    {
      name: 'Store Code',
      cost: 300000,
      action: () => ({ stored: true })
    }
  ];

  const getDepositSteps = (amount: number): VMStep[] => [
    {
      name: 'Check Deposit Amount',
      cost: 2100,
      action: () => {
        if (amount <= 0) throw new Error('Amount must be positive');
        return {};
      }
    },
    {
      name: 'Update Ledger',
      cost: 45000,
      action: (state) => ({ ...state, balance: (state.balance || 0) + amount })
    }
  ];

  const getWithdrawSteps = (amount: number): VMStep[] => [
    {
      name: 'Check Balance (require)',
      cost: 2100,
      action: (state) => {
        if ((state.balance || 0) < amount) throw new Error(`require failed: amount > balance (${amount} > ${state.balance})`);
        return {};
      }
    },
    {
      name: 'Transfer Funds',
      cost: 45000,
      action: (state) => ({ ...state, balance: (state.balance || 0) - amount })
    }
  ];

  // Execution Helper
  const runExecution = async (
    steps: VMStep[],
    gasLimit: number,
    onComplete: (success: boolean) => void
  ) => {
    setIsExecuting(true);
    setLogs([]);
    setError(null);
    setGasMeter({ current: 0, max: gasLimit });

    // Initialize logs
    const initialLogs = steps.map((s, i) => ({
      step: i + 1,
      name: s.name,
      status: 'pending' as const,
      gasUsed: 0
    }));
    setLogs(initialLogs);

    const gasPrice = 0.00000001; // Simplified gas price

    try {
      const result = await vmRef.current.execute(
        steps,
        gasLimit,
        gasPrice,
        (index, stepGas, totalGas) => {
          // Update logs and gas meter progressively
          setGasMeter(prev => ({ ...prev, current: totalGas }));
          setLogs(prev => {
            const newLogs = [...prev];
            if (newLogs[index]) {
                newLogs[index] = { ...newLogs[index], status: 'success', gasUsed: stepGas };
            }
            return newLogs;
          });
        }
      );

      if (result.success) {
        // Update local state from VM
        const newState = vmRef.current.getState();
        setContractBalance(newState.balance);
        onComplete(true);
      } else {
        // Handle failure (revert or OOG)
        setError(result.revertReason || 'Transaction failed');
        setLogs(prev => {
            const newLogs = [...prev];
            // Find first pending and mark as failed
            const firstPendingIdx = newLogs.findIndex(l => l.status === 'pending');
            if (firstPendingIdx !== -1) {
                newLogs[firstPendingIdx].status = 'failed';
                // Subsequent are reverted
                for(let i=firstPendingIdx+1; i<newLogs.length; i++) {
                    newLogs[i].status = 'reverted';
                }
            } else {
                // If all marked success but result failed (maybe last step?), mark last as failed
                // But normally execute throws before callback if step fails?
                // Wait, ContractVM execute logic: loops steps, if error catches.
                // onStep is called AFTER step success. So if step fails, onStep NOT called for it.
                // So pending index logic is correct.
            }
            return newLogs;
        });
        onComplete(false);
      }
    } catch (e) {
      console.error(e);
      onComplete(false);
    } finally {
      setIsExecuting(false);
    }
  };

  // Handlers
  const handleDeploy = () => {
    runExecution(DEPLOY_STEPS, 600000, (success) => {
      if (success) {
        setContractAddress('0x71C...9A2');
        setTimeout(() => setSection('interact'), 1000);
      }
    });
  };

  const handleDeposit = () => {
    if (userBalance < 3) return;
    setUserBalance(prev => prev - 3);
    runExecution(getDepositSteps(3), 100000, (success) => {
      if (!success) setUserBalance(prev => prev + 3); // Refund if failed (logic error, not gas)
    });
  };

  const handleWithdraw = () => {
    runExecution(getWithdrawSteps(2), 100000, (success) => {
      if (success) setUserBalance(prev => prev + 2);
    });
  };

  const handleFailTest = () => {
    // Attempt to withdraw 5 (when balance is likely 1 after +3 -2)
    // We don't deduct user balance first because we expect fail
    runExecution(getWithdrawSteps(5), 100000, (success) => {
      if (!success) {
        // This is expected
        setTimeout(() => setSection('oog'), 2000);
      }
    });
  };

  const handleOOGTest = () => {
    // Attempt deposit with insufficient gas
    // Steps: Check(2100) + Update(45000) = 47100
    // Limit: 20000
    runExecution(getDepositSteps(1), 20000, (success) => {
      if (!success) {
        // Expected OOG
        setTimeout(() => {
            setSection('complete');
            completeStep(8);
        }, 2000);
      }
    });
  };

  // UI Helpers
  const GasBar = () => (
    <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden mt-2 relative">
      <div
        className={`h-full transition-all duration-300 ${error && error === 'Out of gas' ? 'bg-red-500' : 'bg-blue-500'}`}
        style={{ width: `${Math.min((gasMeter.current / Math.max(gasMeter.max, 1)) * 100, 100)}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 z-10">
         {Math.round(gasMeter.current).toLocaleString()} / {gasMeter.max.toLocaleString()} Gas
      </div>
    </div>
  );

  return (
    <div className="space-y-16 pb-20 max-w-4xl mx-auto">

      {/* SECTION 1 — THE HOOK */}
      <section className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center justify-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
          <Code className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Code Is Law</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          When programs run on the blockchain, nobody can stop them.
        </p>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-left space-y-4 max-w-2xl mx-auto shadow-sm">
          <p className="text-lg">
            Everything you've done so far — sending coins, mining — is just moving numbers around.
          </p>
          <p className="text-lg">
            But what if the blockchain could <span className="font-bold text-purple-600 dark:text-purple-400">RUN PROGRAMS</span>?
            Programs that nobody can stop, censor, or change?
          </p>
          <div className="pt-2 flex items-center text-gray-500 text-sm justify-center">
            <ArrowRight className="w-4 h-4 mr-2" />
            That's a Smart Contract. Let's deploy one.
          </div>
        </div>

        {section === 'intro' && (
          <button
            onClick={() => setSection('deploy')}
            className="mt-8 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 transition-all transform hover:-translate-y-1 hover:scale-105"
          >
            Start Coding
          </button>
        )}
      </section>

      {/* SECTION 2 — DEPLOY */}
      {(section === 'deploy' || section === 'interact' || section === 'fail' || section === 'oog' || section === 'complete') && (
        <section ref={deployRef} className="space-y-8 border-t border-gray-200 dark:border-gray-800 pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <h2 className="text-2xl font-bold flex items-center gap-2">
             <Terminal className="w-6 h-6 text-gray-500" />
             Your First Contract: PiggyBank
           </h2>

           <div className="grid md:grid-cols-2 gap-8">
              {/* Code Display */}
              <div className="bg-gray-900 text-gray-100 p-6 rounded-xl font-mono text-sm shadow-xl overflow-hidden border border-gray-700 relative group">
                  <div className="absolute top-0 right-0 p-2 bg-gray-800 text-xs text-gray-400 rounded-bl-lg">Solidity</div>
                  <pre className="language-solidity">
{`contract PiggyBank {
  uint256 public balance = 0;

  function deposit(amount) {
    balance = balance + amount;
  }

  function withdraw(amount) {
    require(amount <= balance);
    balance = balance - amount;
  }
}`}
                  </pre>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent pointer-events-none"></div>
              </div>

              {/* Deployment Controls */}
              <div className="space-y-6">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Deployment Estimate</h3>
                    <div className="space-y-3 text-sm">
                       <div className="flex justify-between">
                          <span className="text-gray-500">Gas Required</span>
                          <span className="font-mono">500,000</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-gray-500">Gas Price</span>
                          <span className="font-mono">0.00001 coins</span>
                       </div>
                       <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold">
                          <span>Total Cost</span>
                          <span>5.0 coins</span>
                       </div>
                    </div>
                 </div>

                 {!contractAddress ? (
                   <button
                     onClick={handleDeploy}
                     disabled={isExecuting}
                     className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isExecuting ? <Flame className="w-5 h-5 animate-pulse text-orange-400" /> : <Zap className="w-5 h-5" />}
                     {isExecuting ? 'Deploying...' : 'Deploy Contract'}
                   </button>
                 ) : (
                   <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-green-700 dark:text-green-400">
                      <Check className="w-6 h-6" />
                      <div>
                         <div className="font-bold">Contract Deployed!</div>
                         <div className="text-xs font-mono opacity-75">{contractAddress}</div>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </section>
      )}

      {/* SECTION 3 — INTERACT */}
      {(section === 'interact' || section === 'fail' || section === 'oog' || section === 'complete') && (
        <section ref={interactRef} className="space-y-8 border-t border-gray-200 dark:border-gray-800 pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <h2 className="text-2xl font-bold flex items-center gap-2">
             <Database className="w-6 h-6 text-blue-500" />
             Interact & State
           </h2>

           <div className="grid md:grid-cols-3 gap-6">
              {/* User Wallet */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-bl-xl text-xs font-bold text-gray-500">YOU</div>
                 <div className="text-sm text-gray-500 mb-1">Your Balance</div>
                 <div className="text-3xl font-bold font-mono">{userBalance} YUP</div>
              </div>

              {/* Action Area */}
              <div className="md:col-span-2 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                 {section === 'interact' && (
                   <div className="flex gap-4">
                      <button
                        onClick={handleDeposit}
                        disabled={isExecuting || userBalance < 3}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                      >
                        Deposit 3 YUP
                      </button>
                      <button
                        onClick={handleWithdraw}
                        disabled={isExecuting || contractBalance < 2}
                        className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                      >
                        Withdraw 2 YUP
                      </button>
                   </div>
                 )}

                 {section === 'fail' && (
                    <div className="text-center space-y-4">
                       <p className="font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Experiment: Break the Rules
                       </p>
                       <p className="text-sm text-gray-600 dark:text-gray-300">
                          You have {contractBalance} YUP in the contract. Try to withdraw 5.
                       </p>
                       <button
                        onClick={handleFailTest}
                        disabled={isExecuting}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all disabled:opacity-50 animate-pulse"
                      >
                        Withdraw 5 YUP (Illegal)
                      </button>
                    </div>
                 )}

                 {section === 'oog' && (
                    <div className="text-center space-y-4">
                       <p className="font-bold text-orange-600 dark:text-orange-400 flex items-center justify-center gap-2">
                          <Flame className="w-5 h-5" />
                          Experiment: Out of Gas
                       </p>
                       <p className="text-sm text-gray-600 dark:text-gray-300">
                          Operation needs ~47,000 gas. We'll give it only 20,000.
                       </p>
                       <button
                        onClick={handleOOGTest}
                        disabled={isExecuting}
                        className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                      >
                        Execute with Low Gas
                      </button>
                    </div>
                 )}

                 {section === 'complete' && (
                    <div className="text-center text-gray-500 py-4">
                       Interaction complete.
                    </div>
                 )}
              </div>
           </div>

           {/* Contract State */}
           <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                    <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                 </div>
                 <div>
                    <div className="text-sm text-indigo-800 dark:text-indigo-300 font-bold">Smart Contract Storage</div>
                    <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{contractAddress || 'Not Deployed'}</div>
                 </div>
              </div>
              <div className="text-right">
                 <div className="text-xs text-indigo-500 uppercase font-bold">Balance</div>
                 <div className="text-2xl font-mono font-bold text-indigo-900 dark:text-indigo-100">{contractBalance} YUP</div>
              </div>
           </div>

           {/* Execution Logs & Gas Meter */}
           {(isExecuting || logs.length > 0) && (
              <div className="bg-gray-100 dark:bg-black/30 p-6 rounded-xl border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-300">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm uppercase text-gray-500">Execution Log</h3>
                    <div className="text-xs font-mono text-gray-400">VM Trace</div>
                 </div>

                 <div className="space-y-2 mb-4">
                    {logs.map((log, i) => (
                       <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm">
                          <div className="flex items-center gap-2">
                             {log.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" />}
                             {log.status === 'success' && <Check className="w-4 h-4 text-green-500" />}
                             {log.status === 'failed' && <X className="w-4 h-4 text-red-500" />}
                             {log.status === 'reverted' && <div className="w-4 h-4 text-gray-400 text-[10px] flex items-center justify-center">↩️</div>}
                             <span className={log.status === 'reverted' ? 'text-gray-400 line-through' : ''}>{log.name}</span>
                          </div>
                          <div className="font-mono text-xs text-gray-500">
                             {log.gasUsed > 0 ? `${log.gasUsed.toLocaleString()} gas` : ''}
                          </div>
                       </div>
                    ))}
                 </div>

                 {error && (
                    <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg font-bold flex items-center gap-2 mb-4 animate-bounce">
                       <AlertTriangle className="w-4 h-4" />
                       Error: {error}
                    </div>
                 )}

                 <div className="text-xs font-bold text-gray-500 uppercase mb-1">Gas Meter</div>
                 <GasBar />
                 <div className="text-xs text-center mt-2 text-gray-400">
                    {error === 'Out of gas' ? 'Transaction ran out of fuel. State reverted.' : 'Gas consumed for operations.'}
                 </div>
              </div>
           )}

           {/* Transition Logic for next steps */}
           {section === 'interact' && (
             // Logic: We need to wait for user to do BOTH deposit and withdraw?
             // Or just do deposit then withdraw then move on.
             // The logic:
             // Start: User 10, Contract 0
             // Dep 3: User 7, Contract 3
             // With 2: User 9, Contract 1
             contractBalance === 1 && userBalance === 9 ? (
               <div className="text-center animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-green-600 dark:text-green-400 font-bold mb-2">Transaction Successful!</p>
                  <button
                    onClick={() => {
                        setSection('fail');
                        setLogs([]);
                        setError(null);
                        setGasMeter({current: 0, max: 0});
                    }}
                    className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-bold hover:scale-105 transition-transform"
                  >
                    Next Experiment →
                  </button>
               </div>
             ) : null
           )}
        </section>
      )}

      {/* SECTION 4 — COMPLETE */}
      {section === 'complete' && (
        <section ref={completeRef} className="space-y-8 border-t border-gray-200 dark:border-gray-800 pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-8 rounded-3xl border border-green-100 dark:border-green-800 text-center shadow-2xl">
              <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <div className="relative">
                    <Check className="w-10 h-10 text-green-500" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                  </div>
              </div>

              <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400">
                 JOURNEY COMPLETE!
              </h2>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                 You have mastered the fundamentals of blockchain. From identity to mining, from consensus to code.
              </p>

              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10 text-left">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                     <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Unlock className="w-6 h-6 text-green-600 dark:text-green-400" />
                     </div>
                     <div>
                        <div className="font-bold text-lg">Sandbox Unlocked</div>
                        <div className="text-sm text-gray-500">Free play mode enabled</div>
                     </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                     <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                     </div>
                     <div>
                        <div className="font-bold text-lg">Challenges Unlocked</div>
                        <div className="text-sm text-gray-500">Test your skills</div>
                     </div>
                  </div>
              </div>

              <div className="flex justify-center gap-4">
                  <a href="/sandbox" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xl transition-transform hover:scale-105 flex items-center gap-2">
                     Enter Sandbox <ArrowRight className="w-5 h-5" />
                  </a>
                  <a href="/challenges" className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-bold shadow-md transition-transform hover:scale-105">
                     View Challenges
                  </a>
              </div>
           </div>
        </section>
      )}

    </div>
  );
};

export default Step8_Contracts;
