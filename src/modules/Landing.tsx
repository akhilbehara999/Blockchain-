import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary-bg flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />

      <div className="z-10 max-w-3xl space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          BlockSim
        </h1>
        <p className="text-xl md:text-2xl text-text-secondary">
          Master the blockchain. One block at a time.
        </p>
        <p className="text-text-tertiary max-w-2xl mx-auto">
          An interactive, visual, and deep-dive simulation into the mechanics of distributed ledgers, mining, and consensus.
        </p>

        <div className="pt-8">
          <Link to="/module/introduction">
            <Button size="lg" className="text-lg px-8 py-4 shadow-xl shadow-indigo-500/20">
              Start Learning <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
