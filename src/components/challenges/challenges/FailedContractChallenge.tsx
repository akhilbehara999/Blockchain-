import React, { useState } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { ContractVM } from '../../../engine/ContractVM';
import { VMStep } from '../../../engine/types';
import Button from '../../../components/ui/Button';
import { Terminal, AlertTriangle, CheckCircle, Zap, Ban, RotateCcw } from 'lucide-react';

const FailedContractChallenge: React.FC = () => {
  const { challenges, updateChallengeProgress } = useProgress();
  const [amount, setAmount] = useState<number>(10);
  const [gasLimit, setGasLimit] = useState<number>(25000);
  const [logs, setLogs] = useState<string[]>([]);
  const [failures, setFailures] = useState<{
      require: boolean;
      gas: boolean;
      overflow: boolean;
  }>({
      require: false,
      gas: false,
      overflow: false
  });

  // Create VM instance (recreated on render is fine for this stateless challenge logic,
  // but if we wanted persistence we'd use useMemo)
  const vm = new ContractVM({ balance: 1000 });

  const runContract = async () => {
      setLogs(prev => [...prev, `> Executing transfer(amount: ${amount})...`]);

      const steps: VMStep[] = [
          // Step 1: Check Amount > 0
          {
              name: 'REQUIRE_POS',
              cost: 1000,
              action: () => {
                  if (amount <= 0) throw new Error("Require failed: Amount must be positive");
              }
          },
          // Step 2: Check Overflow (Artificial limit)
          {
              name: 'REQUIRE_LIMIT',
              cost: 1000,
              action: () => {
                  if (amount > 100) throw new Error("Overflow: Amount exceeds limit (100)");
              }
          },
          // Step 3: Heavy Computation (Simulate loop)
          // Cost proportional to amount: 500 gas per unit
          {
              name: 'LOOP_WORK',
              cost: Math.max(0, amount * 500),
              action: () => {
                  // Burn gas simulation
              }
          },
          // Step 4: Finalize
          {
              name: 'UPDATE_BAL',
              cost: 5000,
              action: (state) => {
                  return { ...state, balance: state.balance - amount };
              }
          }
      ];

      const result = await vm.execute(steps, gasLimit, 1);

      if (result.success) {
          setLogs(prev => [...prev, `✅ Success! Gas Used: ${result.gasUsed}`]);
      } else {
          const error = result.revertReason || 'Unknown Error';
          setLogs(prev => [...prev, `❌ Failed: ${error}`]);

          const newFailures = { ...failures };
          let updated = false;

          if (error.includes("Require failed")) {
              if (!newFailures.require) updated = true;
              newFailures.require = true;
          } else if (error === "Out of gas") {
              if (!newFailures.gas) updated = true;
              newFailures.gas = true;
          } else if (error.includes("Overflow")) {
              if (!newFailures.overflow) updated = true;
              newFailures.overflow = true;
          }

          setFailures(newFailures);

          if (newFailures.require && newFailures.gas && newFailures.overflow) {
              if (!challenges.crashContract.completed) {
                  updateChallengeProgress('crashContract', { completed: true, attempts: challenges.crashContract.attempts + 1 });
                  setLogs(prev => [...prev, `🎉 CHALLENGE COMPLETE! You broke it in every way possible!`]);
              }
          } else if (updated) {
              if (!challenges.crashContract.completed) {
                   updateChallengeProgress('crashContract', { attempts: challenges.crashContract.attempts + 1 });
              }
          }
      }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
            <span className="bg-red-100 text-red-700 p-2 rounded-lg mr-3">
                <Ban className="w-6 h-6" />
            </span>
            Crash a Contract
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
            Find the inputs that cause the contract to fail in 3 specific ways.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Controls */}
            <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg font-mono text-sm border border-gray-200 dark:border-gray-600">
                    <div className="text-gray-500 mb-2">// Contract Logic</div>
                    <div className="text-blue-600 dark:text-blue-400">function transfer(amount) {'{'}</div>
                    <div className="pl-4 text-green-600 dark:text-green-400">
                        require(amount &gt; 0, "Amount must be positive");<br/>
                        require(amount &lt;= 100, "Overflow protection");
                    </div>
                    <div className="pl-4 text-purple-600 dark:text-purple-400">
                        // Loop cost: 500 gas * amount<br/>
                        processTransaction(amount);
                    </div>
                    <div className="pl-4 text-gray-900 dark:text-white">
                        balance -= amount;
                    </div>
                    <div className="text-blue-600 dark:text-blue-400">{'}'}</div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Amount
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Gas Limit
                        </label>
                        <input
                            type="number"
                            value={gasLimit}
                            onChange={(e) => setGasLimit(Number(e.target.value))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <Button onClick={runContract} className="w-full">
                        Execute Transaction
                    </Button>
                </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto border border-gray-700">
                    <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
                        <span>Console Output</span>
                        <button onClick={clearLogs} className="text-gray-500 hover:text-white">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                    {logs.length === 0 && <div className="text-gray-600 italic">Ready to execute...</div>}
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1">{log}</div>
                    ))}
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">Progress</h3>
                    <div className={`p-3 rounded-lg border flex items-center justify-between ${failures.require ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700'}`}>
                        <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            <span>Require Failure</span>
                        </div>
                        {failures.require && <CheckCircle className="w-5 h-5" />}
                    </div>
                    <div className={`p-3 rounded-lg border flex items-center justify-between ${failures.gas ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700'}`}>
                        <div className="flex items-center">
                            <Zap className="w-5 h-5 mr-2" />
                            <span>Out of Gas</span>
                        </div>
                        {failures.gas && <CheckCircle className="w-5 h-5" />}
                    </div>
                    <div className={`p-3 rounded-lg border flex items-center justify-between ${failures.overflow ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700'}`}>
                        <div className="flex items-center">
                            <Ban className="w-5 h-5 mr-2" />
                            <span>Overflow/Limit</span>
                        </div>
                        {failures.overflow && <CheckCircle className="w-5 h-5" />}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FailedContractChallenge;
