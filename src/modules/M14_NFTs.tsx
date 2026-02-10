import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Image as ImageIcon, History, Send, X } from 'lucide-react';
import ModuleLayout from '../components/layout/ModuleLayout';
import NFTMinter from '../components/blockchain/NFTMinter';
import Button from '../components/ui/Button';
import { useWalletStore } from '../stores/useWalletStore';
import { useNFTStore, NFT } from '../stores/useNFTStore';

const M14_NFTs: React.FC = () => {
  const { wallets, initializeWallets } = useWalletStore();
  const { nfts, mintNFT, transferNFT } = useNFTStore();

  useEffect(() => {
    if (wallets.length === 0) {
      initializeWallets();
    }
  }, [wallets, initializeWallets]);

  const [activeWalletId, setActiveWalletId] = useState<string>(wallets[0]?.name || '');
  const [activeTab, setActiveTab] = useState<'mint' | 'gallery'>('gallery');
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [transferMode, setTransferMode] = useState(false);
  const [recipient, setRecipient] = useState('');

  // Ensure active wallet is valid
  const activeWallet = wallets.find(w => w.name === activeWalletId) || wallets[0];

  // Update state if wallets load later
  if (!activeWalletId && wallets.length > 0) {
    setActiveWalletId(wallets[0].name);
  }

  const handleMint = (nftData: any) => {
    mintNFT(nftData);
    setActiveTab('gallery');
  };

  const handleTransfer = () => {
    if (!selectedNFT || !recipient) return;

    // In a real app we'd verify ownership and signature.
    // Here we assume activeWallet is the owner if we allow opening the transfer modal.
    // But we should check.

    if (selectedNFT.owner !== activeWallet.name) {
      alert("You don't own this NFT!");
      return;
    }

    transferNFT(selectedNFT.id, recipient, 12345); // Mock block number
    setTransferMode(false);
    setSelectedNFT(null);
    setRecipient('');
  };

  const openDetails = (nft: NFT) => {
    setSelectedNFT(nft);
    setTransferMode(false);
  };

  const openTransfer = (e: React.MouseEvent, nft: NFT) => {
    e.stopPropagation();
    setSelectedNFT(nft);
    setTransferMode(true);
    setRecipient('');
  };

  return (
    <ModuleLayout moduleId="nfts" title="NFTs" subtitle="Non-Fungible Tokens & Digital Ownership">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Wallet Selector */}
        <div className="flex justify-between items-center bg-secondary-bg/50 p-4 rounded-xl border border-white/5">
           <div className="flex items-center gap-3">
             <div className="bg-accent/20 p-2 rounded-full">
               <User className="w-5 h-5 text-accent" />
             </div>
             <div>
               <p className="text-sm text-text-secondary">Active Wallet</p>
               <select
                 value={activeWalletId}
                 onChange={(e) => setActiveWalletId(e.target.value)}
                 className="bg-transparent font-bold text-text-primary outline-none cursor-pointer"
               >
                 {wallets.map(w => (
                   <option key={w.publicKey} value={w.name} className="bg-secondary-bg text-text-primary">
                     {w.name}
                   </option>
                 ))}
               </select>
             </div>
           </div>

           <div className="flex bg-tertiary-bg rounded-lg p-1">
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'gallery' ? 'bg-secondary-bg text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setActiveTab('mint')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'mint' ? 'bg-secondary-bg text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Mint
              </button>
           </div>
        </div>

        <AnimatePresence mode="wait">
           {activeTab === 'mint' ? (
             <motion.div
               key="mint"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
             >
               <NFTMinter
                 onMint={handleMint}
                 creatorAddress={activeWallet?.name || 'Unknown'}
                 currentBlock={100} // Mock block
               />
             </motion.div>
           ) : (
             <motion.div
               key="gallery"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
             >
               {nfts.length === 0 ? (
                 <div className="text-center py-20 text-text-secondary">
                   <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                   <p className="text-xl">No NFTs minted yet.</p>
                   <Button variant="ghost" className="mt-4" onClick={() => setActiveTab('mint')}>
                     Mint your first NFT
                   </Button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nfts.map(nft => (
                      <motion.div
                        key={nft.id}
                        layoutId={nft.id}
                        onClick={() => openDetails(nft)}
                        className="group bg-secondary-bg/50 border border-white/5 rounded-2xl overflow-hidden hover:border-accent/50 transition-all cursor-pointer shadow-lg hover:shadow-accent/10"
                        whileHover={{ y: -5 }}
                      >
                         <div className="aspect-square relative overflow-hidden bg-black/20">
                            <img src={nft.image} alt={nft.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-mono text-white/80 border border-white/10">
                               #{nft.id.substring(0, 6)}
                            </div>
                         </div>
                         <div className="p-4">
                            <h3 className="font-bold text-lg mb-1 truncate">{nft.name}</h3>
                            <div className="flex justify-between items-center text-sm text-text-secondary mb-4">
                               <span>Owner: {nft.owner === activeWallet?.name ? <span className="text-accent font-bold">You</span> : nft.owner}</span>
                            </div>

                            {nft.owner === activeWallet?.name && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="w-full"
                                onClick={(e) => openTransfer(e, nft)}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Transfer
                              </Button>
                            )}
                         </div>
                      </motion.div>
                    ))}
                 </div>
               )}
             </motion.div>
           )}
        </AnimatePresence>

        {/* DETAILS MODAL */}
        <AnimatePresence>
           {selectedNFT && !transferMode && (
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={() => setSelectedNFT(null)}
             >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-secondary-bg border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                   <div className="w-full md:w-1/2 aspect-square bg-black/30 flex items-center justify-center p-8">
                      <img src={selectedNFT.image} alt={selectedNFT.name} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                   </div>

                   <div className="w-full md:w-1/2 p-8 flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                         <div>
                            <h2 className="text-3xl font-bold mb-2">{selectedNFT.name}</h2>
                            <p className="font-mono text-xs text-text-tertiary break-all">ID: {selectedNFT.id}</p>
                         </div>
                         <button onClick={() => setSelectedNFT(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                           <X className="w-6 h-6" />
                         </button>
                      </div>

                      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="bg-tertiary-bg/50 p-3 rounded-lg">
                               <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Creator</p>
                               <p className="font-medium">{selectedNFT.creator}</p>
                            </div>
                            <div className="bg-tertiary-bg/50 p-3 rounded-lg">
                               <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Owner</p>
                               <p className="font-medium text-accent">{selectedNFT.owner}</p>
                            </div>
                         </div>

                         <div>
                            <h3 className="flex items-center text-sm font-bold uppercase tracking-wider text-text-secondary mb-4">
                              <History className="w-4 h-4 mr-2" />
                              Ownership History
                            </h3>

                            <div className="relative border-l-2 border-tertiary-bg ml-2 space-y-6 pl-6 pb-2">
                               {selectedNFT.history.slice().reverse().map((record, i) => (
                                 <div key={i} className="relative">
                                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-tertiary-bg border-2 border-secondary-bg" />
                                    <div className="flex flex-col">
                                       <span className="text-sm font-bold text-text-primary">
                                         {record.to === 'MINT' ? 'Minted' : `Transferred to ${record.to}`}
                                       </span>
                                       <span className="text-xs text-text-secondary">
                                         From: {record.from} • Block #{record.blockNumber}
                                       </span>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>

                      {selectedNFT.owner === activeWallet?.name && (
                        <div className="pt-6 mt-6 border-t border-white/5">
                           <Button
                             className="w-full"
                             onClick={() => setTransferMode(true)}
                           >
                             Transfer Ownership
                           </Button>
                        </div>
                      )}
                   </div>
                </motion.div>
             </motion.div>
           )}

           {/* TRANSFER MODAL */}
           {selectedNFT && transferMode && (
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={() => {
                   setTransferMode(false);
                   setSelectedNFT(null);
                }}
             >
               <motion.div
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.9, opacity: 0 }}
                 className="bg-secondary-bg border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl"
                 onClick={(e) => e.stopPropagation()}
               >
                  <h3 className="text-xl font-bold mb-4">Transfer NFT</h3>
                  <div className="flex items-center gap-4 mb-6 bg-tertiary-bg/30 p-3 rounded-lg border border-white/5">
                     <img src={selectedNFT.image} alt={selectedNFT.name} className="w-16 h-16 rounded-md object-cover" />
                     <div>
                        <p className="font-bold">{selectedNFT.name}</p>
                        <p className="text-xs text-text-secondary font-mono">#{selectedNFT.id.substring(0, 8)}...</p>
                     </div>
                  </div>

                  <div className="mb-6">
                     <label className="block text-sm text-text-secondary mb-2">Recipient Wallet</label>
                     <select
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="w-full bg-tertiary-bg border border-border rounded-xl p-3 outline-none focus:border-accent text-text-primary"
                     >
                        <option value="" disabled>Select Recipient</option>
                        {wallets
                          .filter(w => w.name !== activeWallet?.name)
                          .map(w => (
                            <option key={w.publicKey} value={w.name}>{w.name}</option>
                          ))
                        }
                     </select>
                  </div>

                  <div className="flex gap-3">
                     <Button
                       variant="secondary"
                       className="flex-1"
                       onClick={() => setTransferMode(false)}
                     >
                       Cancel
                     </Button>
                     <Button
                       className="flex-1"
                       disabled={!recipient}
                       onClick={handleTransfer}
                     >
                       Confirm Transfer
                     </Button>
                  </div>
               </motion.div>
             </motion.div>
           )}
        </AnimatePresence>

      </div>
    </ModuleLayout>
  );
};

export default M14_NFTs;
