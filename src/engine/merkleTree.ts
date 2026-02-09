import { sha256 } from './hash';
import { MerkleNode } from './types';

export function buildMerkleTree(transactions: string[]): MerkleNode {
  if (transactions.length === 0) {
    throw new Error('Cannot build Merkle tree with no transactions');
  }

  let nodes: MerkleNode[] = transactions.map((tx) => ({
    hash: sha256(tx),
    data: tx,
  }));

  while (nodes.length > 1) {
    const newLevel: MerkleNode[] = [];
    for (let i = 0; i < nodes.length; i += 2) {
      const left = nodes[i];
      const right = i + 1 < nodes.length ? nodes[i + 1] : left; // Duplicate if odd

      const hash = sha256(left.hash + right.hash);
      newLevel.push({
        hash,
        left,
        right,
      });
    }
    nodes = newLevel;
  }

  return nodes[0];
}

export function getMerkleRoot(tree: MerkleNode): string {
  return tree.hash;
}

export function getMerkleProof(
  tree: MerkleNode,
  leafIndex: number,
  totalLeaves: number
): { hash: string; direction: 'left' | 'right' }[] {
  if (leafIndex < 0 || leafIndex >= totalLeaves) {
    throw new Error('Leaf index out of bounds');
  }

  // 1. Calculate the path indices from leaf to root
  // We need to simulate the tree structure (layer sizes) to get the index at each layer.
  const pathIndices: number[] = [];
  let currentIdx = leafIndex;
  let layerCount = totalLeaves;

  // Push leaf index first
  pathIndices.push(currentIdx);

  while (layerCount > 1) {
    currentIdx = Math.floor(currentIdx / 2);
    pathIndices.push(currentIdx);
    layerCount = Math.ceil(layerCount / 2);
  }

  // pathIndices is now [leafIndex, parentIndex, ..., rootIndex=0]
  // We want to traverse from Root (index 0) down to Leaf.
  // Reverse to get [0, ..., leafIndex]
  pathIndices.reverse();

  const proof: { hash: string; direction: 'left' | 'right' }[] = [];
  let currentNode = tree;

  // Traverse down
  for (let i = 0; i < pathIndices.length - 1; i++) {
    const currentLevelIdx = pathIndices[i];
    const nextLevelIdx = pathIndices[i + 1];

    // Determine if we go left or right
    // Left child of index K is 2*K
    // Right child of index K is 2*K + 1
    const isLeftChild = nextLevelIdx === currentLevelIdx * 2;

    if (isLeftChild) {
      // We go left. Sibling is right.
      // If right doesn't exist (shouldn't happen in full tree due to duplication), handle it.
      // In our construction, right always exists (it might be a duplicate of left).
      if (!currentNode.right) throw new Error('Tree structure mismatch');
      proof.push({ hash: currentNode.right.hash, direction: 'right' });
      currentNode = currentNode.left!;
    } else {
      // We go right. Sibling is left.
      if (!currentNode.left) throw new Error('Tree structure mismatch');
      proof.push({ hash: currentNode.left.hash, direction: 'left' });
      currentNode = currentNode.right!;
    }
  }

  // The proof was collected top-down (root to leaf).
  // Verification usually starts from leaf hash and works up.
  // So the first hash we need is the sibling of the leaf.
  // That was the LAST element added to 'proof'.
  // So we reverse the proof.
  return proof.reverse();
}

export function verifyMerkleProof(
  proof: { hash: string; direction: string }[],
  leafHash: string,
  root: string
): boolean {
  let currentHash = leafHash;

  for (const step of proof) {
    if (step.direction === 'left') {
      // Sibling is on the left
      currentHash = sha256(step.hash + currentHash);
    } else {
      // Sibling is on the right
      currentHash = sha256(currentHash + step.hash);
    }
  }

  return currentHash === root;
}
