import React, { useEffect, useRef } from 'react';
import { useBlockchainStore } from '../../stores/useBlockchainStore';
import { useForkStore } from '../../stores/useForkStore';
import { useWalletStore } from '../../stores/useWalletStore';
import { useToast } from '../../context/ToastContext';
import { useSound } from '../../context/SoundContext';
import { useNodeIdentity } from '../../context/NodeContext';

const NetworkListener: React.FC = () => {
  const { addToast } = useToast();
  const { playSound } = useSound();
  const { identity } = useNodeIdentity();

  const blocks = useBlockchainStore((state) => state.blocks);
  const activeFork = useForkStore((state) => state.activeFork);
  const reorgEvent = useForkStore((state) => state.reorgEvent);
  const minedTransactions = useWalletStore((state) => state.minedTransactions);

  // Refs to track previous states to detect changes
  const prevBlocksLength = useRef(blocks.length);
  const prevReorgEvent = useRef(reorgEvent);
  const prevMinedTxCount = useRef(minedTransactions.length);
  const prevForkStatus = useRef(activeFork?.status);

  // 1. Block Mined Listener
  useEffect(() => {
    if (blocks.length > prevBlocksLength.current) {
      const newBlock = blocks[blocks.length - 1];
      // Avoid toast on initial load
      if (prevBlocksLength.current > 0) {
          // Parse miner name from block data if possible
          let minerName = "Unknown";
          const match = newBlock.data.match(/Mined by ([^\n]+)/);
          if (match) {
              minerName = match[1];
          }

          addToast(`⛏️ Block #${newBlock.index} mined by ${minerName}`, 'mining', 3000);

          // Only play sound if not mined by user (user gets their own success sound)
          // Actually, let's play a subtle click for global blocks
          playSound('click');
      }
      prevBlocksLength.current = blocks.length;
    } else if (blocks.length < prevBlocksLength.current) {
        // Chain reset or reorg
        prevBlocksLength.current = blocks.length;
    }
  }, [blocks, addToast, playSound]);

  // 2. Fork Listener
  useEffect(() => {
    if (activeFork && activeFork.status === 'active' && prevForkStatus.current !== 'active') {
       addToast(`🔀 Fork detected at block #${activeFork.forkPoint}`, 'warning', 5000);
       playSound('warning');
    }
    prevForkStatus.current = activeFork?.status;
  }, [activeFork, addToast, playSound]);

  // 3. Reorg Listener
  useEffect(() => {
    if (reorgEvent && reorgEvent !== prevReorgEvent.current) {
       addToast(`⚠️ Chain reorganization — ${reorgEvent.blocksReplaced} blocks replaced`, 'warning', 7000);
       playSound('warning');
       prevReorgEvent.current = reorgEvent;
    }
  }, [reorgEvent, addToast, playSound]);

  // 4. Transaction Confirmation Listener
  useEffect(() => {
    if (minedTransactions.length > prevMinedTxCount.current) {
        // Find the new transaction(s)
        const newTxs = minedTransactions.slice(prevMinedTxCount.current);

        // Check if any involve the user
        const userPubKey = identity?.getPublicKey();
        const myTx = newTxs.find(tx => tx.from === userPubKey || tx.to === userPubKey);

        if (myTx) {
            addToast(`✅ Your transaction confirmed in block #${myTx.confirmationBlock}`, 'success', 5000);
            playSound('success');
        }

        prevMinedTxCount.current = minedTransactions.length;
    }
  }, [minedTransactions, identity, addToast, playSound]);

  return null; // This component renders nothing
};

export default NetworkListener;
