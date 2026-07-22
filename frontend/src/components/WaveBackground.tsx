import React, { useEffect, useRef } from "react";

interface WaveBackgroundProps {
  isAdmin?: boolean;
}

export const WaveBackground: React.FC<WaveBackgroundProps> = ({ isAdmin = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Ambient small background stars
    class AmbientStar {
      x: number;
      y: number;
      size: number;
      alpha: number;
      speed: number;
      pulseDirection: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5; // 0.5px to 2px
        this.alpha = Math.random() * 0.6 + 0.2;
        this.speed = Math.random() * 0.008 + 0.002;
        this.pulseDirection = Math.random() > 0.5 ? 1 : -1;
        
        // Purple, blue, or red tint for ambient space
        const tints = ["rgba(168, 85, 247,", "rgba(99, 102, 241,", "rgba(239, 68, 68,"];
        this.color = tints[Math.floor(Math.random() * tints.length)];
      }

      update() {
        this.alpha += this.speed * this.pulseDirection;
        if (this.alpha >= 0.8) {
          this.alpha = 0.8;
          this.pulseDirection = -1;
        } else if (this.alpha <= 0.15) {
          this.alpha = 0.15;
          this.pulseDirection = 1;
        }
      }

      draw(context: CanvasRenderingContext2D) {
        context.save();
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = `${this.color}${this.alpha})`;
        context.shadowBlur = this.size * 2;
        context.shadowColor = "rgba(168, 85, 247, 0.4)";
        context.fill();
        context.restore();
      }
    }

    // Shooting stars / meteors passing diagonally with a purple glow tail
    class ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      size: number;

      constructor() {
        this.reset();
        // Distribute starting positions so they don't all spawn simultaneously
        this.x = Math.random() * width;
        this.y = Math.random() * height * 0.8;
      }

      reset() {
        if (Math.random() > 0.5) {
          // Spawn on left side offscreen
          this.x = -150 - Math.random() * 300;
          this.y = Math.random() * height * 0.7;
        } else {
          // Spawn on top side offscreen
          this.x = Math.random() * width * 0.7;
          this.y = -150 - Math.random() * 300;
        }

        this.length = Math.random() * 110 + 70; // Tail length (70px to 180px)
        this.speed = Math.random() * 6 + 3.5; // Speed
        this.angle = (Math.PI / 6) + (Math.random() * (Math.PI / 18)); // 30 to 40 degrees diagonal
        this.size = Math.random() * 1.5 + 1; // Meteor core thickness
        this.opacity = Math.random() * 0.6 + 0.4;
      }

      update() {
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);

        // Reset if goes off screen
        if (this.x > width + 150 || this.y > height + 150) {
          this.reset();
        }
      }

      draw(context: CanvasRenderingContext2D) {
        context.save();

        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;

        // Custom gradient for shooting star tail (White or Gold head -> Purple trailing tail)
        const grad = context.createLinearGradient(this.x, this.y, tailX, tailY);
        
        if (isAdmin) {
          // Purple/white shooting stars for Admin Mode (as it was)
          grad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`); // White hot head
          grad.addColorStop(0.15, `rgba(216, 180, 254, ${this.opacity * 0.95})`); // Bright lavender-violet
          grad.addColorStop(0.6, `rgba(168, 85, 247, ${this.opacity * 0.65})`); // Deep Purple
        } else {
          // Golden head, purple tail for Storefront ("مقدمة الشهب ذهبية مع وميض بنفسجي في نهايتها خلفها")
          grad.addColorStop(0, `rgba(250, 204, 21, ${this.opacity})`); // Golden head
          grad.addColorStop(0.15, `rgba(192, 132, 252, ${this.opacity * 0.95})`); // Lavender-violet transition
          grad.addColorStop(0.6, `rgba(168, 85, 247, ${this.opacity * 0.65})`); // Deep Purple
        }
        grad.addColorStop(1, "rgba(147, 51, 234, 0)"); // Fading trail

        // Draw trail line
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(tailX, tailY);
        context.strokeStyle = grad;
        context.lineWidth = this.size;
        context.lineCap = "round";

        // Set rich purple glow (وميض بنفسجي في نهايتها خلفها)
        context.shadowBlur = 18;
        context.shadowColor = "rgba(168, 85, 247, 0.9)";
        
        context.stroke();

        // Glowing core (head of shooting star)
        context.beginPath();
        context.arc(this.x, this.y, this.size + 0.5, 0, Math.PI * 2);
        
        if (isAdmin) {
          context.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
          context.shadowBlur = 22;
          context.shadowColor = "rgba(192, 132, 252, 1)";
        } else {
          context.fillStyle = `rgba(250, 204, 21, ${this.opacity})`; // Golden core
          context.shadowBlur = 22;
          context.shadowColor = "rgba(234, 179, 8, 1)"; // Warm golden aura
        }
        context.fill();

        context.restore();
      }
    }

    // Yellow dots twinkling and moving smoothly from bottom to top for Admin Mode
    class AdminYellowDot {
      x: number;
      y: number;
      size: number;
      alpha: number;
      speedY: number;
      speedX: number;
      pulseSpeed: number;
      pulseDirection: number;

      constructor(initRandomY = false) {
        this.size = Math.random() * 2.5 + 1.2; // 1.2px to 3.7px
        this.x = Math.random() * width;
        this.y = initRandomY ? Math.random() * height : height + Math.random() * 50;
        this.alpha = Math.random() * 0.7 + 0.3;
        this.speedY = -(Math.random() * 1.0 + 0.5); // Smooth upward movement
        this.speedX = (Math.random() - 0.5) * 0.25; // Slight drifting
        this.pulseSpeed = Math.random() * 0.02 + 0.008;
        this.pulseDirection = Math.random() > 0.5 ? 1 : -1;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;

        // Opacity pulsation (twinkling/blinking)
        this.alpha += this.pulseSpeed * this.pulseDirection;
        if (this.alpha >= 1) {
          this.alpha = 1;
          this.pulseDirection = -1;
        } else if (this.alpha <= 0.25) {
          this.alpha = 0.25;
          this.pulseDirection = 1;
        }

        // Reset to bottom when leaving the top of screen
        if (this.y < -20) {
          this.y = height + Math.random() * 20;
          this.x = Math.random() * width;
          this.alpha = Math.random() * 0.7 + 0.3;
        }
      }

      draw(context: CanvasRenderingContext2D) {
        context.save();
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Golden yellow color
        context.fillStyle = `rgba(250, 204, 21, ${this.alpha})`;
        
        // Soft yellow/golden glow
        context.shadowBlur = this.size * 3.5;
        context.shadowColor = "rgba(234, 179, 8, 0.9)";
        
        context.fill();
        context.restore();
      }
    }

    // Initialize 45 ambient stars and 12 shooting stars (for storefront) or 45 smooth rising dots (for admin)
    const ambientStars: AmbientStar[] = [];
    for (let i = 0; i < 45; i++) {
      ambientStars.push(new AmbientStar());
    }

    const shootingStars: ShootingStar[] = [];
    const adminYellowDots: AdminYellowDot[] = [];

    if (isAdmin) {
      for (let i = 0; i < 45; i++) {
        adminYellowDots.push(new AdminYellowDot(true));
      }
    } else {
      for (let i = 0; i < 12; i++) {
        shootingStars.push(new ShootingStar());
      }
    }

    // Wave parameters
    let offset1 = 0;
    let offset2 = Math.PI / 3;
    let offset3 = Math.PI / 1.5;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Drawing loop
    const render = () => {
      if (isAdmin) {
        // Clear canvas with a beautiful dark red to black diagonal gradient (موجات للون الأحمر الداكن بشكل متدرج)
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, "#080102"); // Very dark red
        bgGrad.addColorStop(0.5, "#140203"); // Deep crimson/maroon
        bgGrad.addColorStop(1, "#220204"); // Dark red
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Draw the sea waves (deep crimson red gradient waves for Admin Dashboard)
        // Wave 3 (deepest layer)
        drawWave(ctx, offset3, 0.0015, height * 0.45, 60, "rgba(74, 4, 10, 0.35)");
        
        // Wave 2 (middle layer)
        drawWave(ctx, offset2, 0.002, height * 0.55, 45, "rgba(139, 0, 0, 0.2)");
        
        // Wave 1 (front-most layer)
        drawWave(ctx, offset1, 0.003, height * 0.65, 30, "rgba(220, 38, 38, 0.12)");
      } else {
        // Clear canvas with a solid very deep red/black background to blend (Storefront "الأحمر الداكن")
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, "#080102");
        bgGrad.addColorStop(0.5, "#140203");
        bgGrad.addColorStop(1, "#220204");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Draw the sea waves (deep red, burgundy, to crimson)
        // Wave 3 (deepest layer)
        drawWave(ctx, offset3, 0.0015, height * 0.45, 60, "rgba(74, 4, 10, 0.35)");
        
        // Wave 2 (middle layer)
        drawWave(ctx, offset2, 0.002, height * 0.55, 45, "rgba(139, 0, 0, 0.2)");
        
        // Wave 1 (front-most layer)
        drawWave(ctx, offset1, 0.003, height * 0.65, 30, "rgba(220, 38, 38, 0.12)");
      }

      // Increment wave offsets to move them like sea waves
      if (isAdmin) {
        offset1 += 0.003;
        offset2 += 0.002;
        offset3 += 0.0015;
      } else {
        offset1 += 0.003;
        offset2 += 0.002;
        offset3 += 0.0015;
      }

      // Update and Draw Background Stars
      ambientStars.forEach((star) => {
        star.update();
        star.draw(ctx);
      });

      if (isAdmin) {
        // Update and Draw Admin Yellow Dots (تتحرك من الأسفل للأعلى وتومض بشكل سلس)
        adminYellowDots.forEach((dot) => {
          dot.update();
          dot.draw(ctx);
        });
      } else {
        // Update and Draw Shooting Stars (for Storefront)
        shootingStars.forEach((star) => {
          star.update();
          star.draw(ctx);
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const drawWave = (
      context: CanvasRenderingContext2D,
      phaseOffset: number,
      frequency: number,
      baseY: number,
      amplitude: number,
      color: string
    ) => {
      context.beginPath();
      context.moveTo(0, height);

      // Start at x = 0
      context.lineTo(0, baseY + Math.sin(phaseOffset) * amplitude);

      // Loop across the width
      for (let x = 0; x <= width; x += 15) {
        // Multi-frequency wave calculation for realistic ocean organic wave
        const y =
          baseY +
          Math.sin(x * frequency + phaseOffset) * amplitude +
          Math.cos(x * (frequency * 0.5) + phaseOffset * 0.8) * (amplitude * 0.3);
        context.lineTo(x, y);
      }

      context.lineTo(width, height);
      context.closePath();
      context.fillStyle = color;
      context.fill();
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isAdmin]);

  return (
    <canvas
      ref={canvasRef}
      id="wave-canvas"
      className="fixed inset-0 w-full h-full -z-50 pointer-events-none"
    />
  );
};
