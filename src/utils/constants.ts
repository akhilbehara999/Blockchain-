
import {
  Book, Hash, Box, Link, Network, Coins, Database, Key, PenTool, Send, Zap, Hammer, BarChart, FileCode, Home
} from 'lucide-react';

export const MODULE_LIST = [
  {
    id: 'landing',
    title: 'Home',
    path: '/',
    icon: Home,
    description: 'Welcome to BlockSim'
  },
  {
    id: 'introduction',
    title: 'Introduction',
    path: '/module/introduction',
    icon: Book,
    description: 'Understand the basics of blockchain technology.'
  },
  {
    id: 'hash',
    title: 'Hashing',
    path: '/module/hash',
    icon: Hash,
    description: 'Learn how cryptographic hashing secures data.'
  },
  {
    id: 'block',
    title: 'Block',
    path: '/module/block',
    icon: Box,
    description: 'Discover the structure of a block.'
  },
  {
    id: 'blockchain',
    title: 'Blockchain',
    path: '/module/blockchain',
    icon: Link,
    description: 'See how blocks form an immutable chain.'
  },
  {
    id: 'distributed',
    title: 'Distributed',
    path: '/module/distributed',
    icon: Network,
    description: 'Explore the power of a distributed ledger.'
  },
  {
    id: 'tokens',
    title: 'Tokens',
    path: '/module/tokens',
    icon: Coins,
    description: 'Understand how digital assets work.'
  },
  {
    id: 'coinbase',
    title: 'Coinbase',
    path: '/module/coinbase',
    icon: Database,
    description: 'Learn about the first transaction in a block.'
  },
  {
    id: 'keys',
    title: 'Keys',
    path: '/module/keys',
    icon: Key,
    description: 'Master public and private keys.'
  },
  {
    id: 'signatures',
    title: 'Signatures',
    path: '/module/signatures',
    icon: PenTool,
    description: 'Verify authenticity with digital signatures.'
  },
  {
    id: 'transaction',
    title: 'Transaction',
    path: '/module/transaction',
    icon: Send,
    description: 'Send and receive value securely.'
  },
  {
    id: 'pow',
    title: 'Proof of Work',
    path: '/module/pow',
    icon: Zap,
    description: 'Understand the consensus mechanism.'
  },
  {
    id: 'mining',
    title: 'Mining',
    path: '/module/mining',
    icon: Hammer,
    description: 'Participate in securing the network.'
  },
  {
    id: 'difficulty',
    title: 'Difficulty',
    path: '/module/difficulty',
    icon: BarChart,
    description: 'Adjusting difficulty to maintain block time.'
  },
  {
    id: 'smart-contracts',
    title: 'Smart Contracts',
    path: '/module/smart-contracts',
    icon: FileCode,
    description: 'Programmable logic on the blockchain.'
  }
];

export const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5, 6];
