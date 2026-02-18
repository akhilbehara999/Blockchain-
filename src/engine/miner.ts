import { Storage } from '../utils/storage';
import { RateLimiter } from '../utils/rateLimit';

export interface Miner {
  id: string;
  name: string;
  avatar: string;
  hashRate: number; // H/s
  blocksWon: number;
  totalRewards: number;
  winRate: number; // 0-100
  // Runtime state
  currentNonce: number;
  attempts: number;
  elapsedTime: number;
  status: 'idle' | 'racing' | 'won' | 'lost';
  isUser: boolean;
}

export interface MiningResult {
  winner: Miner;
  allMiners: Miner[];
}

export type MinerStats = Miner;
export type MinerLeaderboard = Miner[];

const STORAGE_KEY = 'yupp_mining_bots';
const BLOCK_REWARD = 50;
const DIFFICULTY_SCALE = 100;

// Rate limit: 1 race every 2 seconds to prevent spamming
const miningRateLimiter = new RateLimiter(1, 2000);

function generateBots(): Miner[] {
  const bots: Miner[] = [];
  const count = 5 + Math.floor(Math.random() * 4); // 5 to 8 bots

  for (let i = 0; i < count; i++) {
    const name = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank', 'Grace', 'Heidi'][i];
    const avatar = ['👷‍♀️', '👷', '🤖', '🖥️', '⚡', '⛏️', '🏗️', '🏭'][i];
    const hashRate = 20 + Math.floor(Math.random() * 60);

    bots.push({
      id: `bot-${i}`,
      name: `Miner ${name}`,
      avatar,
      hashRate,
      blocksWon: 0,
      totalRewards: 0,
      winRate: 0,
      currentNonce: 0,
      attempts: 0,
      elapsedTime: 0,
      status: 'idle',
      isUser: false,
    });
  }
  return bots;
}

function loadMiners(): Miner[] {
  const stored = Storage.getItem<Miner[]>(STORAGE_KEY);
  if (stored && Array.isArray(stored)) {
    return stored.map((m: Miner) => ({
      ...m,
      currentNonce: 0,
      attempts: 0,
      elapsedTime: 0,
      status: 'idle',
    }));
  }

  const bots = generateBots();
  saveMiners(bots);
  return bots;
}

function saveMiners(miners: Miner[]) {
  const toSave = miners.filter(m => !m.isUser).map(m => ({
    id: m.id,
    name: m.name,
    avatar: m.avatar,
    hashRate: m.hashRate,
    blocksWon: m.blocksWon,
    totalRewards: m.totalRewards,
    winRate: m.winRate,
    // Don't save runtime stats
    currentNonce: 0,
    attempts: 0,
    elapsedTime: 0,
    status: 'idle',
    isUser: false
  }));
  Storage.setItem(STORAGE_KEY, toSave);
}

export function getMinerStats(): MinerStats[] {
  return loadMiners();
}

export function getLeaderboard(): MinerLeaderboard {
  const miners = loadMiners();
  return miners.sort((a, b) => {
    if (b.blocksWon !== a.blocksWon) return b.blocksWon - a.blocksWon;
    if (b.totalRewards !== a.totalRewards) return b.totalRewards - a.totalRewards;
    return b.winRate - a.winRate;
  });
}

export function startMiningRace(
  difficulty: number,
  userHashRate: number,
  onProgress: (miners: Miner[]) => void
): Promise<MiningResult> {
  if (!miningRateLimiter.canProceed()) {
    return Promise.reject(new Error("Mining rate limit exceeded. Please wait between attempts."));
  }

  return new Promise((resolve) => {
    const bots = loadMiners();
    const userMiner: Miner = {
      id: 'user',
      name: 'You',
      avatar: '👤',
      hashRate: userHashRate,
      blocksWon: 0,
      totalRewards: 0,
      winRate: 0,
      currentNonce: 0,
      attempts: 0,
      elapsedTime: 0,
      status: 'racing',
      isUser: true,
    };

    // Initialize race state
    let activeMiners = [userMiner, ...bots.map(b => ({ ...b, status: 'racing' as const }))];

    // Determine outcomes deterministically based on hash rate probability
    const raceTargets = activeMiners.map(miner => {
      const randomFactor = -Math.log(Math.random());
      const safeHashRate = Math.max(1, miner.hashRate);
      const timeSeconds = randomFactor * (difficulty * DIFFICULTY_SCALE / safeHashRate);
      return {
        id: miner.id,
        targetTime: timeSeconds,
      };
    });

    raceTargets.sort((a, b) => a.targetTime - b.targetTime);
    const winnerId = raceTargets[0].id;
    const winningTime = raceTargets[0].targetTime;

    const startTime = performance.now();
    let animationFrameId: number;

    const tick = () => {
      const now = performance.now();
      const elapsedSeconds = (now - startTime) / 1000;
      let finished = false;

      activeMiners = activeMiners.map(miner => {
        const target = raceTargets.find(t => t.id === miner.id)!;
        let currentStatus = miner.status;
        let attempts = miner.attempts;
        let elapsedTime = elapsedSeconds;

        // If this miner finished (or race ended for them)
        if (elapsedSeconds >= target.targetTime) {
           elapsedTime = target.targetTime;
           attempts = Math.floor(target.targetTime * miner.hashRate);

           if (miner.id === winnerId) {
             currentStatus = 'won';
             finished = true;
           } else {
             currentStatus = 'lost';
           }
        } else if (finished) {
           // Race already finished by someone else in this tick?
           // No, `finished` flag is set in this loop.
           // If winner found, subsequent miners in this loop should check against winning time?
           // The winning condition is global. If elapsed >= winningTime, race is over.
           // Actually simpler: if elapsed >= winningTime, everyone stops.
        } else {
           elapsedTime = elapsedSeconds;
           attempts = Math.floor(elapsedSeconds * miner.hashRate);
           currentStatus = 'racing';
        }

        // Override if global race end condition met (safety)
        if (elapsedSeconds >= winningTime && miner.id !== winnerId) {
            currentStatus = 'lost';
            elapsedTime = winningTime;
            attempts = Math.floor(winningTime * miner.hashRate);
        }

        return {
          ...miner,
          currentNonce: attempts, // visualizing attempts as nonce
          attempts,
          elapsedTime,
          status: currentStatus,
        };
      });

      onProgress(activeMiners);

      if (elapsedSeconds >= winningTime) {
        cancelAnimationFrame(animationFrameId);

        // Finalize
        const finalMiners = activeMiners.map(m => {
            if (m.id === winnerId) {
                return { ...m, status: 'won' as const, elapsedTime: winningTime };
            }
            return { ...m, status: 'lost' as const, elapsedTime: winningTime };
        });

        // Save stats for bots
        const botsToSave = finalMiners.filter(m => !m.isUser);
        // Merge with previous stats
        const updatedBots = bots.map(bot => {
            const result = botsToSave.find(r => r.id === bot.id);
            if (result) {
                const won = result.status === 'won';
                return {
                    ...bot,
                    blocksWon: bot.blocksWon + (won ? 1 : 0),
                    totalRewards: bot.totalRewards + (won ? BLOCK_REWARD : 0),
                    // Simplistic win rate update could be done here if we tracked total races
                };
            }
            return bot;
        });

        saveMiners(updatedBots);

        resolve({
          winner: finalMiners.find(m => m.status === 'won')!,
          allMiners: finalMiners
        });
      } else {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);
  });
}
