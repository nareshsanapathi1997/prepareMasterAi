import React, { useState, useEffect, useRef } from 'react';
import {
  FlaskConical,
  Zap,
  RotateCcw,
  Sparkles,
  Layers,
  Activity,
  Sliders,
  CheckCircle2,
  Atom,
  HelpCircle,
  Play,
  Pause,
} from 'lucide-react';
import { ExamCategory } from '../types';

interface VirtualLabModuleProps {
  activeExam: string;
}

export const VirtualLabModule: React.FC<VirtualLabModuleProps> = ({ activeExam }) => {
  const [activeLabTab, setActiveLabTab] = useState<'ray-optics' | 'projectile' | 'rlc-circuit' | 'titration'>('ray-optics');

  // ================= 1. RAY OPTICS SIMULATOR STATE =================
  const [lensType, setLensType] = useState<'convex' | 'concave'>('convex');
  const [focalLength, setFocalLength] = useState<number>(100); // in px
  const [objectDistance, setObjectDistance] = useState<number>(180); // in px from lens (positive value representing left)
  const [objectHeight, setObjectHeight] = useState<number>(60); // in px
  const opticsCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute image distance and height (Lens Formula: 1/f = 1/v - 1/u where u is -objectDistance)
  // 1/v = 1/f + 1/u = 1/f - 1/objectDistance (for convex lens f > 0; for concave lens f < 0)
  const signedF = lensType === 'convex' ? focalLength : -focalLength;
  const signedU = -objectDistance;
  // 1/v = 1/signedF + 1/signedU
  const invV = 1 / signedF + 1 / signedU;
  const imageDistance = Math.abs(invV) < 0.0001 ? 99999 : 1 / invV; // positive is right side, negative is left side
  const magnification = -imageDistance / signedU;
  const imageHeight = objectHeight * magnification;
  const isReal = imageDistance > 0 && lensType === 'convex';

  useEffect(() => {
    if (activeLabTab !== 'ray-optics') return;
    const canvas = opticsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Draw Optical Axis
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Draw Lens at Center
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (lensType === 'convex') {
      ctx.ellipse(centerX, centerY, 12, height * 0.42, 0, 0, 2 * Math.PI);
    } else {
      ctx.moveTo(centerX - 10, centerY - height * 0.4);
      ctx.lineTo(centerX + 10, centerY - height * 0.4);
      ctx.quadraticCurveTo(centerX, centerY, centerX + 10, centerY + height * 0.4);
      ctx.lineTo(centerX - 10, centerY + height * 0.4);
      ctx.quadraticCurveTo(centerX, centerY, centerX - 10, centerY - height * 0.4);
    }
    ctx.fill();
    ctx.stroke();

    // Draw Focal Points F1, 2F1 (Left) and F2, 2F2 (Right)
    const focalPoints = [
      { x: centerX - focalLength, label: 'F₁' },
      { x: centerX - 2 * focalLength, label: '2F₁' },
      { x: centerX + focalLength, label: 'F₂' },
      { x: centerX + 2 * focalLength, label: '2F₂' },
    ];

    focalPoints.forEach((pt) => {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(pt.x, centerY, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(pt.label, pt.x - 8, centerY + 18);
    });

    // Draw Object Arrow (Left)
    const objX = centerX - objectDistance;
    const objTopY = centerY - objectHeight;

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(objX, centerY);
    ctx.lineTo(objX, objTopY);
    ctx.stroke();
    // Arrowhead
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(objX, objTopY - 4);
    ctx.lineTo(objX - 6, objTopY + 8);
    ctx.lineTo(objX + 6, objTopY + 8);
    ctx.fill();

    ctx.font = '12px sans-serif';
    ctx.fillText('Object (AB)', objX - 30, objTopY - 8);

    // Draw Principal Rays
    if (Math.abs(imageDistance) < 2000) {
      const imgX = centerX + imageDistance;
      const imgTopY = centerY + imageHeight;

      // Ray 1: Parallel to axis, then through F2
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(objX, objTopY);
      ctx.lineTo(centerX, objTopY);
      if (lensType === 'convex') {
        ctx.lineTo(imgX, imgTopY);
      } else {
        // Diverges away from F1
        ctx.lineTo(centerX + 250, objTopY + (objTopY - centerY) * 1.5);
      }
      ctx.stroke();

      // Ray 2: Passing through Optical Center (straight line)
      ctx.strokeStyle = '#a855f7';
      ctx.beginPath();
      ctx.moveTo(objX, objTopY);
      ctx.lineTo(centerX, centerY);
      ctx.lineTo(imgX, imgTopY);
      ctx.stroke();

      // Draw Image Arrow
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(imgX, centerY);
      ctx.lineTo(imgX, imgTopY);
      ctx.stroke();
      // Image Arrowhead
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      if (imgTopY < centerY) {
        ctx.moveTo(imgX, imgTopY - 4);
        ctx.lineTo(imgX - 6, imgTopY + 8);
        ctx.lineTo(imgX + 6, imgTopY + 8);
      } else {
        ctx.moveTo(imgX, imgTopY + 4);
        ctx.lineTo(imgX - 6, imgTopY - 8);
        ctx.lineTo(imgX + 6, imgTopY - 8);
      }
      ctx.fill();

      ctx.fillText(
        `Image (A'B') [${isReal ? 'Real & Inverted' : 'Virtual & Erect'}]`,
        imgX - 30,
        imgTopY > centerY ? imgTopY + 20 : imgTopY - 10
      );
    }
  }, [activeLabTab, lensType, focalLength, objectDistance, objectHeight, imageDistance, imageHeight, isReal]);

  // ================= 2. PROJECTILE MOTION SIMULATOR STATE =================
  const [projSpeed, setProjSpeed] = useState<number>(35); // m/s
  const [projAngle, setProjAngle] = useState<number>(45); // degrees
  const [projGravity, setProjGravity] = useState<number>(9.8); // m/s^2
  const [projAirResistance, setProjAirResistance] = useState<boolean>(false);
  const [projIsPlaying, setProjIsPlaying] = useState<boolean>(false);
  const [projTime, setProjTime] = useState<number>(0);
  const projCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const rad = (projAngle * Math.PI) / 180;
  const timeOfFlight = (2 * projSpeed * Math.sin(rad)) / projGravity;
  const maxRange = (Math.pow(projSpeed, 2) * Math.sin(2 * rad)) / projGravity;
  const maxHeight = (Math.pow(projSpeed * Math.sin(rad), 2)) / (2 * projGravity);

  useEffect(() => {
    let animationFrame: number;
    if (projIsPlaying) {
      const step = () => {
        setProjTime((t) => {
          const next = t + 0.05;
          if (next >= timeOfFlight) {
            setProjIsPlaying(false);
            return timeOfFlight;
          }
          return next;
        });
        animationFrame = requestAnimationFrame(step);
      };
      animationFrame = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [projIsPlaying, timeOfFlight]);

  useEffect(() => {
    if (activeLabTab !== 'projectile') return;
    const canvas = projCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const originX = 50;
    const originY = height - 40;

    ctx.clearRect(0, 0, width, height);

    // Ground line
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Scale factors
    const scaleX = Math.min((width - 100) / Math.max(maxRange, 50), 4);
    const scaleY = Math.min((height - 100) / Math.max(maxHeight, 30), 4);

    // Full Trajectory Path
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let t = 0; t <= timeOfFlight; t += 0.05) {
      const x = projSpeed * Math.cos(rad) * t;
      const y = projSpeed * Math.sin(rad) * t - 0.5 * projGravity * t * t;
      const px = originX + x * scaleX;
      const py = originY - y * scaleY;
      if (t === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Current Projectile Ball Position
    const curX = projSpeed * Math.cos(rad) * projTime;
    const curY = Math.max(0, projSpeed * Math.sin(rad) * projTime - 0.5 * projGravity * projTime * projTime);
    const ballPx = originX + curX * scaleX;
    const ballPy = originY - curY * scaleY;

    // Ball
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(ballPx, ballPy, 7, 0, 2 * Math.PI);
    ctx.fill();

    // Velocity Vectors
    const vx = projSpeed * Math.cos(rad);
    const vy = projSpeed * Math.sin(rad) - projGravity * projTime;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ballPx, ballPy);
    ctx.lineTo(ballPx + vx * 0.8, ballPy - vy * 0.8);
    ctx.stroke();
  }, [activeLabTab, projSpeed, projAngle, projGravity, projTime, maxRange, maxHeight, rad, timeOfFlight]);

  // ================= 3. RLC CIRCUIT SIMULATOR STATE =================
  const [rlcResistance, setRlcResistance] = useState<number>(20); // Ohms
  const [rlcInductance, setRlcInductance] = useState<number>(0.1); // Henry (100mH)
  const [rlcCapacitance, setRlcCapacitance] = useState<number>(100); // microFarads
  const [rlcFrequency, setRlcFrequency] = useState<number>(50); // Hz
  const [rlcVoltage, setRlcVoltage] = useState<number>(230); // Volts RMS

  const omega = 2 * Math.PI * rlcFrequency;
  const xl = omega * rlcInductance;
  const xc = 1 / (omega * (rlcCapacitance * 1e-6));
  const impedanceZ = Math.sqrt(Math.pow(rlcResistance, 2) + Math.pow(xl - xc, 2));
  const currentRMS = rlcVoltage / impedanceZ;
  const resonantFreq = 1 / (2 * Math.PI * Math.sqrt(rlcInductance * (rlcCapacitance * 1e-6)));
  const phaseAngleDeg = (Math.atan((xl - xc) / rlcResistance) * 180) / Math.PI;
  const powerFactor = Math.cos((phaseAngleDeg * Math.PI) / 180);

  // ================= 4. ACID-BASE TITRATION LAB STATE =================
  const [acidConc, setAcidConc] = useState<number>(0.1); // M HCl
  const [acidVolume, setAcidVolume] = useState<number>(25); // mL
  const [baseConc, setBaseConc] = useState<number>(0.1); // M NaOH
  const [titrantAdded, setTitrantAdded] = useState<number>(0); // mL NaOH added
  const [indicator, setIndicator] = useState<'phenolphthalein' | 'methyl-orange' | 'bromothymol'>('phenolphthalein');

  // Compute pH
  const molesAcid = (acidConc * acidVolume) / 1000;
  const molesBase = (baseConc * titrantAdded) / 1000;
  const totalVol = (acidVolume + titrantAdded) / 1000;
  let currentPH = 7.0;

  if (molesAcid > molesBase) {
    const remainingH = (molesAcid - molesBase) / totalVol;
    currentPH = Math.max(0, -Math.log10(remainingH));
  } else if (molesBase > molesAcid) {
    const excessOH = (molesBase - molesAcid) / totalVol;
    const pOH = -Math.log10(excessOH);
    currentPH = Math.min(14, 14 - pOH);
  } else {
    currentPH = 7.0; // Equivalence point
  }

  // Indicator color
  const getIndicatorColor = () => {
    if (indicator === 'phenolphthalein') {
      return currentPH >= 8.2 ? 'rgba(236, 72, 153, 0.75)' : 'rgba(241, 245, 249, 0.4)';
    } else if (indicator === 'methyl-orange') {
      return currentPH <= 3.1 ? 'rgba(239, 68, 68, 0.8)' : currentPH >= 4.4 ? 'rgba(234, 179, 8, 0.8)' : 'rgba(249, 115, 22, 0.8)';
    } else {
      return currentPH < 6.0 ? 'rgba(234, 179, 8, 0.8)' : currentPH > 7.6 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(34, 197, 94, 0.8)';
    }
  };

  return (
    <div id="virtual-lab-module" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-2xl p-6 text-white border border-sky-800/40 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              <FlaskConical className="w-3.5 h-3.5" />
              JEE / NEET / GATE Physics & Chemistry Sandbox
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Interactive Virtual STEM Laboratory
            </h1>
            <p className="text-sm text-slate-300">
              Directly manipulate physical parameters, observe real-time ray optics, projectile vectors, AC phasor resonance, and chemical equivalence titration curves.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 text-sky-300">
              <Atom className="w-4 h-4 text-sky-400 animate-spin" /> High-Fidelity Physics Engine
            </span>
          </div>
        </div>
      </div>

      {/* Lab Module Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
        {[
          { id: 'ray-optics', label: '🔬 Ray Optics & Thin Lenses', icon: Atom },
          { id: 'projectile', label: '🚀 Projectile Trajectory & Vectors', icon: Activity },
          { id: 'rlc-circuit', label: '⚡ AC RLC Circuit & Resonance', icon: Zap },
          { id: 'titration', label: '🧪 Acid-Base Titration & pH Curve', icon: FlaskConical },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeLabTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveLabTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ================= 1. RAY OPTICS LAB ================= */}
      {activeLabTab === 'ray-optics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-slate-950 rounded-2xl p-4 border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center min-h-[420px]">
            <canvas
              ref={opticsCanvasRef}
              width={720}
              height={380}
              className="w-full h-auto max-w-full rounded-xl bg-slate-900/60"
            />
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs border border-slate-700/60 px-3 py-1.5 rounded-lg text-[11px] text-slate-300 space-y-0.5">
              <div>Lens Formula: <span className="font-mono text-sky-400">1/f = 1/v - 1/u</span></div>
              <div>Magnification: <span className="font-mono text-amber-400">m = v / u = {magnification.toFixed(2)}x</span></div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-500" /> Optics Parameters
            </h3>

            {/* Lens Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Lens Curvature</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLensType('convex')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    lensType === 'convex'
                      ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Convex (Converging)
                </button>
                <button
                  onClick={() => setLensType('concave')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    lensType === 'concave'
                      ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Concave (Diverging)
                </button>
              </div>
            </div>

            {/* Focal Length Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-400">Focal Length (f):</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">{focalLength} cm</span>
              </div>
              <input
                type="range"
                min="50"
                max="160"
                value={focalLength}
                onChange={(e) => setFocalLength(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            {/* Object Distance Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-400">Object Distance (u):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{objectDistance} cm</span>
              </div>
              <input
                type="range"
                min="60"
                max="320"
                value={objectDistance}
                onChange={(e) => setObjectDistance(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Computed Optical Stats */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl space-y-2 border border-slate-200/80 dark:border-slate-700 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Image Distance (v):</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {Math.abs(imageDistance) > 1000 ? 'At Infinity (Parallel)' : `${imageDistance.toFixed(1)} cm`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Image Nature:</span>
                <span className="font-bold text-amber-500">
                  {isReal ? 'Real & Inverted' : 'Virtual & Erect'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Magnification (m):</span>
                <span className="font-bold text-indigo-500">{magnification.toFixed(2)}x</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. PROJECTILE MOTION LAB ================= */}
      {activeLabTab === 'projectile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-slate-950 rounded-2xl p-4 border border-slate-800 relative flex flex-col items-center justify-center min-h-[420px]">
            <canvas
              ref={projCanvasRef}
              width={720}
              height={380}
              className="w-full h-auto max-w-full rounded-xl bg-slate-900/60"
            />
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs border border-slate-700/60 px-3 py-1.5 rounded-lg text-[11px] text-slate-300 space-y-0.5">
              <div>Range: <span className="font-mono text-emerald-400">R = {maxRange.toFixed(1)} m</span></div>
              <div>Max Height: <span className="font-mono text-sky-400">H = {maxHeight.toFixed(1)} m</span></div>
              <div>Time of Flight: <span className="font-mono text-amber-400">T = {timeOfFlight.toFixed(2)} s</span></div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" /> Launch Controls
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setProjTime(0);
                    setProjIsPlaying(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5" /> Fire
                </button>
                <button
                  onClick={() => {
                    setProjIsPlaying(false);
                    setProjTime(0);
                  }}
                  className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Speed Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-400">Initial Velocity (u):</span>
                <span className="font-bold text-emerald-600">{projSpeed} m/s</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={projSpeed}
                onChange={(e) => {
                  setProjSpeed(Number(e.target.value));
                  setProjTime(0);
                }}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Angle Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-400">Launch Angle (θ):</span>
                <span className="font-bold text-sky-600">{projAngle}°</span>
              </div>
              <input
                type="range"
                min="15"
                max="85"
                value={projAngle}
                onChange={(e) => {
                  setProjAngle(Number(e.target.value));
                  setProjTime(0);
                }}
                className="w-full accent-sky-500"
              />
            </div>

            {/* Gravity Planet Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Gravitational Acceleration (g)</label>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                {[
                  { label: 'Earth (9.8)', g: 9.8 },
                  { label: 'Moon (1.6)', g: 1.6 },
                  { label: 'Mars (3.7)', g: 3.7 },
                ].map((planet) => (
                  <button
                    key={planet.label}
                    onClick={() => {
                      setProjGravity(planet.g);
                      setProjTime(0);
                    }}
                    className={`py-1.5 rounded-lg border font-semibold ${
                      projGravity === planet.g
                        ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {planet.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. RLC CIRCUIT & RESONANCE LAB ================= */}
      {activeLabTab === 'rlc-circuit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Series RLC Circuit & Phasor Analysis
            </h3>

            {/* Interactive Phasor Diagram Visualizer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs text-slate-500">Inductive Reactance (X_L)</span>
                <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {xl.toFixed(2)} Ω
                </div>
                <span className="text-[10px] text-slate-400">ωL = 2πfL</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs text-slate-500">Capacitive Reactance (X_C)</span>
                <div className="text-xl font-extrabold text-sky-600 dark:text-sky-400">
                  {xc.toFixed(2)} Ω
                </div>
                <span className="text-[10px] text-slate-400">1 / (ωC)</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs text-slate-500">Total Impedance (Z)</span>
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {impedanceZ.toFixed(2)} Ω
                </div>
                <span className="text-[10px] text-slate-400">√(R² + (X_L - X_C)²)</span>
              </div>
            </div>

            {/* Resonance Alert Banner */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              Math.abs(rlcFrequency - resonantFreq) < 2
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              <div>
                <span className="text-xs font-bold block uppercase tracking-wider">
                  {Math.abs(rlcFrequency - resonantFreq) < 2 ? '⚡ RESONANCE ACHIEVED!' : 'Resonant Frequency (f₀)'}
                </span>
                <span className="text-sm font-semibold">
                  f₀ = 1 / (2π√LC) = <span className="text-amber-500 font-bold">{resonantFreq.toFixed(2)} Hz</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">RMS Current</span>
                <span className="text-lg font-bold text-sky-500">{currentRMS.toFixed(2)} A</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Circuit Components</h3>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>Resistance (R):</span>
                <span className="font-bold text-indigo-500">{rlcResistance} Ω</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={rlcResistance}
                onChange={(e) => setRlcResistance(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>Inductance (L):</span>
                <span className="font-bold text-amber-500">{rlcInductance} H</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.5"
                step="0.01"
                value={rlcInductance}
                onChange={(e) => setRlcInductance(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>Capacitance (C):</span>
                <span className="font-bold text-sky-500">{rlcCapacitance} µF</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={rlcCapacitance}
                onChange={(e) => setRlcCapacitance(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>AC Frequency (f):</span>
                <span className="font-bold text-emerald-500">{rlcFrequency} Hz</span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                value={rlcFrequency}
                onChange={(e) => setRlcFrequency(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. TITRATION & PH LAB ================= */}
      {activeLabTab === 'titration' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 flex flex-col items-center justify-center">
            {/* Flask Visualizer */}
            <div className="relative w-48 h-64 flex flex-col items-center justify-end">
              {/* Burette Tip */}
              <div className="absolute top-0 w-4 h-16 bg-slate-300 dark:bg-slate-700 rounded-b-md flex items-end justify-center">
                {titrantAdded > 0 && titrantAdded < 50 && (
                  <div className="w-1.5 h-6 bg-sky-400 animate-pulse rounded-full" />
                )}
              </div>

              {/* Erlenmeyer Flask */}
              <div
                className="w-40 h-44 border-4 border-slate-400 dark:border-slate-600 rounded-b-3xl rounded-t-lg transition-colors duration-500 flex items-end justify-center p-3"
                style={{ backgroundColor: getIndicatorColor() }}
              >
                <div className="text-center font-bold text-slate-800 text-xs bg-white/70 px-2 py-1 rounded-md backdrop-blur-xs">
                  pH: {currentPH.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Flask Mixture</span>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {acidVolume} mL of {acidConc}M HCl + {titrantAdded.toFixed(1)} mL of {baseConc}M NaOH
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-pink-500" /> Titration Controls
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">pH Indicator</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'phenolphthalein', label: 'Phenolphthalein' },
                  { id: 'methyl-orange', label: 'Methyl Orange' },
                  { id: 'bromothymol', label: 'Bromothymol Blue' },
                ].map((ind) => (
                  <button
                    key={ind.id}
                    onClick={() => setIndicator(ind.id as any)}
                    className={`py-2 rounded-xl text-[11px] font-bold border transition-colors ${
                      indicator === ind.id
                        ? 'bg-pink-500/10 border-pink-500 text-pink-600 dark:text-pink-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Titrant Added Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>Burette Titrant Added (NaOH):</span>
                <span className="font-bold text-pink-600">{titrantAdded.toFixed(1)} mL</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={titrantAdded}
                onChange={(e) => setTitrantAdded(Number(e.target.value))}
                className="w-full accent-pink-500"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Equivalence Point:</span>
                <span className="font-bold text-emerald-500">25.0 mL NaOH (pH 7.0)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Region:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentPH < 6.8 ? 'Acidic Excess' : currentPH > 7.2 ? 'Basic Excess' : 'Equivalence Neutral'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
