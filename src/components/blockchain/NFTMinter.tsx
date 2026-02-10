import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { SHA256 } from 'crypto-js';
import { NFT } from '../../stores/useNFTStore';

interface NFTMinterProps {
  onMint: (nftData: Omit<NFT, 'history'>) => void;
  creatorAddress: string;
  currentBlock: number;
}

const NFTMinter: React.FC<NFTMinterProps> = ({ onMint, creatorAddress, currentBlock }) => {
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
       const reader = new FileReader();
       reader.onloadend = () => {
         setImage(reader.result as string);
       };
       reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
  }

  const handleMint = async () => {
    if (!image || !name) return;
    setIsMinting(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate Token ID
    const timestamp = Date.now().toString();
    const rawData = image + timestamp + name + creatorAddress;
    const tokenId = SHA256(rawData).toString();

    const newNFT = {
      id: tokenId,
      name,
      creator: creatorAddress,
      owner: creatorAddress,
      image,
      creationBlock: currentBlock
    };

    onMint(newNFT);

    // Reset form
    setImage(null);
    setName('');
    setIsMinting(false);
  };

  return (
     <div className="bg-secondary-bg/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-text-primary">Mint New NFT</h2>

        <div className="space-y-6">
           {/* Image Upload Area */}
           <div
             className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer min-h-[200px] ${
               image ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50 hover:bg-tertiary-bg/50'
             }`}
             onClick={() => fileInputRef.current?.click()}
             onDrop={handleDrop}
             onDragOver={handleDragOver}
           >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              <AnimatePresence mode="wait">
                {image ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative w-full h-48 flex items-center justify-center"
                  >
                     <img src={image} alt="Preview" className="max-h-full max-w-full rounded-lg shadow-lg object-contain" />
                     <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                       <span className="text-white font-medium">Click to change</span>
                     </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-text-secondary"
                  >
                    <div className="w-16 h-16 bg-tertiary-bg rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-accent" />
                    </div>
                    <p className="font-medium text-lg">Drop image here or click to upload</p>
                    <p className="text-sm mt-2 opacity-70">Supports PNG, JPG, GIF</p>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           {/* Name Input */}
           <Input
             label="NFT Name"
             value={name}
             onChange={(e) => setName(e.target.value)}
             placeholder="e.g. CryptoPunk #001"
           />

           {/* Mint Button */}
           <Button
             onClick={handleMint}
             disabled={!image || !name || isMinting}
             className="w-full"
             size="lg"
           >
             {isMinting ? (
               <>
                 Minting...
               </>
             ) : (
               <>
                 <ImageIcon className="w-5 h-5 mr-2" />
                 Mint NFT
               </>
             )}
           </Button>
        </div>
     </div>
  );
};

export default NFTMinter;
