import React, { useEffect, useRef } from 'react';

const HeroBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Types
    interface ParticleNode {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
    }

    interface Transaction {
      from: ParticleNode;
      to: ParticleNode;
      progress: number; // 0 to 1
      color: string;
    }

    interface BlockParticle {
      x: number;
      y: number;
      size: number;
      opacity: number;
      life: number; // Decreases
    }

    let nodes: ParticleNode[] = [];
    let transactions: Transaction[] = [];
    let blocks: BlockParticle[] = [];

    // Configuration
    const nodeCount = 15;
    const connectionDistance = 250;
    const transactionSpeed = 0.005; // Adjusted for progress increment
    const blockSpeed = 0.5;

    // Resize handler
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNodes();
    };

    const initNodes = () => {
      nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 2,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and Draw Nodes
      nodes.forEach(node => {
        // Move
        node.x += node.vx;
        node.y += node.vy;

        // Bounce
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Draw Node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.4)'; // Purple
        ctx.fill();
      });

      // Draw Connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            // Opacity based on distance
            const opacity = 1 - dist / connectionDistance;
            ctx.strokeStyle = `rgba(168, 85, 247, ${opacity * 0.2})`;
            ctx.stroke();

            // Randomly spawn transaction
            if (Math.random() < 0.005 && transactions.length < 10) {
              transactions.push({
                from: nodes[i],
                to: nodes[j],
                progress: 0,
                color: Math.random() > 0.5 ? '#6366F1' : '#EC4899', // Indigo or Pink
              });
            }
          }
        }
      }

      // Update and Draw Transactions
      for (let i = transactions.length - 1; i >= 0; i--) {
        const tx = transactions[i];
        tx.progress += transactionSpeed; // Use adjusted speed

        if (tx.progress >= 1) {
          transactions.splice(i, 1);

          // Spawn block at destination occasionally
          if (Math.random() < 0.3) {
             blocks.push({
                 x: tx.to.x,
                 y: tx.to.y,
                 size: 10,
                 opacity: 1,
                 life: 100
             });
          }
          continue;
        }

        const x = tx.from.x + (tx.to.x - tx.from.x) * tx.progress;
        const y = tx.from.y + (tx.to.y - tx.from.y) * tx.progress;

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = tx.color;
        ctx.fill();
      }

      // Update and Draw Blocks (fading squares)
      for (let i = blocks.length - 1; i >= 0; i--) {
          const b = blocks[i];
          b.life -= 1;
          b.opacity = b.life / 100;
          b.y -= blockSpeed; // Float up slightly

          if (b.life <= 0) {
              blocks.splice(i, 1);
              continue;
          }

          ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.3})`;
          ctx.fillRect(b.x - b.size/2, b.y - b.size/2, b.size, b.size);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default HeroBackground;
