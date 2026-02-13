import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Server, Clock, Database, Radio,
  Cpu, Hash, Zap, ArrowRight, ShieldCheck,
  Download, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useNodeIdentity } from '../context/NodeContext';
import { useBlockchainStore } from '../stores/useBlockchainStore';
import { useWalletStore } from '../stores/useWalletStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Types for local state
interface NetworkEvent {
  id: string;
  time: string;
  type: 'block' | 'tx' | 'peer' | 'system';
  message: string;
}

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { identity } = useNodeIdentity();
  const { blocks } = useBlockchainStore();
  const { mempool } = useWalletStore();

  // Local State for Simulation
  const [peerCount, setPeerCount] = useState(7);
  const [hashRate, setHashRate] = useState(142); // TH/s
  const [lastBlockTimeStr, setLastBlockTimeStr] = useState('Just now');
  const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [returningUser, setReturningUser] = useState<{ lastSeen: string; newBlocks: number } | null>(null);

  // Refs for tracking changes without re-triggering effects excessively
  const prevBlocksLength = useRef(blocks.length);
  const prevMempoolLength = useRef(mempool.length);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [networkEvents]);

  // --- 1. Returning User Logic ---
  useEffect(() => {
    const lastVisit = localStorage.getItem('yupp_last_visit');
    const lastBlockCount = localStorage.getItem('yupp_last_block_count');
    const now = new Date().toISOString();
    const currentBlockCount = blocks.length;

    if (lastVisit && lastBlockCount) {
      const missed = Math.max(0, currentBlockCount - parseInt(lastBlockCount));
      // Calculate human readable time diff
      const diffMs = new Date().getTime() - new Date(lastVisit).getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      let timeString = '';
      if (diffHrs > 0) timeString += `${diffHrs} hour${diffHrs > 1 ? 's' : ''} `;
      if (diffMins > 0 || diffHrs === 0) timeString += `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
      if (timeString === '') timeString = 'less than a minute';

      setReturningUser({
        lastSeen: `${timeString} ago`,
        newBlocks: missed
      });
    }

    // Update storage for next visit
    localStorage.setItem('yupp_last_visit', now);
    localStorage.setItem('yupp_last_block_count', currentBlockCount.toString());
  }, []); // Run once on mount

  // --- 2. Live Simulation Effects ---

  // Peer & Hashrate Fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate peers +/- 1 (min 5, max 9)
      setPeerCount(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const next = prev + change;
        if (next < 5) return 5;
        if (next > 9) return 9;
        return next;
      });

      // Fluctuate Hashrate +/- 2 (min 130, max 150)
      setHashRate(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(130, Math.min(150, prev + change));
      });

    }, 45000); // Every 45s

    return () => clearInterval(interval);
  }, []);

  // Peer Connect/Disconnect Events (Visual only)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 30s
        const isConnect = Math.random() > 0.5;
        const peerId = Math.floor(Math.random() * 10000).toString(16).toUpperCase();
        addEvent(
          isConnect ? 'peer' : 'system',
          isConnect ? `New peer connected: Node #${peerId}` : `Peer Node #${peerId} disconnected`
        );
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Last Block Timer
  useEffect(() => {
    const updateTimer = () => {
      if (blocks.length === 0) return;
      const lastBlock = blocks[blocks.length - 1];
      const diff = Math.floor((Date.now() - lastBlock.timestamp) / 1000);
      setLastBlockTimeStr(`${diff}s ago`);
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer(); // Initial call
    return () => clearInterval(interval);
  }, [blocks]);

  // Monitor Blocks & Mempool for Logs
  useEffect(() => {
    // Check for new blocks
    if (blocks.length > prevBlocksLength.current) {
      const newBlock = blocks[blocks.length - 1];
      // Extract miner name if possible (format: "Mined by X\n...")
      const minerLine = newBlock.data.split('\n')[0];
      const miner = minerLine.startsWith('Mined by') ? minerLine.replace('Mined by ', '') : 'Unknown Miner';

      addEvent('block', `Block #${newBlock.index} mined by ${miner}`);
      prevBlocksLength.current = blocks.length;

      // Update storage for returning user tracking if they stay on page
      localStorage.setItem('yupp_last_block_count', blocks.length.toString());
    }

    // Check for new transactions
    if (mempool.length > prevMempoolLength.current) {
      const diff = mempool.length - prevMempoolLength.current;
      addEvent('tx', `${diff} new transaction${diff > 1 ? 's' : ''} received`);
    }
    prevMempoolLength.current = mempool.length;

  }, [blocks, mempool]);

  // Helper to add events
  const addEvent = (type: NetworkEvent['type'], message: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setNetworkEvents(prev => {
      const newEvent: NetworkEvent = {
        id: Math.random().toString(36).substr(2, 9),
        time: timeStr,
        type,
        message
      };
      // Keep last 50 events
      return [...prev.slice(-49), newEvent];
    });
  };

  // Populate initial log with dummy data if empty
  useEffect(() => {
    if (networkEvents.length === 0) {
      const initials: NetworkEvent[] = [
        { id: '1', time: '12:03:15', type: 'system', message: 'Node initialized successfully' },
        { id: '2', time: '12:03:18', type: 'peer', message: 'Connected to bootstrap peer 192.168.1.1' },
        { id: '3', time: '12:03:22', type: 'peer', message: `Swarm discovery: found ${peerCount} peers` },
      ];
      setNetworkEvents(initials);
    }
  }, []);


  // --- 3. Interaction Handlers ---

  const handleJoinNetwork = () => {
    setIsSyncing(true);
    let progress = 0;

    const interval = setInterval(() => {
      // Random progress increment
      progress += Math.random() * 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          navigate('/module/blockchain');
        }, 800);
      }
      setSyncProgress(progress);
    }, 100); // Total time approx 2-3 seconds
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-primary-bg text-text-primary p-4 md:p-8 font-mono">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-accent mb-1">
              {returningUser ? `Welcome back, ${identity.getId()}` : `Welcome, ${identity.getId()}`}
            </h1>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="flex items-center gap-1 text-success">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                Online
              </span>
              <span>•</span>
              <span>{peerCount} peers connected</span>
              <span>•</span>
              <span className="text-xs opacity-70">v1.0.4-beta</span>
            </div>
          </div>

          {returningUser && (
            <div className="text-right text-sm text-text-tertiary bg-secondary-bg/50 px-4 py-2 rounded-lg border border-border">
              <p>Last online: {returningUser.lastSeen}</p>
              <p className="text-accent font-semibold">{returningUser.newBlocks} new blocks mined</p>
            </div>
          )}
        </motion.header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Card 1: Network Stats */}
          <Card className="p-0 overflow-hidden border-border bg-secondary-bg/30">
             <div className="p-4 border-b border-border bg-secondary-bg/50 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><Activity size={18} className="text-indigo-400" /> Network Status</h3>
                <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">Active</span>
             </div>
             <div className="p-6 space-y-4">
                <div className="flex justify-between items-end">
                    <span className="text-text-secondary text-sm">Hashrate</span>
                    <span className="text-xl font-bold">{hashRate} TH/s</span>
                </div>
                <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-indigo-500"
                        initial={{ width: '40%' }}
                        animate={{ width: `${(hashRate / 200) * 100}%` }}
                        transition={{ duration: 2 }}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                        <span className="text-xs text-text-tertiary block">Difficulty</span>
                        <span className="font-mono text-sm">2,492,011</span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-text-tertiary block">Avg Block Time</span>
                        <span className="font-mono text-sm">45.2s</span>
                    </div>
                </div>
             </div>
          </Card>

          {/* Card 2: Chain State */}
          <Card className="p-0 overflow-hidden border-border bg-secondary-bg/30">
             <div className="p-4 border-b border-border bg-secondary-bg/50 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><Database size={18} className="text-purple-400" /> Blockchain Tip</h3>
                <span className="text-xs font-mono text-text-tertiary">#{blocks.length}</span>
             </div>
             <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">Current Height</span>
                    <span className="text-3xl font-bold text-accent">#{blocks.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">Last Block</span>
                    <span className="flex items-center gap-1 font-mono text-warning">
                        <Clock size={14} /> {lastBlockTimeStr}
                    </span>
                </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">Pending Txs</span>
                    <span className="font-mono">{mempool.length}</span>
                </div>
             </div>
          </Card>

           {/* Card 3: Node Wallet */}
           <Card className="p-0 overflow-hidden border-border bg-secondary-bg/30 md:col-span-2 lg:col-span-1">
             <div className="p-4 border-b border-border bg-secondary-bg/50 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-400" /> Your Identity</h3>
             </div>
             <div className="p-6 space-y-4">
                <div>
                    <span className="text-xs text-text-tertiary block mb-1">Public Address</span>
                    <div className="font-mono text-xs bg-black/20 p-2 rounded border border-border break-all">
                        {identity.getWalletAddress()}
                    </div>
                </div>
                <div className="flex justify-between items-end pt-2">
                    <span className="text-text-secondary text-sm">Balance</span>
                    <span className="text-2xl font-bold">0.0000 ETH</span>
                </div>
             </div>
          </Card>

          {/* Card 4: Live Blocks Feed (Spans 2 cols on tablet, 3 on desktop) */}
          <Card className="p-0 overflow-hidden border-border bg-secondary-bg/30 col-span-1 md:col-span-2 lg:col-span-3">
             <div className="p-4 border-b border-border bg-secondary-bg/50 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><Server size={18} className="text-blue-400" /> Live Blocks</h3>
                <div className="flex gap-2 text-xs">
                     <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Mined</span>
                     <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full border border-dashed border-gray-500"></div> Pending</span>
                </div>
             </div>
             <div className="p-6 overflow-x-auto">
                <div className="flex gap-4 min-w-full pb-2">
                    <AnimatePresence>
                        {[...blocks].reverse().slice(0, 8).map((block) => (
                            <motion.div
                                key={block.hash}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex-shrink-0 w-40 bg-primary-bg border border-border p-3 rounded-lg hover:border-accent transition-colors cursor-default"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-accent">#{block.index}</span>
                                    <Hash size={12} className="text-text-tertiary" />
                                </div>
                                <div className="text-[10px] text-text-tertiary mb-2 font-mono truncate">
                                    {block.hash.substring(0, 12)}...
                                </div>
                                <div className="text-[10px] bg-secondary-bg/50 rounded px-1.5 py-1 truncate">
                                    {block.data.split('\n')[0].replace('Mined by ', 'By: ')}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {/* Placeholder for "next" block */}
                    <div className="flex-shrink-0 w-40 border-2 border-dashed border-border p-3 rounded-lg flex flex-col items-center justify-center opacity-50">
                        <div className="animate-spin mb-2"><Zap size={16} /></div>
                        <span className="text-xs">Mining...</span>
                    </div>
                </div>
             </div>
          </Card>

           {/* Card 5: Network Events Log (Spans full width) */}
           <Card className="p-0 overflow-hidden border-border bg-black/40 col-span-1 md:col-span-2 lg:col-span-3 h-64 flex flex-col">
             <div className="p-3 border-b border-white/10 flex justify-between items-center bg-black/60">
                <h3 className="font-bold text-sm flex items-center gap-2 text-gray-300"><Radio size={16} /> Network Event Log</h3>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs">
                {networkEvents.map((event) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3 text-gray-400 hover:bg-white/5 p-1 rounded"
                    >
                        <span className="text-gray-600 select-none">[{event.time}]</span>
                        <span className={`
                            ${event.type === 'block' ? 'text-blue-400' : ''}
                            ${event.type === 'tx' ? 'text-emerald-400' : ''}
                            ${event.type === 'peer' ? 'text-yellow-400' : ''}
                            ${event.type === 'system' ? 'text-purple-400' : ''}
                        `}>
                            {event.type.toUpperCase().padEnd(6, ' ')}
                        </span>
                        <span className="text-gray-300">{event.message}</span>
                    </motion.div>
                ))}
                <div ref={logsEndRef} />
             </div>
          </Card>

        </div>

        {/* CTA Section */}
        <div className="flex justify-center pt-8 pb-12">
            <Button
                onClick={handleJoinNetwork}
                size="lg"
                className="text-lg px-12 py-6 rounded-full shadow-xl shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none transition-all hover:scale-105 active:scale-95"
            >
                {returningUser ? 'Sync & Continue' : 'Join the Network'}
                <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
        </div>

      </div>

      {/* Sync Overlay */}
      <AnimatePresence>
        {isSyncing && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-primary-bg border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6"
                >
                    <div className="text-center space-y-2">
                        <div className="inline-flex p-4 rounded-full bg-indigo-500/10 text-indigo-500 mb-2">
                            <Download size={32} className="animate-bounce" />
                        </div>
                        <h2 className="text-2xl font-bold">Synchronizing Node</h2>
                        <p className="text-text-secondary">Downloading blockchain history...</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Block {Math.floor((syncProgress / 100) * blocks.length)} / {blocks.length}</span>
                            <span>{Math.floor(syncProgress)}%</span>
                        </div>
                        <div className="w-full bg-secondary-bg h-3 rounded-full overflow-hidden border border-border">
                            <motion.div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                style={{ width: `${syncProgress}%` }}
                            />
                        </div>
                        <p className="text-xs text-text-tertiary text-center pt-2">Verifying signatures and proof-of-work...</p>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Landing;
