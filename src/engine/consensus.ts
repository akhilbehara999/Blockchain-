interface Miner {
  name: string;
  hashRate: number;
}

interface Validator {
  name: string;
  stake: number;
}

interface Delegate {
  name: string;
  votes: number;
}

export function simulatePoW(
  miners: Miner[],
  difficulty: number
): { winner: string; attempts: Record<string, number>; timeMs: number } {
  // Probability of finding a hash with 'difficulty' leading zeros (hex)
  // Each hex char is 4 bits. Probability is (1/16)^difficulty.
  const successProbability = Math.pow(16, -difficulty);

  const totalHashRate = miners.reduce((sum, m) => sum + m.hashRate, 0);

  // Expected number of hashes to find a block
  const expectedHashes = 1 / successProbability;

  // Add some randomness to the total attempts (Geometric distribution approximation)
  // logic: average is expectedHashes.
  // variance is large.
  // We'll just use expectedHashes * random(0.5, 1.5) for simulation variance
  const actualHashes = Math.floor(expectedHashes * (0.5 + Math.random()));

  // Select winner proportional to hash rate
  const randomValue = Math.random() * totalHashRate;
  let accumulatedRate = 0;
  let winner = miners[0].name;

  for (const miner of miners) {
    accumulatedRate += miner.hashRate;
    if (randomValue <= accumulatedRate) {
      winner = miner.name;
      break;
    }
  }

  // Distribute attempts proportional to hash rate
  const attempts: Record<string, number> = {};
  miners.forEach((m) => {
    attempts[m.name] = Math.floor(actualHashes * (m.hashRate / totalHashRate));
  });

  // Estimate time (assuming hashRate is hashes/sec)
  // If hashRate is small, time might be large.
  const timeMs = (actualHashes / totalHashRate) * 1000;

  return { winner, attempts, timeMs };
}

export function simulatePoS(
  validators: Validator[]
): { selected: string; probability: Record<string, number> } {
  const totalStake = validators.reduce((sum, v) => sum + v.stake, 0);
  const probability: Record<string, number> = {};

  validators.forEach((v) => {
    probability[v.name] = v.stake / totalStake;
  });

  const randomValue = Math.random() * totalStake;
  let accumulatedStake = 0;
  let selected = validators[0].name;

  for (const validator of validators) {
    accumulatedStake += validator.stake;
    if (randomValue <= accumulatedStake) {
      selected = validator.name;
      break;
    }
  }

  return { selected, probability };
}

export function simulateDPoS(
  delegates: Delegate[],
  topN: number
): { activeDelegates: string[]; blockProducer: string } {
  // Sort by votes descending
  const sortedDelegates = [...delegates].sort((a, b) => b.votes - a.votes);

  // Select top N
  const activeDelegateObjects = sortedDelegates.slice(0, topN);
  const activeDelegates = activeDelegateObjects.map((d) => d.name);

  if (activeDelegates.length === 0) {
    throw new Error('No delegates available');
  }

  // Round-robin selection (simulate by picking random from active)
  // Since this function is stateless, we can't strictly do round-robin across calls without state.
  // Random is fine for simulation of "who is producing NOW".
  const blockProducer = activeDelegates[Math.floor(Math.random() * activeDelegates.length)];

  return { activeDelegates, blockProducer };
}
