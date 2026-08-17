import React, { useState, useEffect, useRef } from 'react';
import {
  Binary,
  Maximize2,
  Minimize2,
  Sparkles,
  Play,
  RotateCcw,
  Calculator,
  TrendingUp,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface Props {
  activeExam: string;
}

const PRESET_FUNCTIONS = [
  { name: 'Standard Parabola', expr: 'x^2 - 4' },
  { name: 'Sine Wave Harmonic', expr: 'sin(x)' },
  { name: 'Gaussian Bell Curve', expr: 'exp(-x^2)' },
  { name: 'Logistic Sigmoid', expr: '1 / (1 + exp(-x))' },
  { name: 'Cubic with Extrema', expr: 'x^3 - 3*x' },
  { name: 'Damped Oscillation', expr: 'exp(-0.2*x) * sin(2*x)' },
  { name: 'Natural Logarithm', expr: 'log(x)' },
];

export const GraphingCalculatorModule: React.FC<Props> = ({ activeExam }) => {
  const [activeSubTab, setActiveSubTab] = useState<'plotter' | 'distribution' | 'matrix'>('plotter');

  // Plotter States
  const [funcExpr, setFuncExpr] = useState<string>('sin(x)');
  const [xMin, setXMin] = useState<number>(-10);
  const [xMax, setXMax] = useState<number>(10);
  const [yMin, setYMin] = useState<number>(-5);
  const [yMax, setYMax] = useState<number>(5);

  // Calculus states
  const [evalX, setEvalX] = useState<number>(2);
  const [intA, setIntA] = useState<number>(0);
  const [intB, setIntB] = useState<number>(Math.PI);
  const [calcResult, setCalcResult] = useState<{ fx: number; fprime: number; integral: number }>({
    fx: 0,
    fprime: 0,
    integral: 0,
  });

  // Normal Distribution states
  const [distMean, setDistMean] = useState<number>(100);
  const [distStd, setDistStd] = useState<number>(15);
  const [distZ1, setDistZ1] = useState<number>(85);
  const [distZ2, setDistZ2] = useState<number>(115);
  const [probResult, setProbResult] = useState<number>(0.6827);

  // Matrix states (2x2)
  const [matA, setMatA] = useState<number[][]>([
    [2, 3],
    [1, 4],
  ]);
  const [matB, setMatB] = useState<number[][]>([
    [1, 0],
    [2, 5],
  ]);
  const [matrixResult, setMatrixResult] = useState<{
    detA: number;
    traceA: number;
    product: number[][];
    invA: string;
  }>({
    detA: 5,
    traceA: 6,
    product: [
      [8, 15],
      [9, 20],
    ],
    invA: '[[0.8, -0.6], [-0.2, 0.4]]',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Safe Function Evaluator
  const evaluateF = (x: number, expr = funcExpr): number => {
    try {
      const sanitized = expr
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/exp/g, 'Math.exp')
        .replace(/log/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/\^/g, '**')
        .replace(/pi/gi, 'Math.PI')
        .replace(/e/gi, 'Math.E');

      const fn = new Function('x', `return ${sanitized};`);
      const val = fn(x);
      return typeof val === 'number' && !isNaN(val) ? val : 0;
    } catch (e) {
      return 0;
    }
  };

  // Numerical Calculus Engine
  const calculateCalculus = () => {
    const fx = evaluateF(evalX);
    const h = 0.0001;
    const fprime = (evaluateF(evalX + h) - evaluateF(evalX - h)) / (2 * h);

    // Simpson's rule integration
    const n = 200;
    const step = (intB - intA) / n;
    let sum = evaluateF(intA) + evaluateF(intB);
    for (let i = 1; i < n; i++) {
      const x = intA + i * step;
      sum += (i % 2 === 0 ? 2 : 4) * evaluateF(x);
    }
    const integral = (step / 3) * sum;

    setCalcResult({ fx, fprime, integral });
  };

  useEffect(() => {
    calculateCalculus();
    drawGraph();
  }, [funcExpr, xMin, xMax, yMin, yMax, evalX, intA, intB]);

  // Canvas Graph Renderer
  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    const height = (canvas.height = 360);

    ctx.clearRect(0, 0, width, height);

    // Coordinate mapping
    const toScreenX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toScreenY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Background Grid
    ctx.strokeStyle = '#33415522';
    ctx.lineWidth = 1;

    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 2) {
      ctx.beginPath();
      ctx.moveTo(toScreenX(x), 0);
      ctx.lineTo(toScreenX(x), height);
      ctx.stroke();
    }
    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += 2) {
      ctx.beginPath();
      ctx.moveTo(0, toScreenY(y));
      ctx.lineTo(width, toScreenY(y));
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;

    // X Axis
    if (yMin <= 0 && yMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(0, toScreenY(0));
      ctx.lineTo(width, toScreenY(0));
      ctx.stroke();
    }

    // Y Axis
    if (xMin <= 0 && xMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(toScreenX(0), 0);
      ctx.lineTo(toScreenX(0), height);
      ctx.stroke();
    }

    // Shade Integral Region if applicable
    if (intB > intA) {
      ctx.fillStyle = '#6366f125';
      ctx.beginPath();
      ctx.moveTo(toScreenX(intA), toScreenY(0));
      for (let x = intA; x <= intB; x += (intB - intA) / 100) {
        ctx.lineTo(toScreenX(x), toScreenY(evaluateF(x)));
      }
      ctx.lineTo(toScreenX(intB), toScreenY(0));
      ctx.closePath();
      ctx.fill();
    }

    // Plot Main Function
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();

    let started = false;
    const step = (xMax - xMin) / width;

    for (let px = 0; px <= width; px++) {
      const x = xMin + px * step;
      const y = evaluateF(x);

      if (isNaN(y) || !isFinite(y)) {
        started = false;
        continue;
      }

      const sy = toScreenY(y);
      if (!started) {
        ctx.moveTo(px, sy);
        started = true;
      } else {
        ctx.lineTo(px, sy);
      }
    }
    ctx.stroke();

    // Draw Evaluation Point Dot & Tangent Line
    const ptX = toScreenX(evalX);
    const ptY = toScreenY(calcResult.fx);

    // Tangent slope
    const tangentLength = 3;
    const x1 = evalX - tangentLength;
    const y1 = calcResult.fx - calcResult.fprime * tangentLength;
    const x2 = evalX + tangentLength;
    const y2 = calcResult.fx + calcResult.fprime * tangentLength;

    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(toScreenX(x1), toScreenY(y1));
    ctx.lineTo(toScreenX(x2), toScreenY(y2));
    ctx.stroke();
    ctx.setLineDash([]);

    // Point
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(ptX, ptY, 5, 0, 2 * Math.PI);
    ctx.fill();
  };

  // Normal Distribution Error Function
  const erf = (x: number) => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  };

  const calculateDistribution = () => {
    const z1 = (distZ1 - distMean) / (distStd * Math.SQRT2);
    const z2 = (distZ2 - distMean) / (distStd * Math.SQRT2);
    const p = 0.5 * (erf(z2) - erf(z1));
    setProbResult(Math.max(0, Math.min(1, p)));
  };

  // Matrix Calculations
  const calculateMatrixOps = () => {
    const det = matA[0][0] * matA[1][1] - matA[0][1] * matA[1][0];
    const trace = matA[0][0] + matA[1][1];

    const prod = [
      [
        matA[0][0] * matB[0][0] + matA[0][1] * matB[1][0],
        matA[0][0] * matB[0][1] + matA[0][1] * matB[1][1],
      ],
      [
        matA[1][0] * matB[0][0] + matA[1][1] * matB[1][0],
        matA[1][0] * matB[0][1] + matA[1][1] * matB[1][1],
      ],
    ];

    let invStr = 'Matrix is Singular (Det = 0)';
    if (det !== 0) {
      const inv00 = (matA[1][1] / det).toFixed(2);
      const inv01 = (-matA[0][1] / det).toFixed(2);
      const inv10 = (-matA[1][0] / det).toFixed(2);
      const inv11 = (matA[0][0] / det).toFixed(2);
      invStr = `[[${inv00}, ${inv01}], [${inv10}, ${inv11}]]`;
    }

    setMatrixResult({
      detA: det,
      traceA: trace,
      product: prod,
      invA: invStr,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-indigo-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-blue-200 mb-2">
              <Calculator className="w-3.5 h-3.5 text-blue-300" />
              <span>STEM & Advanced Quantitative Sandbox</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Interactive Graphing & Scientific Sandbox
            </h1>
            <p className="text-blue-200 text-sm mt-1 max-w-2xl">
              Real-time 2D function plotter, numerical calculus derivatives & definite integrals, Gaussian distributions, and matrix linear algebra for {activeExam}.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-2xl border border-blue-600/40">
            <button
              type="button"
              onClick={() => setActiveSubTab('plotter')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeSubTab === 'plotter' ? 'bg-indigo-600 text-white shadow-sm' : 'text-blue-200 hover:text-white'
              }`}
            >
              2D Plotter & Calculus
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('distribution')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeSubTab === 'distribution' ? 'bg-indigo-600 text-white shadow-sm' : 'text-blue-200 hover:text-white'
              }`}
            >
              Distributions (Stats)
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('matrix')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeSubTab === 'matrix' ? 'bg-indigo-600 text-white shadow-sm' : 'text-blue-200 hover:text-white'
              }`}
            >
              Matrix & Linear Algebra
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tab 1: 2D Graph Plotter & Numerical Calculus */}
      {activeSubTab === 'plotter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Canvas View (Col 1-8) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">f(x) =</span>
                  <input
                    type="text"
                    value={funcExpr}
                    onChange={(e) => setFuncExpr(e.target.value)}
                    placeholder="e.g. sin(x), x^2 - 4, exp(-x^2)"
                    className="flex-1 px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Preset Selector */}
                <select
                  onChange={(e) => setFuncExpr(e.target.value)}
                  className="w-full sm:w-auto text-xs px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold"
                >
                  <option value="">Presets...</option>
                  {PRESET_FUNCTIONS.map((p) => (
                    <option key={p.name} value={p.expr}>
                      {p.name} ({p.expr})
                    </option>
                  ))}
                </select>
              </div>

              {/* HTML5 Canvas */}
              <div className="bg-slate-950 rounded-2xl p-2 overflow-hidden border border-slate-800 flex justify-center">
                <canvas ref={canvasRef} className="w-full h-80 block" />
              </div>

              {/* Viewport Bounds Controls */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400">X-Min:</span>
                  <input
                    type="number"
                    value={xMin}
                    onChange={(e) => setXMin(parseFloat(e.target.value))}
                    className="w-16 p-1 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400">X-Max:</span>
                  <input
                    type="number"
                    value={xMax}
                    onChange={(e) => setXMax(parseFloat(e.target.value))}
                    className="w-16 p-1 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400">Y-Min:</span>
                  <input
                    type="number"
                    value={yMin}
                    onChange={(e) => setYMin(parseFloat(e.target.value))}
                    className="w-16 p-1 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400">Y-Max:</span>
                  <input
                    type="number"
                    value={yMax}
                    onChange={(e) => setYMax(parseFloat(e.target.value))}
                    className="w-16 p-1 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Calculus Calculator Panel (Col 9-12) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Derivative / Evaluation Point */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                <TrendingUp className="w-4 h-4" />
                <span>Tangent & Instantaneous Rate f&apos;(x)</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Evaluate at x =</span>
                  <input
                    type="number"
                    step="0.5"
                    value={evalX}
                    onChange={(e) => setEvalX(parseFloat(e.target.value))}
                    className="w-20 px-2 py-1 text-xs font-mono bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">f({evalX}) =</span>
                    <span className="font-bold text-indigo-600">{calcResult.fx.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Slope f&apos;({evalX}) =</span>
                    <span className="font-bold text-rose-500">{calcResult.fprime.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Definite Integral Calculator */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                <Activity className="w-4 h-4" />
                <span>Definite Integral ∫ f(x) dx</span>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Lower Bound (a)</label>
                    <input
                      type="number"
                      value={intA}
                      onChange={(e) => setIntA(parseFloat(e.target.value))}
                      className="w-full px-2 py-1 text-xs font-mono bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Upper Bound (b)</label>
                    <input
                      type="number"
                      value={intB}
                      onChange={(e) => setIntB(parseFloat(e.target.value))}
                      className="w-full px-2 py-1 text-xs font-mono bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/50 dark:border-indigo-900/50 flex items-center justify-between font-mono text-xs">
                  <span className="text-indigo-900 dark:text-indigo-300">Area under curve:</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                    {calcResult.integral.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Probability & Normal Distribution Gaussian Engine */}
      {activeSubTab === 'distribution' && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <Activity className="w-5 h-5" />
            <span>Gaussian Normal Distribution P(Z1 ≤ X ≤ Z2)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                Mean (μ)
              </label>
              <input
                type="number"
                value={distMean}
                onChange={(e) => {
                  setDistMean(parseFloat(e.target.value));
                  calculateDistribution();
                }}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                Std Dev (σ)
              </label>
              <input
                type="number"
                value={distStd}
                onChange={(e) => {
                  setDistStd(parseFloat(e.target.value));
                  calculateDistribution();
                }}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                Lower Limit (X₁)
              </label>
              <input
                type="number"
                value={distZ1}
                onChange={(e) => {
                  setDistZ1(parseFloat(e.target.value));
                  calculateDistribution();
                }}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                Upper Limit (X₂)
              </label>
              <input
                type="number"
                value={distZ2}
                onChange={(e) => {
                  setDistZ2(parseFloat(e.target.value));
                  calculateDistribution();
                }}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 block mb-1">
                Probability Density Area:
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Calculated Z-Scores: Z₁ = {((distZ1 - distMean) / distStd).toFixed(2)}, Z₂ = {((distZ2 - distMean) / distStd).toFixed(2)}
              </p>
            </div>
            <div className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">
              {(probResult * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Matrix Linear Algebra Suite */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <Layers className="w-5 h-5" />
            <span>2×2 Matrix Suite (Determinants, Inverses, Products)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Matrix A */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Matrix A</span>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1].map((r) =>
                  [0, 1].map((c) => (
                    <input
                      key={`a-${r}-${c}`}
                      type="number"
                      value={matA[r][c]}
                      onChange={(e) => {
                        const next = [...matA.map((row) => [...row])];
                        next[r][c] = parseFloat(e.target.value) || 0;
                        setMatA(next);
                      }}
                      className="p-2 text-center text-xs font-mono font-bold bg-white dark:bg-slate-900 border rounded-xl"
                    />
                  ))
                )}
              </div>
            </div>

            {/* Matrix B */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Matrix B</span>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1].map((r) =>
                  [0, 1].map((c) => (
                    <input
                      key={`b-${r}-${c}`}
                      type="number"
                      value={matB[r][c]}
                      onChange={(e) => {
                        const next = [...matB.map((row) => [...row])];
                        next[r][c] = parseFloat(e.target.value) || 0;
                        setMatB(next);
                      }}
                      className="p-2 text-center text-xs font-mono font-bold bg-white dark:bg-slate-900 border rounded-xl"
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={calculateMatrixOps}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow"
          >
            Compute Matrix Operations
          </button>

          {/* Results Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border font-mono text-xs">
              <span className="text-slate-400 block mb-1">Determinant |A|</span>
              <span className="text-lg font-bold text-indigo-600">{matrixResult.detA}</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border font-mono text-xs">
              <span className="text-slate-400 block mb-1">Trace Tr(A)</span>
              <span className="text-lg font-bold text-indigo-600">{matrixResult.traceA}</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border font-mono text-xs">
              <span className="text-slate-400 block mb-1">Inverse A⁻¹</span>
              <span className="text-xs font-bold text-emerald-600">{matrixResult.invA}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
