import { create } from 'zustand';

export interface NFTOwnershipRecord {
  from: string;
  to: string;
  blockNumber: number;
}

export interface NFT {
  id: string; // token ID (hash)
  name: string;
  creator: string;
  owner: string;
  image: string; // base64
  creationBlock: number;
  history: NFTOwnershipRecord[];
}

interface NFTState {
  nfts: NFT[];
  mintNFT: (nft: Omit<NFT, 'history'>) => void;
  transferNFT: (id: string, newOwner: string, blockNumber: number) => void;
  getNFTById: (id: string) => NFT | undefined;
  reset: () => void;
}

export const useNFTStore = create<NFTState>((set, get) => ({
  nfts: [],

  mintNFT: (nftData) => {
    const newNFT: NFT = {
      ...nftData,
      history: [
        {
          from: 'MINT', // Creation
          to: nftData.creator,
          blockNumber: nftData.creationBlock,
        }
      ]
    };
    set((state) => ({
      nfts: [...state.nfts, newNFT]
    }));
  },

  transferNFT: (id, newOwner, blockNumber) => {
    set((state) => ({
      nfts: state.nfts.map((nft) => {
        if (nft.id === id) {
          return {
            ...nft,
            owner: newOwner,
            history: [
              ...nft.history,
              {
                from: nft.owner,
                to: newOwner,
                blockNumber: blockNumber
              }
            ]
          };
        }
        return nft;
      })
    }));
  },

  getNFTById: (id) => get().nfts.find((n) => n.id === id),

  reset: () => set({ nfts: [] }),
}));
