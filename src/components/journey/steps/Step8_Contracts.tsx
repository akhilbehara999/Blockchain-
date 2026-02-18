import React, { useState, useRef, useEffect } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { ContractVM } from '../../../engine/ContractVM';
import { VMStep } from '../../../engine/types';
import {
  AlertTriangle, Check, X, Flame,
  Terminal, Unlock, Shield, Zap, Database
} from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import { useInView } from '../../../hooks/useInView';
import { useNavigate } from 'react-router-dom';

type Section = 'intro' | 'deploy' | 'interact' | 'fail' | 'oog' | 'complete';

interface LogEntry {
  step: number;
  name: string;
  status: 'pending' | 'success' | 'failed' | 'reverted';
  gasUsed: number;
}

const Step8_Contracts: React.FC = () => {
  const { completeStep } = useProgress();
  const navigate = useNavigate();

  // Load state helper
  const loadState = (key: string, def: any) => {
    try {
      const saved = localStorage.getItem('yupp_step8_state');
      return saved ? (JSON.parse(saved)[key] ?? def) : def;
    } catch { return def; }
  };

  const [section, setSection] = useState<Section>(() => loadState('section', 'intro'));
  const [contractAddress, setContractAddress] = useState<string | null>(() => loadState('contractAddress', null));
  const [contractBalance, setContractBalance] = useState<number>(() => loadState('contractBalance', 0));
  const [userBalance, setUserBalance] = useState<number>(() => loadState('userBalance', 10));
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem('yupp_step8_state', JSON.stringify({
        section,
        contractAddress,
        contractBalance,
        userBalance
      }));
    } catch {}
  }, [section, contractAddress, contractBalance, userBalance]);
  const [gasMeter, setGasMeter] = useState({ current: 0, max: 0 });
  const [error, setError] = useState<string | null>(null);

  // InView hooks
  const [headerRef, headerVisible] = useInView({ threshold: 0.1 });
  const [storyRef, storyVisible] = useInView({ threshold: 0.1 });
  const [deployRef, deployVisible] = useInView({ threshold: 0.1 });
  const [interactRef, interactVisible] = useInView({ threshold: 0.1 });
  const [completeRef, completeVisible] = useInView({ threshold: 0.1 });

  // VM Instance
  const vmRef = useRef<ContractVM>(new ContractVM({ balance: 0 }));

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
      action: (state) => ({ ...state, balance: ((state.balance as number) || 0) + amount })
    }
  ];

  const getWithdrawSteps = (amount: number): VMStep[] => [
    {
      name: 'Check Balance (require)',
      cost: 2100,
      action: (state) => {
        if (((state.balance as number) || 0) < amount) throw new Error(`require failed: amount > balance (${amount} > ${state.balance})`);
        return {};
      }
    },
    {
      name: 'Transfer Funds',
      cost: 45000,
      action: (state) => ({ ...state, balance: ((state.balance as number) || 0) - amount })
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

    const initialLogs = steps.map((s, i) => ({
      step: i + 1,
      name: s.name,
      status: 'pending' as const,
      gasUsed: 0
    }));
    setLogs(initialLogs);

    const gasPrice = 0.00000001;

    try {
      const result = await vmRef.current.execute(
        steps,
        gasLimit,
        gasPrice,
        (index, stepGas, totalGas) => {
          setGasMeter((prev: any) => ({ ...prev, current: totalGas }));
          setLogs((prev: any) => {
            const newLogs = [...prev];
            if (newLogs[index]) {
                newLogs[index] = { ...newLogs[index], status: 'success', gasUsed: stepGas };
            }
            return newLogs;
          });
        }
      );

      if (result.success) {
        const newState = vmRef.current.getState();
        setContractBalance(newState.balance as number);
        onComplete(true);
      } else {
        setError(result.revertReason || 'Transaction failed');
        // Simplified error handling to avoid TS inference issues
        setLogs((prev: any) => {
            if (!prev) return [];
            const newLogs = [...prev];
            const firstPendingIdx = newLogs.findIndex(l => l.status === 'pending');
            if (firstPendingIdx !== -1) {
                newLogs[firstPendingIdx].status = 'failed';
                for(let i=firstPendingIdx+1; i<newLogs.length; i++) {
                    newLogs[i].status = 'reverted';
                }
            }
            return newLogs;
        });
        onComplete(false);
      }
    } catch {
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
      if (!success) setUserBalance(prev => prev + 3);
    });
  };

  const handleWithdraw = () => {
    runExecution(getWithdrawSteps(2), 100000, (success) => {
      if (success) setUserBalance(prev => prev + 2);
    });
  };

  const handleFailTest = () => {
    runExecution(getWithdrawSteps(5), 100000, (success) => {
      if (!success) {
        setTimeout(() => setSection('oog'), 2000);
      }
    });
  };

  const handleOOGTest = () => {
    runExecution(getDepositSteps(1), 20000, (success) => {
      if (!success) {
        setTimeout(() => {
            setSection('complete');
            completeStep(8);
        }, 2000);
      }
    });
  };

  return (
    <div className="space-y-12 md:space-y-16 pb-20 max-w-4xl mx-auto">

      {/* SECTION 1: HEADER */}
      <div ref={headerRef} className={`space-y-4 ${headerVisible ? 'animate-fade-up' : 'opacity-0'}`}>
        <Badge variant="info">Step 8 of 8</Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Code Is Law</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl">
          When programs run on the blockchain, nobody can stop them.
        </p>
      </div>

      {/* SECTION 2: STORY */}
      <div ref={storyRef} className={storyVisible ? 'animate-fade-up' : 'opacity-0'}>
        <Card variant="glass" className="max-w-prose">
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            Everything you've done so far — sending coins, mining — is just moving numbers around.
            <br/><br/>
            But what if the blockchain could <span className="font-bold text-brand-600 dark:text-brand-400">RUN PROGRAMS</span>?
            Programs that nobody can stop, censor, or change? That's a Smart Contract.
          </p>
          {section === 'intro' && (
              <Button onClick={() => setSection('deploy')} className="mt-6" icon={<Terminal className="w-4 h-4"/>}>
                  Deploy a Contract
              </Button>
          )}
        </Card>
      </div>

      {/* SECTION 3: DEPLOY */}
      {(section === 'deploy' || section === 'interact' || section === 'fail' || section === 'oog' || section === 'complete') && (
        <div ref={deployRef} className={deployVisible ? 'animate-fade-up' : 'opacity-0'}>
           <div className="flex items-center gap-2 mb-6">
             <Terminal className="w-6 h-6 text-gray-500" />
             <h2 className="text-2xl font-bold">Your First Contract: PiggyBank</h2>
           </div>

           <div className="grid md:grid-cols-2 gap-8">
              {/* Code Display */}
              <div className="bg-gray-900 text-gray-100 p-6 rounded-xl font-mono text-sm shadow-xl overflow-hidden border border-gray-700 relative group">
                  <div className="absolute top-0 right-0 p-2 bg-gray-800 text-xs text-gray-400 rounded-bl-lg">Solidity</div>
                  <pre className="language-solidity overflow-x-auto">
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
              </div>

              {/* Deployment Controls */}
              <div className="space-y-6">
                 <Card variant="elevated" className="space-y-4">
                    <h3 className="font-bold text-lg">Deployment Estimate</h3>
                    <div className="space-y-2 text-sm">
                       <div className="flex justify-between">
                          <span className="text-gray-500">Gas Required</span>
                          <span className="font-mono">500,000</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-gray-500">Gas Price</span>
                          <span className="font-mono">0.00001 coins</span>
                       </div>
                       <div className="border-t border-surface-border dark:border-surface-dark-border pt-2 flex justify-between font-bold">
                          <span>Total Cost</span>
                          <span>5.0 coins</span>
                       </div>
                    </div>
                 </Card>

                 {!contractAddress ? (
                   <Button
                     onClick={handleDeploy}
                     disabled={isExecuting}
                     loading={isExecuting}
                     fullWidth
                     icon={<Zap className="w-4 h-4"/>}
                   >
                     {isExecuting ? 'Deploying...' : 'Deploy Contract'}
                   </Button>
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
        </div>
      )}

      {/* SECTION 4: INTERACT */}
      {(section === 'interact' || section === 'fail' || section === 'oog' || section === 'complete') && (
        <div ref={interactRef} className={interactVisible ? 'animate-fade-up' : 'opacity-0'}>
           <div className="flex items-center gap-2 mb-6">
             <Database className="w-6 h-6 text-brand-500" />
             <h2 className="text-2xl font-bold">Interact & State</h2>
           </div>

           <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* User Wallet */}
              <Card variant="elevated" className="relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-2 bg-surface-tertiary dark:bg-surface-dark-tertiary rounded-bl-xl text-xs font-bold text-gray-500">YOU</div>
                 <div className="text-sm text-gray-500 mb-1">Your Balance</div>
                 <div className="text-3xl font-bold font-mono">{userBalance} YUP</div>
              </Card>

              {/* Action Area */}
              <Card variant="outlined" className="md:col-span-2 flex flex-col justify-center">
                 {section === 'interact' && (
                   <div className="flex gap-4">
                      <Button
                        onClick={handleDeposit}
                        disabled={isExecuting || userBalance < 3}
                        fullWidth
                      >
                        Deposit 3 YUP
                      </Button>
                      <Button
                        onClick={handleWithdraw}
                        disabled={isExecuting || contractBalance < 2}
                        fullWidth
                        variant="secondary"
                      >
                        Withdraw 2 YUP
                      </Button>
                   </div>
                 )}

                 {section === 'fail' && (
                    <div className="text-center space-y-4">
                       <p className="font-bold text-status-error flex items-center justify-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Experiment: Break the Rules
                       </p>
                       <p className="text-sm text-gray-600 dark:text-gray-300">
                          You have {contractBalance} YUP in the contract. Try to withdraw 5.
                       </p>
                       <Button
                        onClick={handleFailTest}
                        disabled={isExecuting}
                        fullWidth
                        variant="danger"
                      >
                        Withdraw 5 YUP (Illegal)
                      </Button>
                    </div>
                 )}

                 {section === 'oog' && (
                    <div className="text-center space-y-4">
                       <p className="font-bold text-status-warning flex items-center justify-center gap-2">
                          <Flame className="w-5 h-5" />
                          Experiment: Out of Gas
                       </p>
                       <p className="text-sm text-gray-600 dark:text-gray-300">
                          Operation needs ~47,000 gas. We'll give it only 20,000.
                       </p>
                       <Button
                        onClick={handleOOGTest}
                        disabled={isExecuting}
                        fullWidth
                        variant="secondary" // Changed from warning to secondary (or use danger/primary with custom color)
                        className="bg-yellow-500 hover:bg-yellow-600 text-white" // Override style for warning
                      >
                        Execute with Low Gas
                      </Button>
                    </div>
                 )}

                 {section === 'complete' && (
                    <div className="text-center text-gray-500 py-2">
                       Interaction complete.
                    </div>
                 )}
              </Card>
           </div>

           {/* Contract State */}
           <Card variant="elevated" className="flex items-center justify-between mb-6 bg-brand-50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-brand-100 dark:bg-brand-900/40 rounded-lg text-brand-600 dark:text-brand-400">
                    <Database className="w-6 h-6" />
                 </div>
                 <div>
                    <div className="text-sm text-brand-800 dark:text-brand-300 font-bold">Smart Contract Storage</div>
                    <div className="text-xs font-mono text-brand-600 dark:text-brand-400">{contractAddress || 'Not Deployed'}</div>
                 </div>
              </div>
              <div className="text-right">
                 <div className="text-xs text-brand-500 uppercase font-bold">Balance</div>
                 <div className="text-2xl font-mono font-bold text-brand-900 dark:text-brand-100">{contractBalance} YUP</div>
              </div>
           </Card>

           {/* Execution Logs */}
           {(isExecuting || logs.length > 0) && (
              <Card variant="outlined" className="bg-surface-tertiary dark:bg-black/30">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm uppercase text-gray-500">Execution Log</h3>
                    <div className="text-xs font-mono text-gray-400">VM Trace</div>
                 </div>

                 <div className="space-y-2 mb-4">
                    {logs.map((log, i) => (
                       <div key={i} className="flex items-center justify-between p-2 bg-surface-primary dark:bg-surface-dark-secondary rounded border border-surface-border dark:border-surface-dark-border text-sm">
                          <div className="flex items-center gap-2">
                             {log.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-brand-500 animate-spin" />}
                             {log.status === 'success' && <Check className="w-4 h-4 text-status-valid" />}
                             {log.status === 'failed' && <X className="w-4 h-4 text-status-error" />}
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
                 <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden mt-2 relative">
                    <div
                        className={`h-full transition-all duration-300 ${error && error === 'Out of gas' ? 'bg-status-error' : 'bg-brand-500'}`}
                        style={{ width: `${Math.min((gasMeter.current / Math.max(gasMeter.max, 1)) * 100, 100)}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 z-10">
                        {Math.round(gasMeter.current).toLocaleString()} / {gasMeter.max.toLocaleString()} Gas
                    </div>
                 </div>
              </Card>
           )}

           {/* Transition Logic */}
           {section === 'interact' && contractBalance === 1 && userBalance === 9 && (
               <div className="text-center mt-6 animate-fade-up">
                  <p className="text-status-valid font-bold mb-4">Transaction Successful!</p>
                  <Button
                    onClick={() => {
                        setSection('fail');
                        setLogs([]);
                        setError(null);
                        setGasMeter({current: 0, max: 0});
                    }}
                    variant="primary"
                  >
                    Next Experiment →
                  </Button>
               </div>
           )}
        </div>
      )}

      {/* SECTION 5: COMPLETE */}
      {section === 'complete' && (
        <div ref={completeRef} className={completeVisible ? 'animate-fade-up' : 'opacity-0'}>
           <Card variant="default" status="valid" className="text-center p-8">
              <div className="w-20 h-20 bg-surface-primary dark:bg-surface-dark-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-2 border-status-valid">
                  <Check className="w-10 h-10 text-status-valid" />
              </div>

              <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-purple-500">
                 JOURNEY COMPLETE!
              </h2>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                 You have mastered the fundamentals of blockchain. From identity to mining, from consensus to code.
              </p>

              <div className="flex justify-center gap-4">
                  <Button
                     onClick={() => navigate('/sandbox')}
                     size="lg"
                     icon={<Unlock className="w-5 h-5" />}
                  >
                     Enter Sandbox
                  </Button>
                  <Button
                     onClick={() => navigate('/challenges')}
                     size="lg"
                     variant="secondary"
                     icon={<Shield className="w-5 h-5" />}
                  >
                     View Challenges
                  </Button>
              </div>
           </Card>
        </div>
      )}

    </div>
  );
};

export default Step8_Contracts;
