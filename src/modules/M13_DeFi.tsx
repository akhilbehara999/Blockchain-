import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, PiggyBank, Scale, AlertTriangle, ArrowDown } from 'lucide-react';
import ModuleLayout from '../components/layout/ModuleLayout';
import DeFiPoolViz from '../components/blockchain/DeFiPoolViz';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const M13_DeFi: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'swap' | 'pool' | 'lending'>('swap');

  // Pool State
  const [reserves, setReserves] = useState({ tokenA: 1000, tokenB: 1000 });

  // Swap State
  const [swapAmount, setSwapAmount] = useState('');
  const [isReverseSwap, setIsReverseSwap] = useState(false);

  // Liquidity State
  const [addLiquidityA, setAddLiquidityA] = useState('');
  const [addLiquidityB, setAddLiquidityB] = useState('');

  // Lending State
  const [collateral, setCollateral] = useState(0); // Token A
  const [borrowed, setBorrowed] = useState(0); // Token B
  const [depositAmount, setDepositAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');

  // Derived Constants
  const k = reserves.tokenA * reserves.tokenB;
  const priceAinB = reserves.tokenB / reserves.tokenA;

  // Swap Calculations
  const calculateSwapOutput = (inputAmount: number, isReverse: boolean) => {
    if (!inputAmount || inputAmount <= 0) return 0;

    const inputWithFee = inputAmount * 0.997; // 0.3% fee

    if (!isReverse) {
      // Input A -> Output B
      // (x + dx) * (y - dy) = k
      // y - dy = k / (x + dx)
      // dy = y - k / (x + dx)
      const newB = k / (reserves.tokenA + inputWithFee);
      return reserves.tokenB - newB;
    } else {
      // Input B -> Output A
      const newA = k / (reserves.tokenB + inputWithFee);
      return reserves.tokenA - newA;
    }
  };

  const swapOutput = calculateSwapOutput(parseFloat(swapAmount), isReverseSwap);
  const priceImpact = swapAmount ? (
    !isReverseSwap
      ? ((reserves.tokenB / reserves.tokenA) - (reserves.tokenB - swapOutput) / (reserves.tokenA + parseFloat(swapAmount))) / (reserves.tokenB / reserves.tokenA) * 100
      : ((reserves.tokenA / reserves.tokenB) - (reserves.tokenA - swapOutput) / (reserves.tokenB + parseFloat(swapAmount))) / (reserves.tokenA / reserves.tokenB) * 100
  ) : 0;

  const executeSwap = () => {
    const amount = parseFloat(swapAmount);
    if (!amount || amount <= 0) return;

    const output = calculateSwapOutput(amount, isReverseSwap);

    if (!isReverseSwap) {
      setReserves({
        tokenA: reserves.tokenA + amount,
        tokenB: reserves.tokenB - output
      });
    } else {
      setReserves({
        tokenA: reserves.tokenA - output,
        tokenB: reserves.tokenB + amount
      });
    }
    setSwapAmount('');
  };

  // Liquidity Calculations
  // Maintain ratio: A / B = newA / newB
  const handleLiquidityChange = (value: string, token: 'A' | 'B') => {
    if (token === 'A') {
      setAddLiquidityA(value);
      if (value && !isNaN(parseFloat(value))) {
        const amountA = parseFloat(value);
        const requiredB = amountA * (reserves.tokenB / reserves.tokenA);
        setAddLiquidityB(requiredB.toFixed(2));
      } else {
        setAddLiquidityB('');
      }
    } else {
      setAddLiquidityB(value);
      if (value && !isNaN(parseFloat(value))) {
        const amountB = parseFloat(value);
        const requiredA = amountB * (reserves.tokenA / reserves.tokenB);
        setAddLiquidityA(requiredA.toFixed(2));
      } else {
        setAddLiquidityA('');
      }
    }
  };

  const addLiquidity = () => {
    const amountA = parseFloat(addLiquidityA);
    const amountB = parseFloat(addLiquidityB);
    if (!amountA || !amountB) return;

    setReserves({
      tokenA: reserves.tokenA + amountA,
      tokenB: reserves.tokenB + amountB
    });
    setAddLiquidityA('');
    setAddLiquidityB('');
  };

  // Lending Calculations
  // Collateral (A) value in B = Collateral * PriceAinB
  // Collateral Ratio = (Collateral Value in B) / Borrowed (B)
  const collateralValueInB = collateral * priceAinB;
  const collateralRatio = borrowed > 0 ? (collateralValueInB / borrowed) * 100 : 0;
  const isLiquidated = borrowed > 0 && collateralRatio < 150;

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!amount) return;
    setCollateral(c => c + amount);
    setDepositAmount('');
  };

  const handleBorrow = () => {
    const amount = parseFloat(borrowAmount);
    if (!amount) return;
    setBorrowed(b => b + amount);
    setBorrowAmount('');
  };

  const handleRepay = () => {
    setBorrowed(0);
    // Ideally user repays with interest, but simplified
  };

  return (
    <ModuleLayout moduleId="defi" title="DeFi Basics" subtitle="Decentralized Finance & AMMs">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">

        {/* Visualization Panel */}
        <div className="space-y-6">
           <DeFiPoolViz tokenA={reserves.tokenA} tokenB={reserves.tokenB} k={k} />

           {/* Info Panel for Lending if active or general stats */}
           <div className="bg-secondary-bg/30 p-4 rounded-xl border border-white/5">
              <h4 className="font-bold text-text-secondary mb-2">Market Status</h4>
              <div className="flex justify-between items-center text-sm">
                 <span>Token A Price:</span>
                 <span className="font-mono text-accent">{priceAinB.toFixed(4)} Token B</span>
              </div>
           </div>
        </div>

        {/* Interaction Panel */}
        <div>
          {/* Tabs */}
          <div className="flex space-x-2 bg-secondary-bg/50 p-1 rounded-xl mb-6 overflow-x-auto scrollbar-hide">
            {[
              { id: 'swap', label: 'Swap', icon: ArrowLeftRight },
              { id: 'pool', label: 'Add Liquidity', icon: PiggyBank },
              { id: 'lending', label: 'Lending', icon: Scale },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium transition-all min-w-fit whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-accent text-white shadow-lg'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* SWAP TAB */}
            {activeTab === 'swap' && (
              <motion.div
                key="swap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Swap Tokens</h3>
                    <button
                      onClick={() => setIsReverseSwap(!isReverseSwap)}
                      className="p-2 hover:bg-secondary-bg rounded-full transition-colors text-accent"
                    >
                      <ArrowLeftRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                       <Input
                         label={!isReverseSwap ? "Pay (Token A)" : "Pay (Token B)"}
                         type="number"
                         value={swapAmount}
                         onChange={(e) => setSwapAmount(e.target.value)}
                         placeholder="0.00"
                       />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-sm pointer-events-none mt-2">
                         {!isReverseSwap ? 'TKN A' : 'TKN B'}
                       </span>
                    </div>

                    <div className="flex justify-center -my-2 relative z-10">
                      <div className="bg-secondary-bg p-2 rounded-full border border-border">
                        <ArrowDown className="w-4 h-4 text-text-secondary" />
                      </div>
                    </div>

                    <div className="bg-secondary-bg/50 p-4 rounded-xl border border-white/5">
                      <div className="text-sm text-text-secondary mb-1">Receive (Estimated)</div>
                      <div className="text-2xl font-bold font-mono">
                        {swapOutput > 0 ? swapOutput.toFixed(4) : '0.00'}
                        <span className="text-sm text-text-secondary ml-2">
                          {!isReverseSwap ? 'TKN B' : 'TKN A'}
                        </span>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-text-tertiary">
                        <span>Fee (0.3%)</span>
                        <span>Price Impact: <span className={priceImpact > 5 ? 'text-danger' : 'text-success'}>{priceImpact.toFixed(2)}%</span></span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!swapAmount || parseFloat(swapAmount) <= 0}
                      onClick={executeSwap}
                    >
                      Execute Swap
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* LIQUIDITY TAB */}
            {activeTab === 'pool' && (
              <motion.div
                key="pool"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-6">Add Liquidity</h3>
                  <div className="space-y-4">
                     <Input
                       label="Token A Amount"
                       type="number"
                       value={addLiquidityA}
                       onChange={(e) => handleLiquidityChange(e.target.value, 'A')}
                     />
                     <div className="flex justify-center text-text-secondary">+</div>
                     <Input
                       label="Token B Amount"
                       type="number"
                       value={addLiquidityB}
                       onChange={(e) => handleLiquidityChange(e.target.value, 'B')}
                     />

                     {addLiquidityA && (
                        <div className="flex justify-between items-center bg-secondary-bg p-3 rounded-lg border border-white/5">
                           <span className="text-sm text-text-secondary">Projected Pool Share</span>
                           <span className="font-bold text-accent">
                             {((parseFloat(addLiquidityA) / (reserves.tokenA + parseFloat(addLiquidityA))) * 100).toFixed(2)}%
                           </span>
                        </div>
                     )}

                     <div className="bg-accent/10 p-4 rounded-xl border border-accent/20 text-accent text-sm">
                       <p>Providing liquidity earns you fees but exposes you to impermanent loss if prices diverge significantly.</p>
                     </div>

                     <Button
                       className="w-full"
                       size="lg"
                       disabled={!addLiquidityA || !addLiquidityB}
                       onClick={addLiquidity}
                     >
                       Add Liquidity
                     </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* LENDING TAB */}
            {activeTab === 'lending' && (
              <motion.div
                key="lending"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="p-6 relative overflow-hidden">
                   {isLiquidated && (
                     <div className="absolute inset-0 bg-danger/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-white p-6 text-center animate-pulse">
                        <AlertTriangle className="w-16 h-16 mb-4" />
                        <h2 className="text-3xl font-bold mb-2">LIQUIDATED!</h2>
                        <p className="mb-6">Your collateral ratio dropped below 150%.</p>
                        <Button
                          variant="secondary"
                          className="bg-white text-danger hover:bg-gray-100"
                          onClick={() => {
                            setBorrowed(0);
                            setCollateral(0); // Lose collateral
                          }}
                        >
                          Reset Position
                        </Button>
                     </div>
                   )}

                   <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-secondary-bg p-4 rounded-xl">
                         <div className="text-sm text-text-secondary">Your Collateral (A)</div>
                         <div className="text-xl font-bold">{collateral.toFixed(2)}</div>
                         <div className="text-xs text-text-tertiary">≈ {(collateral * priceAinB).toFixed(2)} B</div>
                      </div>
                      <div className="bg-secondary-bg p-4 rounded-xl">
                         <div className="text-sm text-text-secondary">Borrowed (B)</div>
                         <div className="text-xl font-bold">{borrowed.toFixed(2)}</div>
                      </div>
                   </div>

                   <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Collateral Ratio</span>
                        <span className={collateralRatio < 150 ? 'text-danger' : 'text-success'}>
                          {borrowed > 0 ? `${collateralRatio.toFixed(0)}%` : '∞'}
                        </span>
                      </div>
                      <div className="h-2 bg-tertiary-bg rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${collateralRatio < 150 ? 'bg-danger' : 'bg-success'}`}
                          style={{ width: `${Math.min(collateralRatio / 3, 100)}%` }} // Scale for visual
                        />
                      </div>
                      <div className="flex justify-between text-xs text-text-tertiary mt-1">
                         <span>0%</span>
                         <span className="text-danger">150% (Liquidation)</span>
                         <span>300%+</span>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-2 items-end">
                        <Input
                          label="Deposit Collateral (A)"
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          containerClassName="w-full sm:w-auto flex-1 !mb-0"
                        />
                        <Button
                          onClick={handleDeposit}
                          disabled={!depositAmount}
                          className="w-full sm:w-auto mt-2 h-[50px]" // Match input height roughly
                        >
                          Deposit
                        </Button>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 items-end">
                        <Input
                          label="Borrow (B)"
                          type="number"
                          value={borrowAmount}
                          onChange={(e) => setBorrowAmount(e.target.value)}
                          containerClassName="w-full sm:w-auto flex-1 !mb-0"
                        />
                        <Button
                          onClick={handleBorrow}
                          variant="secondary"
                          disabled={!borrowAmount}
                          className="w-full sm:w-auto mt-2 h-[50px]"
                        >
                          Borrow
                        </Button>
                      </div>

                      {borrowed > 0 && (
                        <Button
                           variant="danger"
                           className="w-full mt-4"
                           onClick={handleRepay}
                        >
                           Repay Debt
                        </Button>
                      )}
                   </div>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default M13_DeFi;
