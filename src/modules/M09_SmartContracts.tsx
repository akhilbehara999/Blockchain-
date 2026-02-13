import React, { useState, useEffect } from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, DollarSign, User, Gavel, CheckCircle, XCircle, FileCode, Play } from 'lucide-react';

import { GasSystem, GAS_COSTS } from '../engine/GasSystem';
import { ContractVM } from '../engine/ContractVM';
import type { VMStep, ExecutionResult } from '../engine/types';
import GasEstimator from '../components/contracts/GasEstimator';
import ExecutionViewer from '../components/contracts/ExecutionViewer';

// --- VM Hook for Integration ---
const useSmartContractVM = (currentState: any, onStateUpdate: (newState: any) => void) => {
  const [status, setStatus] = useState<'idle' | 'estimating' | 'executing' | 'result'>('idle');
  const [steps, setSteps] = useState<VMStep[]>([]);
  const [estimatedGas, setEstimatedGas] = useState(0);
  const [userLimit, setUserLimit] = useState(0);
  const [executionResult, setExecutionResult] = useState<ExecutionResult>();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentGasUsed, setCurrentGasUsed] = useState(0);

  const execute = (actionSteps: VMStep[]) => {
    const totalEst = actionSteps.reduce((acc, s) => acc + s.cost, 0);
    setEstimatedGas(totalEst);
    setUserLimit(Math.ceil(totalEst * 1.3)); // 30% buffer
    setSteps(actionSteps);
    setStatus('estimating');
  };

  const confirm = async () => {
    setStatus('executing');
    setCurrentStepIndex(0);
    setCurrentGasUsed(0);

    const vm = new ContractVM(currentState);
    const gasPrice = GasSystem.getCurrentGasPrice();

    const res = await vm.execute(steps, userLimit, gasPrice, (idx, cost, total) => {
      setCurrentStepIndex(idx);
      setCurrentGasUsed(total);
    });

    setExecutionResult(res);
    setStatus('result');

    if (res.success && res.result) {
      onStateUpdate(res.result);
    }
  };

  const reset = () => {
    setStatus('idle');
    setExecutionResult(undefined);
    setSteps([]);
  };

  const RenderOverlay = () => (
    <AnimatePresence>
      {status !== 'idle' && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          {status === 'estimating' && (
            <GasEstimator
              estimatedGas={estimatedGas}
              recommendedLimit={Math.ceil(estimatedGas * 1.3)}
              userLimit={userLimit}
              onLimitChange={setUserLimit}
              onConfirm={confirm}
              onCancel={reset}
            />
          )}
          {(status === 'executing' || status === 'result') && (
            <ExecutionViewer
              steps={steps}
              currentStepIndex={currentStepIndex}
              gasUsed={status === 'result' && executionResult ? executionResult.gasUsed : currentGasUsed}
              gasLimit={userLimit}
              status={status === 'executing' ? 'pending' : executionResult?.success ? 'success' : 'failed'}
              result={executionResult}
              onClose={reset}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return { execute, RenderOverlay };
};

// --- Escrow Template ---
interface EscrowState {
  buyerDeposit: number;
  sellerDelivered: boolean;
  status: 'waiting_for_deposit' | 'ready_to_deliver' | 'delivered' | 'complete' | 'disputed' | 'refunded';
}

const EscrowTemplate: React.FC<{ onDeploy: () => void }> = ({ onDeploy }) => {
  const [state, setState] = useState<EscrowState>({
    buyerDeposit: 0,
    sellerDelivered: false,
    status: 'waiting_for_deposit',
  });

  const { execute, RenderOverlay } = useSmartContractVM(state, setState);

  const deposit = () => {
    execute([
        { name: 'Check Authorization', cost: GAS_COSTS.READ, action: () => {} }, // Simulating auth check
        { name: 'Transfer Funds (User -> Contract)', cost: GAS_COSTS.TRANSFER, action: () => {} },
        { name: 'Update Ledger', cost: GAS_COSTS.STORE, action: (s) => ({ ...s, buyerDeposit: 10, status: 'ready_to_deliver' }) }
    ]);
  };

  const deliver = () => {
    execute([
        { name: 'Verify Deposit', cost: GAS_COSTS.READ, action: (s) => { if (s.buyerDeposit < 10) throw new Error('No deposit found'); } },
        { name: 'Update Shipment Status', cost: GAS_COSTS.STORE, action: (s) => ({ ...s, sellerDelivered: true, status: 'delivered' }) }
    ]);
  };

  const release = () => {
    execute([
        { name: 'Check Delivery Status', cost: GAS_COSTS.READ, action: (s) => { if (!s.sellerDelivered) throw new Error('Item not delivered'); } },
        { name: 'Transfer Funds (Contract -> Seller)', cost: GAS_COSTS.TRANSFER, action: () => {} },
        { name: 'Close Escrow', cost: GAS_COSTS.STORE, action: (s) => ({ ...s, status: 'complete', buyerDeposit: 0 }) }
    ]);
  };

  const dispute = () => {
    execute([
        { name: 'Register Dispute', cost: GAS_COSTS.LOGIC_MIN, action: (s) => ({ ...s, status: 'disputed' }) }
    ]);
  };

  const refund = () => {
    execute([
        { name: 'Verify Dispute', cost: GAS_COSTS.READ, action: (s) => { if (s.status !== 'disputed') throw new Error('Not disputed'); } },
        { name: 'Refund Buyer', cost: GAS_COSTS.TRANSFER, action: () => {} },
        { name: 'Close Escrow', cost: GAS_COSTS.STORE, action: (s) => ({ ...s, status: 'refunded', buyerDeposit: 0 }) }
    ]);
  };

  return (
    <div className="space-y-6">
      <RenderOverlay />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Logic Visualization */}
        <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-medium text-text-primary">Contract Logic</h3>
            <div className="flex flex-col gap-2">
                <ConditionBlock
                    active={state.buyerDeposit >= 10}
                    text="IF buyer sends >= 10 tokens THEN hold in escrow"
                />
                <ConditionBlock
                    active={state.sellerDelivered && state.status !== 'disputed'}
                    text="IF seller delivers item THEN release tokens to seller"
                />
                <ConditionBlock
                    active={state.status === 'disputed'}
                    text="IF dispute THEN refund buyer"
                    variant="danger"
                />
            </div>
        </div>

        {/* State Panel */}
        <Card className="bg-tertiary-bg/30 border-dashed border-2 border-tertiary-bg">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Contract State</h3>
            <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                    <span>buyerDeposit:</span>
                    <span className="text-accent">{state.buyerDeposit}</span>
                </div>
                <div className="flex justify-between">
                    <span>sellerDelivered:</span>
                    <span className={state.sellerDelivered ? "text-success" : "text-danger"}>
                        {state.sellerDelivered.toString()}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>status:</span>
                    <span className="text-text-primary">'{state.status}'</span>
                </div>
            </div>
        </Card>
      </div>

      {/* Interactions */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-tertiary-bg">
        <Button
            onClick={deposit}
            disabled={state.buyerDeposit > 0}
            leftIcon={<DollarSign className="w-4 h-4" />}
        >
            Buyer: Deposit 10
        </Button>
        <Button
            onClick={deliver}
            disabled={!state.buyerDeposit || state.sellerDelivered}
            variant="secondary"
            leftIcon={<BoxIcon className="w-4 h-4" />}
        >
            Seller: Mark Delivered
        </Button>
        <Button
            onClick={release}
            disabled={state.status !== 'delivered'}
            variant="success"
            leftIcon={<CheckCircle className="w-4 h-4" />}
        >
            Release Funds
        </Button>
        {state.status === 'delivered' && (
             <Button
                onClick={dispute}
                variant="danger"
                leftIcon={<Gavel className="w-4 h-4" />}
            >
                Raise Dispute
            </Button>
        )}
        {state.status === 'disputed' && (
             <Button
                onClick={refund}
                variant="primary"
            >
                Refund Buyer
            </Button>
        )}
      </div>
    </div>
  );
};

// --- Crowdfunding Template ---
interface CrowdfundingState {
  fundsCollected: number;
  goal: number;
  contributors: { name: string; amount: number }[];
  status: 'active' | 'success' | 'failed';
}

const CrowdfundingTemplate: React.FC = () => {
  const [state, setState] = useState<CrowdfundingState>({
    fundsCollected: 0,
    goal: 100,
    contributors: [],
    status: 'active',
  });

  const { execute, RenderOverlay } = useSmartContractVM(state, setState);

  const [amount, setAmount] = useState('10');
  const [name, setName] = useState('Alice');

  const contribute = () => {
    const val = parseInt(amount) || 0;
    if (val <= 0) return;

    execute([
        { name: 'Check Status', cost: GAS_COSTS.READ, action: (s) => { if (s.status !== 'active') throw new Error('Campaign ended'); } },
        { name: 'Transfer Contribution', cost: GAS_COSTS.TRANSFER, action: () => {} },
        { name: 'Update Funds', cost: GAS_COSTS.STORE, action: (s) => ({
             ...s,
             fundsCollected: s.fundsCollected + val,
             contributors: [...s.contributors, { name, amount: val }]
        }) }
    ]);
  };

  const checkGoal = () => {
    execute([
        { name: 'Read Funds', cost: GAS_COSTS.READ, action: () => {} },
        { name: 'Evaluate Goal', cost: GAS_COSTS.LOGIC_MIN, action: (s) => {
             if (s.fundsCollected >= s.goal) return { ...s, status: 'success' };
             return { ...s, status: 'failed' };
        } }
    ]);
  };

  const withdraw = () => {
      execute([
          { name: 'Check Status', cost: GAS_COSTS.READ, action: (s) => { if (s.status !== 'failed') throw new Error('Cannot withdraw'); } },
          { name: 'Process Refunds', cost: GAS_COSTS.LOGIC_MAX, action: () => {} }, // Expensive loop
          { name: 'Reset State', cost: GAS_COSTS.STORE, action: (s) => ({ fundsCollected: 0, goal: 100, contributors: [], status: 'active' }) }
      ]);
  };

  return (
    <div className="space-y-6">
       <RenderOverlay />
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
            <Card>
                <h3 className="text-lg font-medium text-text-primary mb-4">Campaign Progress</h3>
                <ProgressBar
                    value={(state.fundsCollected / state.goal) * 100}
                    label={`${state.fundsCollected} / ${state.goal} Tokens`}
                    color={state.status === 'success' ? 'success' : state.status === 'failed' ? 'danger' : 'accent'}
                    showPercentage
                />
                <div className="mt-4 flex gap-2">
                    <Badge variant={state.status === 'active' ? 'info' : state.status === 'success' ? 'success' : 'danger'}>
                        {state.status.toUpperCase()}
                    </Badge>
                </div>
            </Card>

            <div className="flex flex-col md:flex-row items-end gap-4 bg-tertiary-bg/30 p-4 rounded-xl">
                <Input label="Name" value={name} onChange={e => setName(e.target.value)} containerClassName="w-full md:w-auto flex-1 !mb-0" />
                <Input label="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} containerClassName="w-full md:w-auto flex-1 !mb-0" />
                <Button onClick={contribute} disabled={state.status !== 'active'} className="w-full md:w-auto">Contribute</Button>
            </div>
         </div>

         <div className="space-y-4">
            <Card className="h-full bg-tertiary-bg/30">
                <h3 className="text-sm font-medium text-text-secondary mb-2">State</h3>
                <pre className="text-xs font-mono text-text-secondary overflow-x-auto">
                    {JSON.stringify(state, null, 2)}
                </pre>
            </Card>
         </div>
       </div>

       <div className="flex gap-4 pt-4 border-t border-tertiary-bg">
         <Button onClick={checkGoal} disabled={state.status !== 'active'} variant="secondary">Check Goal (End Campaign)</Button>
         <Button onClick={withdraw} disabled={state.status !== 'failed'} variant="danger">Withdraw (Refund)</Button>
       </div>
    </div>
  );
};

// --- Auction Template ---
interface AuctionState {
    highestBid: number;
    highestBidder: string;
    bids: { bidder: string; amount: number }[];
    status: 'open' | 'ended';
}

const AuctionTemplate: React.FC = () => {
    const [state, setState] = useState<AuctionState>({
        highestBid: 0,
        highestBidder: '',
        bids: [],
        status: 'open'
    });

    const { execute, RenderOverlay } = useSmartContractVM(state, setState);

    const [bidAmount, setBidAmount] = useState('10');
    const [bidderName, setBidderName] = useState('Bob');

    const placeBid = () => {
        const val = parseInt(bidAmount) || 0;
        if (val <= state.highestBid) return;

        execute([
            { name: 'Check Auction Status', cost: GAS_COSTS.READ, action: (s) => { if (s.status === 'ended') throw new Error('Auction ended'); } },
            { name: 'Verify Bid Amount', cost: GAS_COSTS.LOGIC_MIN, action: (s) => { if (val <= s.highestBid) throw new Error('Bid too low'); } },
            { name: 'Refund Previous Bidder', cost: GAS_COSTS.TRANSFER, action: () => {} },
            { name: 'Accept New Bid', cost: GAS_COSTS.STORE, action: (s) => ({
                ...s,
                highestBid: val,
                highestBidder: bidderName,
                bids: [{ bidder: bidderName, amount: val }, ...s.bids]
            }) }
        ]);
    };

    const endAuction = () => {
        execute([
            { name: 'Finalize Winner', cost: GAS_COSTS.LOGIC_MIN, action: () => {} },
            { name: 'Transfer Funds to Owner', cost: GAS_COSTS.TRANSFER, action: () => {} },
            { name: 'Update Status', cost: GAS_COSTS.STORE, action: (s) => ({ ...s, status: 'ended' }) }
        ]);
    };

    return (
        <div className="space-y-6">
            <RenderOverlay />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-tertiary-bg to-secondary-bg">
                        <div className="text-center p-4">
                            <h3 className="text-text-secondary text-sm uppercase tracking-wider">Current Highest Bid</h3>
                            <div className="text-4xl font-bold text-accent mt-2">{state.highestBid}</div>
                            <div className="text-text-primary mt-1">by {state.highestBidder || 'No bids yet'}</div>
                        </div>
                    </Card>

                    <div className="flex flex-col md:flex-row items-end gap-4 bg-tertiary-bg/30 p-4 rounded-xl">
                        <Input label="Bidder" value={bidderName} onChange={e => setBidderName(e.target.value)} containerClassName="w-full md:w-auto flex-1 !mb-0" />
                        <Input label="Amount" type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} containerClassName="w-full md:w-auto flex-1 !mb-0" />
                        <Button onClick={placeBid} disabled={state.status === 'ended' || (parseInt(bidAmount) || 0) <= state.highestBid} className="w-full md:w-auto">
                            Place Bid
                        </Button>
                    </div>
                </div>

                <Card className="h-64 overflow-y-auto">
                    <h3 className="text-sm font-medium text-text-secondary mb-4 sticky top-0 bg-secondary-bg py-2">Bid History</h3>
                    <div className="space-y-2">
                        {state.bids.map((bid, i) => (
                            <div key={i} className={`flex justify-between p-2 rounded ${i === 0 ? 'bg-accent/10 border border-accent/20' : 'bg-tertiary-bg/50'}`}>
                                <span>{bid.bidder}</span>
                                <span className="font-mono">{bid.amount}</span>
                            </div>
                        ))}
                        {state.bids.length === 0 && <div className="text-text-tertiary text-center py-4">No bids yet</div>}
                    </div>
                </Card>
            </div>

            <div className="pt-4 border-t border-tertiary-bg">
                <Button onClick={endAuction} disabled={state.status === 'ended'} variant="danger">End Auction</Button>
                {state.status === 'ended' && <span className="ml-4 text-success font-medium">Winner: {state.highestBidder} with {state.highestBid}</span>}
            </div>
        </div>
    );
};

// --- Shared Components ---

const ConditionBlock: React.FC<{ active: boolean; text: string; variant?: 'success' | 'danger' }> = ({ active, text, variant = 'success' }) => (
    <motion.div
        animate={{
            backgroundColor: active ? (variant === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)') : 'rgba(255,255,255,0.02)',
            borderColor: active ? (variant === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)') : 'rgba(255,255,255,0.05)',
        }}
        className="border rounded-lg p-3 flex items-center gap-3 transition-colors"
    >
        {active ? (
            variant === 'success' ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-danger" />
        ) : (
            <div className="w-5 h-5 rounded-full border-2 border-text-tertiary" />
        )}
        <span className={active ? "text-text-primary" : "text-text-tertiary"}>{text}</span>
    </motion.div>
);

const BoxIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
);

// --- Main Module ---

const SmartContracts: React.FC = () => {
  const [activeTab, setActiveTab] = useState('escrow');
  const [deployed, setDeployed] = useState(false);

  useEffect(() => {
    setDeployed(false);
  }, [activeTab]);

  const deploy = () => {
      setDeployed(true);
      // Here we could simulate adding to a global chain store
  };

  const templates = [
      { id: 'escrow', label: 'Escrow', icon: <Lock className="w-4 h-4" /> },
      { id: 'crowdfunding', label: 'Crowdfunding', icon: <User className="w-4 h-4" /> },
      { id: 'auction', label: 'Auction', icon: <Gavel className="w-4 h-4" /> },
  ];

  return (
    <ModuleLayout moduleId="smartcontracts" title="Smart Contracts" subtitle="Automated trust with code">
      <div className="space-y-8">
        <div className="flex justify-center">
            <Tabs tabs={templates} activeTab={activeTab} onChange={setActiveTab} className="w-full max-w-lg" />
        </div>

        <Card title={templates.find(t => t.id === activeTab)?.label + " Contract"}>
             <AnimatePresence mode='wait'>
                 <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                 >
                     {activeTab === 'escrow' && <EscrowTemplate onDeploy={deploy} />}
                     {activeTab === 'crowdfunding' && <CrowdfundingTemplate />}
                     {activeTab === 'auction' && <AuctionTemplate />}
                 </motion.div>
             </AnimatePresence>
        </Card>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-tertiary-bg/20 p-4 rounded-xl border border-tertiary-bg">
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className={`p-2 rounded-lg ${deployed ? 'bg-success/20 text-success' : 'bg-tertiary-bg text-text-tertiary'}`}>
                    <FileCode className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-medium text-text-primary">Contract Deployment</h4>
                    <p className="text-xs text-text-secondary">{deployed ? 'Deployed at 0x71C...9A2' : 'Not deployed yet'}</p>
                </div>
            </div>
            <Button
                onClick={deploy}
                disabled={deployed}
                variant={deployed ? 'success' : 'primary'}
                leftIcon={deployed ? <CheckCircle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                className="w-full sm:w-auto"
            >
                {deployed ? 'Deployed' : 'Deploy Contract'}
            </Button>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default SmartContracts;
