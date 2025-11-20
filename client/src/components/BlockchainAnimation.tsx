import { useEffect, useRef, useState } from "react";

interface Block {
  x: number;
  y: number;
  scale: number;
  delay: number;
}

export function BlockchainAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blocks] = useState<Block[]>([
    { x: 100, y: 200, scale: 1, delay: 0 },
    { x: 280, y: 200, scale: 1, delay: 200 },
    { x: 460, y: 200, scale: 1, delay: 400 },
    { x: 640, y: 200, scale: 1, delay: 600 },
    { x: 820, y: 200, scale: 1, delay: 800 },
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let animationFrame = 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerY = canvas.getBoundingClientRect().height / 2;
      const spacing = Math.min(180, canvas.getBoundingClientRect().width / 6);
      const startX = (canvas.getBoundingClientRect().width - spacing * 4) / 2;

      blocks.forEach((block, i) => {
        const blockX = startX + i * spacing;
        const blockY = centerY;
        const opacity = Math.min(1, (elapsed - block.delay) / 500);

        if (opacity > 0) {
          const pulseScale = 1 + Math.sin((elapsed + i * 500) / 1000) * 0.05;
          const size = 50 * pulseScale;

          ctx.shadowColor = "#39FF14";
          ctx.shadowBlur = 15;
          ctx.fillStyle = `rgba(65, 105, 225, ${opacity})`;
          ctx.fillRect(blockX - size / 2, blockY - size / 2, size, size);

          ctx.shadowBlur = 0;
          ctx.strokeStyle = `rgba(57, 255, 20, ${opacity * 0.8})`;
          ctx.lineWidth = 2;
          ctx.strokeRect(blockX - size / 2, blockY - size / 2, size, size);

          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.font = "bold 14px JetBrains Mono";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${i}`, blockX, blockY);

          if (i > 0 && opacity > 0) {
            const prevX = startX + (i - 1) * spacing;
            const lineProgress = Math.min(1, (elapsed - block.delay) / 300);

            ctx.beginPath();
            ctx.moveTo(prevX + 25, centerY);
            const endX = prevX + 25 + (blockX - prevX - 50) * lineProgress;
            ctx.lineTo(endX, centerY);
            ctx.strokeStyle = `rgba(57, 255, 20, ${opacity * 0.6})`;
            ctx.lineWidth = 3;
            ctx.stroke();

            if (lineProgress > 0.5) {
              ctx.beginPath();
              ctx.arc(endX, centerY, 4, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(57, 255, 20, ${opacity})`;
              ctx.fill();
            }
          }
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [blocks]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ maxHeight: "400px" }}
    />
  );
}
