import React from 'react';
import { ArrowRight, Server, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-10" />

      <div className="container mx-auto px-6 py-24 relative z-10 flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-lg">
          Master the Blockchain
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-12 leading-relaxed">
          An interactive, hands-on simulator to visualize and understand how distributed ledgers work.
          From hashing to consensus, build your knowledge block by block.
        </p>

        <Link
          to="/journey"
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-indigo-600 rounded-full hover:bg-indigo-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-500/30"
        >
          Start the Journey
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <div className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Cryptographic Security</h3>
            <p className="text-gray-400">Learn how public keys and signatures protect your assets.</p>
          </div>

          <div className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Server className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Decentralized Consensus</h3>
            <p className="text-gray-400">See how nodes agree on the truth without a central authority.</p>
          </div>

          <div className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Zap className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Interactive Sandbox</h3>
            <p className="text-gray-400">Experiment with mining, transactions, and forks in real-time.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
