'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, ResponsiveContainer,
} from 'recharts';

/* ═══════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════ */

function useTypewriter(
  lines: { text: string; color: string }[],
  charDelay = 32,
  lineDelay = 600,
) {
  const [displayed, setDisplayed] = useState<{ text: string; color: string }[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (currentLine >= lines.length) { setDone(true); return; }
    const line = lines[currentLine];
    if (currentChar === 0) setDisplayed((p) => [...p, { text: '', color: line.color }]);

    if (currentChar < line.text.length) {
      const t = setTimeout(() => {
        setDisplayed((p) => {
          const n = [...p];
          n[n.length - 1] = { text: line.text.slice(0, currentChar + 1), color: line.color };
          return n;
        });
        setCurrentChar((c) => c + 1);
      }, charDelay);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => { setCurrentLine((l) => l + 1); setCurrentChar(0); }, lineDelay);
      return () => clearTimeout(t);
    }
  }, [currentLine, currentChar, lines, charDelay, lineDelay]);

  return { displayed, done };
}

function useLiveCounter(base: number, increment: number, interval = 2000) {
  const [value, setValue] = useState(base);
  useEffect(() => {
    const t = setInterval(() => {
      setValue((v) => v + Math.floor(Math.random() * increment) + 1);
    }, interval);
    return () => clearInterval(t);
  }, [increment, interval]);
  return value;
}

function useAnimatedRisk(target: number, isVisible: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let frame: number;
    const start = performance.now();
    const dur = 1200;
    const animate = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setVal(Math.round(p * target));
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, isVisible]);
  return val;
}

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const terminalLines: { text: string; color: string }[] = [
  { text: '> scanning bangalore job market...', color: '#71717a' },
  { text: '> junior_sde roles: ████████░░ -34% in 90 days', color: '#00e5a0' },
  { text: '> profiles_competing: 4,247 for 340 openings', color: '#00e5a0' },
  { text: '> your_risk_score: calculating...', color: '#00e5a0' },
  { text: '> WARNING: automation_probability = 71%', color: '#f5623a' },
  { text: '> recommended_action: FORGE your next identity', color: '#f5623a' },
];

const tickerItems = [
  { text: '[⚠] Junior SDE -34% Bangalore 90d', type: 'alert' as const },
  { text: '[▲] ML Ops Engineer +89% YoY demand', type: 'positive' as const },
  { text: '[⚠] 4,247 profiles competing for 340 openings', type: 'alert' as const },
  { text: '[▲] Data Engineer salaries +₹4.2L avg increase', type: 'positive' as const },
  { text: '[⚠] IT Services hiring freeze extended Q2 2026', type: 'alert' as const },
  { text: '[▲] Cloud roles: 92% YoY growth', type: 'positive' as const },
  { text: '[⚠] Your automation risk: 71% — act now', type: 'alert' as const },
  { text: '[▲] Python+AWS profiles 3x more hireable', type: 'positive' as const },
];

const sparklineData = [
  { v: 35 }, { v: 38 }, { v: 37 }, { v: 42 }, { v: 40 }, { v: 46 },
  { v: 44 }, { v: 50 }, { v: 48 }, { v: 55 }, { v: 53 }, { v: 60 },
  { v: 58 }, { v: 65 }, { v: 63 }, { v: 71 },
];

const threatRows = [
  { role: 'Junior SDE', city: 'Bangalore', risk: 71, riskColor: '#ef4444', profiles: '4,247', pivot: 'ML Ops Engineer' },
  { role: 'Data Analyst', city: 'Hyderabad', risk: 54, riskColor: '#f5c542', profiles: '2,891', pivot: 'Data Engineer' },
  { role: 'BPO Support', city: 'Mumbai', risk: 89, riskColor: '#ef4444', profiles: '8,432', pivot: 'Customer Success Tech' },
  { role: 'QA Engineer', city: 'Pune', risk: 61, riskColor: '#f5c542', profiles: '3,102', pivot: 'SDET / Automation' },
  { role: 'Junior Accountant', city: 'Delhi', risk: 78, riskColor: '#ef4444', profiles: '5,671', pivot: 'FP&A Analyst' },
];

const cities = ['Bangalore', 'Hyderabad', 'Pune', 'Delhi', 'Mumbai', 'Chennai'];

const signalData = [
  { m: 'Jan 24', v: 72 }, { m: 'Feb', v: 74 }, { m: 'Mar', v: 69 }, { m: 'Apr', v: 71 },
  { m: 'May', v: 65 }, { m: 'Jun', v: 58 }, { m: 'Jul', v: 52 }, { m: 'Aug', v: 48 },
  { m: 'Sep', v: 44 }, { m: 'Oct', v: 46 }, { m: 'Nov', v: 50 }, { m: 'Dec', v: 47 },
  { m: 'Jan 25', v: 42 }, { m: 'Feb', v: 38 }, { m: 'Mar', v: 41 }, { m: 'Apr', v: 45 },
  { m: 'May', v: 40 }, { m: 'Jun', v: 36 }, { m: 'Jul', v: 33 }, { m: 'Aug', v: 37 },
  { m: 'Sep', v: 35 }, { m: 'Oct', v: 32 }, { m: 'Nov', v: 29 }, { m: 'Dec 25', v: 31 },
];

/* ═══════════════════════════════════════════
   CANVAS DOT GRID (Layer 1)
   ═══════════════════════════════════════════ */

function DotGridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const spacing = 32;
    const baseAlpha = 0.08;
    const glowRadius = 180;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouse = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouse);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cols = Math.ceil(canvas.width / spacing) + 1;
      const rows = Math.ceil(canvas.height / spacing) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing;
          const y = r * spacing;
          const dx = x - mouse.current.x;
          const dy = y - mouse.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let alpha = baseAlpha;
          if (dist < glowRadius) {
            const glow = 1 - dist / glowRadius;
            alpha = baseAlpha + glow * 0.2;
          }

          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          if (dist < glowRadius) {
            const glow = 1 - dist / glowRadius;
            ctx.fillStyle = `rgba(245, 98, 58, ${alpha})`;
            if (glow > 0.5) {
              ctx.shadowBlur = 6;
              ctx.shadowColor = `rgba(245, 98, 58, ${glow * 0.3})`;
            }
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.shadowBlur = 0;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="dot-grid-canvas" />;
}

/* ═══════════════════════════════════════════
   DATA PROCESSING BAR
   ═══════════════════════════════════════════ */

function DataProcessingBar() {
  const [records, setRecords] = useState(847291);

  useEffect(() => {
    const t = setInterval(() => {
      setRecords((v) => v + Math.floor(Math.random() * 120) + 30);
    }, 100);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="data-processing-bar flex items-center gap-3 px-4 py-2 rounded" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #1a1a2e', fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: '#3f3f46' }}>
      <span style={{ color: '#52525b' }}>PROCESSING:</span>
      <span style={{ color: '#f5623a', letterSpacing: '0.02em' }}>████████░░</span>
      <span style={{ color: '#52525b' }}>{records.toLocaleString()} records analyzed</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   GLITCH HEADLINE
   ═══════════════════════════════════════════ */

function GlitchHeadline({ show }: { show: boolean }) {
  const words = ['Your', 'job', 'is', 'already', 'being', 'replaced'];
  if (!show) return null;
  return (
    <h1 style={{
      fontFamily: 'var(--font-syne)', fontWeight: 900,
      fontSize: 'clamp(2.8rem, 5.5vw, 5.2rem)',
      lineHeight: 1.0, letterSpacing: '-0.035em', color: '#e4e4e7',
    }}>
      {words.map((w, i) => (
        <span key={i}>
          <span
            className="glitch-word"
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            {w}
          </span>
          {i === 1 || i === 3 ? <br /> : ' '}
        </span>
      ))}
      <span className="glitch-word" style={{ animationDelay: '0.72s', color: '#f5623a' }}>.</span>
    </h1>
  );
}

/* ═══════════════════════════════════════════
   LIVE JITTER GAUGE
   ═══════════════════════════════════════════ */

function LiveGaugeSVG({ baseScore, size = 160 }: { baseScore: number; size?: number }) {
  const [jitter, setJitter] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setJitter((Math.random() - 0.5) * 4); // ±2%
    }, 800);
    return () => clearInterval(t);
  }, []);

  const score = baseScore + jitter;
  const r = size * 0.38;
  const sw = size * 0.06;
  const cx = size / 2;
  const cy = size * 0.52;
  const startA = -210;
  const endA = 30;
  const total = endA - startA;
  const scoreA = startA + (score / 100) * total;

  const ptc = useCallback((a: number) => {
    const rad = (a * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }, [cx, cy, r]);

  const arc = useCallback((s: number, e: number) => {
    const a = ptc(s), b = ptc(e);
    return `M ${a.x} ${a.y} A ${r} ${r} 0 ${Math.abs(e - s) > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
  }, [ptc, r]);

  const greenEnd = startA + 0.3 * total;
  const yellowEnd = startA + 0.6 * total;
  const np = ptc(scoreA);

  return (
    <svg width={size} height={size * 0.58} viewBox={`0 0 ${size} ${size * 0.58}`}>
      <path d={arc(startA, greenEnd)} fill="none" stroke="#00e5a0" strokeWidth={sw} strokeLinecap="round" opacity={0.15} />
      <path d={arc(greenEnd, yellowEnd)} fill="none" stroke="#f5c542" strokeWidth={sw} strokeLinecap="round" opacity={0.15} />
      <path d={arc(yellowEnd, endA)} fill="none" stroke="#ef4444" strokeWidth={sw} strokeLinecap="round" opacity={0.15} />
      <path d={arc(startA, scoreA)} fill="none" stroke="#ef4444" strokeWidth={sw} strokeLinecap="round" style={{ transition: 'all 0.4s ease' }} />
      <line x1={cx} y1={cy} x2={np.x} y2={np.y} stroke="#e4e4e7" strokeWidth={1.5} strokeLinecap="round" style={{ transition: 'all 0.4s ease' }} />
      <circle cx={cx} cy={cy} r={3} fill="#e4e4e7" />
      <text x={cx} y={cy + size * 0.16} textAnchor="middle" fill="#ef4444" fontSize={size * 0.12} fontWeight="800" fontFamily="var(--font-dm-mono)">
        {Math.round(score)}%
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════
   PREVIEW CARDS (3 distinct)
   ═══════════════════════════════════════════ */

function RiskCard() {
  const metrics = [
    { label: 'Automation Risk', value: '71%', color: '#ef4444', dot: '#ef4444' },
    { label: 'Market Demand', value: '43/100', color: '#f5943a', dot: '#f5943a' },
    { label: 'Transferable Skills', value: '6/12', color: '#00e5a0', dot: '#00e5a0' },
  ];

  return (
    <div className="rotating-border" style={{ width: 320 }}>
      <div className="rounded-[14px] p-5 relative" style={{ background: 'rgba(8, 9, 13, 0.92)', backdropFilter: 'blur(20px)', width: '100%' }}>
        <div className="card-scanlines" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: '#71717a', fontFamily: 'var(--font-dm-mono)' }}>Risk Report</span>
          <span className="flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded" style={{ background: 'rgba(0, 229, 160, 0.08)', color: '#00e5a0', fontFamily: 'var(--font-dm-mono)' }}>
            <span className="w-1.5 h-1.5 rounded-full pulse-dot-green" style={{ background: '#00e5a0' }} />LIVE
          </span>
        </div>
        <div className="flex justify-center mb-3">
          <LiveGaugeSVG baseScore={71} size={160} />
        </div>
        <div className="space-y-3">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: m.dot }} />
                <span className="text-[11px]" style={{ color: '#71717a' }}>{m.label}</span>
              </div>
              <span className="text-[11px] font-bold" style={{ color: m.color, fontFamily: 'var(--font-dm-mono)' }}>{m.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid #1a1a2e' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] uppercase tracking-wider" style={{ color: '#71717a' }}>Risk Trend 12mo</span>
            <span className="text-[9px]" style={{ color: '#ef4444', fontFamily: 'var(--font-dm-mono)' }}>+12% ▲</span>
          </div>
          <ResponsiveContainer width="100%" height={36}>
            <LineChart data={sparklineData}><Line type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={1.5} dot={false} /></LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function PivotMatrixCard() {
  const pivots = [
    { from: 'Junior SDE', to: 'ML Ops Eng.', match: '87%' },
    { from: 'Data Analyst', to: 'Data Eng.', match: '72%' },
    { from: 'QA Engineer', to: 'SDET', match: '91%' },
  ];
  return (
    <div style={{ width: 320 }} className="rounded-[14px] p-5 relative" >
      <div style={{ background: 'rgba(8, 9, 13, 0.92)', backdropFilter: 'blur(20px)', borderRadius: '14px', padding: '20px', border: '1px solid #1a1a2e' }}>
        <div className="card-scanlines" style={{ borderRadius: '14px' }} />
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: '#71717a', fontFamily: 'var(--font-dm-mono)' }}>Pivot Matrix</span>
          <span className="text-[9px] px-2 py-0.5 rounded" style={{ background: 'rgba(58,123,253,0.08)', color: '#3a7bfd', fontFamily: 'var(--font-dm-mono)' }}>ANALYSIS</span>
        </div>
        <div className="space-y-3">
          {pivots.map((p) => (
            <div key={p.from} className="flex items-center justify-between text-[10px]" style={{ fontFamily: 'var(--font-dm-mono)' }}>
              <span style={{ color: '#71717a' }}>{p.from}</span>
              <span style={{ color: '#3f3f46' }}>→</span>
              <span style={{ color: '#a1a1aa' }}>{p.to}</span>
              <span style={{ color: '#00e5a0', fontWeight: 700 }}>{p.match}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2" style={{ borderTop: '1px solid #1a1a2e' }}>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#3a7bfd' }} />
            <span className="text-[9px]" style={{ color: '#3f3f46', fontFamily: 'var(--font-dm-mono)' }}>3 viable pivots identified</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobsListCard() {
  const jobs = [
    { title: 'ML Ops Engineer', co: 'Razorpay', salary: '₹28-35L' },
    { title: 'Data Engineer', co: 'Flipkart', salary: '₹24-32L' },
    { title: 'Cloud Architect', co: 'Atlassian', salary: '₹40-55L' },
  ];
  return (
    <div style={{ width: 320 }} className="rounded-[14px] p-5 relative">
      <div style={{ background: 'rgba(8, 9, 13, 0.92)', backdropFilter: 'blur(20px)', borderRadius: '14px', padding: '20px', border: '1px solid #1a1a2e' }}>
        <div className="card-scanlines" style={{ borderRadius: '14px' }} />
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: '#71717a', fontFamily: 'var(--font-dm-mono)' }}>Target Roles</span>
          <span className="text-[9px] px-2 py-0.5 rounded" style={{ background: 'rgba(0,229,160,0.08)', color: '#00e5a0', fontFamily: 'var(--font-dm-mono)' }}>3 MATCHES</span>
        </div>
        <div className="space-y-3">
          {jobs.map((j) => (
            <div key={j.title} className="flex items-center justify-between text-[10px]" style={{ fontFamily: 'var(--font-dm-mono)' }}>
              <div>
                <div style={{ color: '#e4e4e7', fontWeight: 500 }}>{j.title}</div>
                <div style={{ color: '#3f3f46', fontSize: '9px' }}>{j.co}</div>
              </div>
              <span style={{ color: '#00e5a0' }}>{j.salary}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CONNECTION LINE (SVG dashed)
   ═══════════════════════════════════════════ */

function ConnectionLine() {
  return (
    <svg className="hidden lg:block absolute z-20 pointer-events-none" style={{ top: '35%', left: '56%', width: '100px', height: '40px' }}>
      <line x1="0" y1="20" x2="100" y2="20" stroke="#f5623a" strokeWidth="1" strokeDasharray="6 4" opacity="0.25" style={{ animation: 'dash-flow 1s linear infinite' }} />
      <circle cx="100" cy="20" r="3" fill="#f5623a" opacity="0.3" />
      <circle cx="0" cy="20" r="3" fill="#00e5a0" opacity="0.3" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   THREAT ROW WITH ANIMATED RISK
   ═══════════════════════════════════════════ */

function ThreatRow({ row, index }: { row: typeof threatRows[0]; index: number }) {
  const ref = useRef<HTMLTableRowElement>(null);
  const isVis = useInView(ref, { once: true });
  const animatedRisk = useAnimatedRisk(row.risk, isVis);

  return (
    <motion.tr
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <td style={{ color: '#e4e4e7', fontWeight: 500 }}>{row.role}</td>
      <td>{row.city}</td>
      <td>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: row.riskColor }} />
          <span style={{ color: row.riskColor, fontWeight: 700 }}>{animatedRisk}%</span>
        </span>
      </td>
      <td style={{ color: '#e4e4e7' }}>{row.profiles}</td>
      <td style={{ color: '#00e5a0' }}>{row.pivot}</td>
    </motion.tr>
  );
}

/* ═══════════════════════════════════════════
   MATRIX RAIN (Footer)
   ═══════════════════════════════════════════ */

function MatrixRain() {
  const cols = useMemo(() => {
    const chars = 'FORGEABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    const columns: { chars: string; left: number; speed: number; delay: number }[] = [];
    const count = typeof window !== 'undefined' ? Math.floor(window.innerWidth / 16) : 60;
    for (let i = 0; i < count; i++) {
      let str = '';
      for (let j = 0; j < 20; j++) str += chars[Math.floor(Math.random() * chars.length)] + '\n';
      columns.push({
        chars: str,
        left: i * 16,
        speed: 4 + Math.random() * 6,
        delay: Math.random() * -10,
      });
    }
    return columns;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.6 }}>
      {cols.map((col, i) => (
        <div
          key={i}
          className="matrix-col"
          style={{
            left: col.left,
            animationDuration: `${col.speed}s`,
            animationDelay: `${col.delay}s`,
          }}
        >
          {col.chars}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function Home() {
  const { displayed, done } = useTypewriter(terminalLines, 28, 550);
  const [showPrompt, setShowPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showHeadline, setShowHeadline] = useState(false);
  const [signalPulse, setSignalPulse] = useState(31);

  const profilesScanned = useLiveCounter(2847291, 47);
  const threatsDetected = useLiveCounter(1923847, 23);
  const pivotsCalculated = useLiveCounter(847293, 12);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (done) {
      const t = setTimeout(() => setShowPrompt(true), 500);
      return () => clearTimeout(t);
    }
  }, [done]);
  useEffect(() => {
    const t = setTimeout(() => setShowHeadline(true), 4800);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setSignalPulse(29 + Math.floor(Math.random() * 6)), 3000);
    return () => clearInterval(t);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#08090d' }}>
      {/* ─── Background layers ─── */}
      <DotGridCanvas />
      <div className="atmo-glow atmo-glow--orange" />
      <div className="atmo-glow atmo-glow--blue" />
      <div className="diagonal-scanline" />
      <div className="vignette" />

      {/* ═══ NAVBAR ═══ */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-10 lg:px-16 py-3.5 flex items-center justify-between"
        style={{ background: 'rgba(8, 9, 13, 0.8)', backdropFilter: 'blur(12px)' }}
      >
        {/* Left — Status + Logo */}
        <div className="flex items-center gap-4">
          {/* System status */}
          <div className="hidden md:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00e5a0' }} />
            <span className="text-[10px] tracking-[0.08em]" style={{ fontFamily: 'var(--font-dm-mono)', color: '#3f3f46' }}>SYS.ONLINE</span>
          </div>
          <div className="hidden md:block w-px h-3" style={{ background: '#1a1a2e' }} />
          {/* Logo + sonar dot */}
          <div className="flex items-center gap-2.5">
            <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 900, fontSize: '1.1rem', color: '#f5623a', letterSpacing: '0.04em' }}>FORGE</span>
            <div className="sonar-dot">
              <div className="sonar-dot__inner" />
              <div className="sonar-dot__ring" />
              <div className="sonar-dot__ring sonar-dot__ring--delayed" />
            </div>
          </div>
        </div>

        {/* Center — Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'SYS.RISK', href: '/dashboard/risk' },
            { label: 'SYS.PIVOT', href: '/dashboard/pivot' },
            { label: 'SYS.JOBS', href: '/dashboard/jobs' },
            { label: 'SYS.RESUME', href: '/dashboard/resume' },
          ].map((n) => (
            <Link key={n.label} href={n.href} className="text-[11px] tracking-[0.12em] transition-colors hover:text-[#f5623a]" style={{ fontFamily: 'var(--font-dm-mono)', color: '#52525b' }}>
              {n.label}
            </Link>
          ))}
        </div>

        {/* Right — CTA */}
        <Link href="/dashboard/risk">
          <button className="cli-btn cursor-pointer px-4 py-2 text-[11px]" style={{ fontFamily: 'var(--font-dm-mono)', color: '#f5623a', background: 'transparent', border: '1px solid rgba(245, 98, 58, 0.3)', borderRadius: '4px', letterSpacing: '0.06em' }}>
            <span>[ ENTER TERMINAL ]</span>
          </button>
        </Link>

        {/* Gradient bottom border */}
        <div className="nav-gradient-border" />
      </motion.nav>

      {/* ═══ HERO ═══ */}
      <section className="relative z-10 min-h-screen flex items-start px-6 md:px-10 lg:px-16 pt-24 pb-12">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">

          {/* ── LEFT 60% ── */}
          <div className="w-full lg:w-[60%]">
            {/* Terminal session path */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05, duration: 0.3 }} className="mb-2">
              <span className="text-[10px]" style={{ fontFamily: 'var(--font-dm-mono)', color: '#27272a' }}>
                root@forge:~$ <span className="cursor-blink" style={{ color: '#00e5a0' }}>_</span>
              </span>
            </motion.div>

            {/* Live label */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.4 }} className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full cursor-blink" style={{ background: '#f5623a' }} />
              <span className="text-[10px] tracking-[0.12em]" style={{ fontFamily: 'var(--font-dm-mono)', color: '#f5623a' }}>
                // LIVE MARKET SCAN — BANGALORE — FEB 2026
              </span>
            </motion.div>

            {/* Terminal */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-lg overflow-hidden relative"
              style={{ border: '1px solid #1a1a2e', background: 'rgba(0, 0, 0, 0.5)', boxShadow: '0 0 30px rgba(0,229,160,0.06), inset 0 0 20px rgba(0,229,160,0.03)' }}
            >
              {/* Chrome bar */}
              <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.015)', borderBottom: '1px solid #1a1a2e' }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f5c542' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#00e5a0' }} />
                <span className="ml-4 text-[10px] tracking-wider" style={{ color: '#27272a', fontFamily: 'var(--font-dm-mono)' }}>forge --scan --market=IN --role=sde</span>
              </div>
              {/* Body */}
              <div className="relative p-5 min-h-[240px]" style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '13px', lineHeight: '2.1' }}>
                <div className="crt-lines" />
                {displayed.map((line, i) => (<div key={i} style={{ color: line.color }}>{line.text}</div>))}
                {!done && <span className="cursor-blink" style={{ color: '#00e5a0' }}>█</span>}
                {showPrompt && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="mt-2 pt-2" style={{ borderTop: '1px solid #1a1a2e' }}>
                    <span style={{ color: '#71717a' }}>&gt; ready to see your full report? </span>
                    <span style={{ color: '#00e5a0' }}>[Y/n]</span>
                    <span className="cursor-blink ml-0.5" style={{ color: '#00e5a0' }}>_</span>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Terminal reflection */}
            <div className="h-8 rounded-b-lg -mt-1 mx-2" style={{ background: 'linear-gradient(180deg, rgba(0,229,160,0.02) 0%, transparent 100%)' }} />

            {/* Data processing divider */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4, duration: 0.5 }} className="mt-3 mb-5">
              <DataProcessingBar />
            </motion.div>

            {/* Headline — glitch reveal */}
            <div className="mt-4">
              <GlitchHeadline show={showHeadline} />
            </div>

            {/* Sub-line */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: showHeadline ? 1 : 0, y: showHeadline ? 0 : 12 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-4"
              style={{
                fontFamily: 'var(--font-syne)', fontWeight: 600,
                fontSize: 'clamp(0.95rem, 1.8vw, 1.2rem)', color: '#f5623a',
                textShadow: '0 0 30px rgba(245, 98, 58, 0.2)',
              }}
            >
              The only question is whether you know it yet.
            </motion.p>

            {/* CTA row */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: showHeadline ? 1 : 0, y: showHeadline ? 0 : 10 }} transition={{ delay: 1.2, duration: 0.5 }} className="mt-6 flex items-center gap-5">
              <Link href="/dashboard/risk">
                <button className="cli-btn cursor-pointer px-6 py-3 text-sm" style={{ fontFamily: 'var(--font-dm-mono)', fontWeight: 500, color: '#71717a', background: 'transparent', border: '1px solid #27272a', borderRadius: '4px', letterSpacing: '0.04em' }}>
                  <span>[ run --full-analysis ]</span>
                </button>
              </Link>
              <Link href="/dashboard" className="text-xs transition-colors hover:text-[#f5623a]" style={{ color: '#3f3f46', fontFamily: 'var(--font-dm-mono)' }}>
                view live market data →
              </Link>
            </motion.div>
          </div>

          {/* ── RIGHT 40% — Card Stack + Connection ── */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-[40%] relative flex justify-center items-center min-h-[460px] overflow-hidden"
          >
            <ConnectionLine />
            {/* Back card 2 — Jobs List */}
            <div className="absolute" style={{ top: '20%', left: '4%', opacity: 0.5, transform: 'rotate(6deg) scale(0.88)' }}>
              <JobsListCard />
            </div>
            {/* Back card 1 — Pivot Matrix */}
            <div className="absolute" style={{ top: '16%', left: '8%', opacity: 0.65, transform: 'rotate(3deg) scale(0.94)' }}>
              <PivotMatrixCard />
            </div>
            {/* Main card — Risk Report */}
            <div className="relative float-card-stack z-10" style={{ animationDelay: '1.6s' }}>
              <RiskCard />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ LIVE COUNTERS ═══ */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: showHeadline ? 1 : 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="relative z-10 px-6 md:px-10 lg:px-16 pb-4 max-w-[1440px] mx-auto"
      >
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          {[
            { label: 'PROFILES.SCANNED', value: profilesScanned },
            { label: 'THREATS.DETECTED', value: threatsDetected },
            { label: 'PIVOTS.CALCULATED', value: pivotsCalculated },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-2" style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px' }}>
              <span style={{ color: '#27272a' }}>{c.label}:</span>
              <span style={{ color: '#3f3f46' }}>{c.value.toLocaleString()}</span>
              <span className="counter-arrow" style={{ color: '#f5623a', fontSize: '8px' }}>↑</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ═══ TICKER BAR ═══ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 overflow-hidden"
        style={{ borderTop: '1px solid rgba(245, 98, 58, 0.12)', borderBottom: '1px solid rgba(245, 98, 58, 0.12)', background: 'rgba(0, 0, 0, 0.4)', height: '48px' }}
      >
        <div className="flex items-center h-full">
          {/* Fixed left label */}
          <div className="hidden md:flex items-center gap-2 px-5 shrink-0 h-full" style={{ borderRight: '1px solid #1a1a2e' }}>
            <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#f5623a' }} />
            <span className="text-[9px] tracking-[0.14em] whitespace-nowrap" style={{ fontFamily: 'var(--font-dm-mono)', color: '#52525b' }}>◈ LIVE FEED</span>
          </div>
          {/* Scrolling ticker */}
          <div className="overflow-hidden flex-1 h-full flex items-center">
            <div className="ticker-track">
              {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
                <span key={i} className="whitespace-nowrap mx-6 text-[11px]" style={{ fontFamily: 'var(--font-dm-mono)', color: item.type === 'alert' ? '#f5623a' : '#00e5a0', letterSpacing: '0.02em' }}>
                  {item.text}
                  <span className="mx-5" style={{ color: '#1a1a2e' }}>│</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ WEAPONS SECTION ═══ */}
      <section className="relative z-10 px-6 md:px-10 lg:px-16 pt-12 pb-6 max-w-[1440px] mx-auto">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-[10px] uppercase tracking-[0.2em] mb-8" style={{ color: '#3f3f46', fontFamily: 'var(--font-dm-mono)' }}>
          sys.modules.loaded
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              num: '01', title: 'DIAGNOSE', bg: 'bars' as const,
              tags: ['REAL-TIME', 'DATA-DRIVEN'],
              line1: 'Real-time threat scoring against 4,200+ competing profiles.',
              line2: 'Know exactly which of your skills are becoming commodities.',
            },
            {
              num: '02', title: 'PIVOT', bg: 'nodes' as const,
              tags: ['PERSONALISED', 'ML-RANKED'],
              line1: 'AI-mapped career pivots ranked by market demand and your existing stack.',
              line2: 'Not generic advice. Calculated escape routes.',
            },
            {
              num: '03', title: 'STRIKE', bg: 'crosshair' as const,
              tags: ['LIVE DATA', 'GAP ANALYSIS'],
              line1: 'Targeted job intelligence with real salary data and gap analysis.',
              line2: 'Apply where the market is moving, not where it was.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="weapon-card p-6 relative group"
            >
              {/* Animated background */}
              {item.bg === 'bars' && (
                <div className="weapon-bg-bars">
                  <span /><span /><span /><span /><span />
                </div>
              )}
              {item.bg === 'nodes' && (
                <div className="weapon-bg-nodes">
                  <div className="node" /><div className="node" /><div className="node" /><div className="node" />
                </div>
              )}
              {item.bg === 'crosshair' && (
                <div className="weapon-bg-crosshair">
                  <div className="ring" />
                </div>
              )}

              {/* Background number */}
              <span className="absolute bottom-3 right-4 select-none pointer-events-none" style={{ fontFamily: 'var(--font-syne)', fontWeight: 900, fontSize: '7rem', lineHeight: 1, color: 'rgba(245, 98, 58, 0.04)' }}>
                {item.num}
              </span>

              <div className="relative z-[1]">
                <div className="flex gap-2 mb-4">
                  {item.tags.map((t) => (
                    <span key={t} className="text-[8px] px-2 py-0.5 tracking-[0.1em] rounded" style={{ fontFamily: 'var(--font-dm-mono)', color: '#52525b', border: '1px solid #1a1a2e' }}>{t}</span>
                  ))}
                </div>
                <h3 className="text-xl mb-3" style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, color: '#e4e4e7', letterSpacing: '0.06em' }}>{item.title}</h3>
                <p className="text-[13px] leading-relaxed mb-1" style={{ color: '#a1a1aa' }}>{item.line1}</p>
                <p className="text-[13px] leading-relaxed" style={{ color: '#52525b' }}>{item.line2}</p>
              </div>

              <motion.div className="absolute bottom-0 left-0 h-px" style={{ background: '#f5623a' }} initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: 0.3 + i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
            </motion.div>
          ))}
        </div>

        {/* 4th card — full-width market intelligence */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="weapon-card p-5 mt-5 relative group"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-[1]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] tracking-[0.12em]" style={{ fontFamily: 'var(--font-dm-mono)', color: '#f5623a' }}>◈ MARKET INTELLIGENCE ENGINE</span>
              </div>
              <p className="text-sm" style={{ color: '#a1a1aa' }}>
                Tracking 2.4M job postings across 6 cities. Updated every 6 hours.<br />
                <span style={{ color: '#52525b' }}>Your competition doesn&apos;t know this exists.</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {cities.map((c) => (
                <div key={c} className="flex items-center gap-1.5 px-3 py-1.5 rounded" style={{ border: '1px solid #1a1a2e' }}>
                  <span className="w-1.5 h-1.5 rounded-full pulse-dot-green" style={{ background: '#00e5a0' }} />
                  <span className="text-[10px] tracking-wider" style={{ fontFamily: 'var(--font-dm-mono)', color: '#71717a' }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
          <motion.div className="absolute bottom-0 left-0 h-px" style={{ background: '#f5623a' }} initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }} />
        </motion.div>
      </section>

      {/* ═══ SIGNAL STRENGTH — Full-bleed chart ═══ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="signal-strength-section relative z-10"
      >
        {/* Header overlays */}
        <div className="absolute top-3 left-4 z-10">
          <span className="text-[9px] tracking-[0.12em]" style={{ fontFamily: 'var(--font-dm-mono)', color: '#3f3f46' }}>
            JOB MARKET STABILITY INDEX — INDIA — 2024-2026
          </span>
        </div>
        <div className="absolute top-3 right-4 z-10 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#f5623a' }} />
          <span className="text-[11px] font-bold" style={{ fontFamily: 'var(--font-dm-mono)', color: '#f5623a' }}>{signalPulse}</span>
        </div>
        {/* Chart — zero padding, edge to edge */}
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={signalData} margin={{ top: 24, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="signalFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f5623a" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f5623a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke="#f5623a" strokeWidth={1.5} fill="url(#signalFill)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.section>

      {/* ═══ THREAT BOARD ═══ */}
      <section className="relative z-10 px-6 md:px-10 lg:px-16 pt-10 pb-8 max-w-[1440px] mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#ef4444' }} />
              <span className="text-[10px] tracking-[0.15em]" style={{ fontFamily: 'var(--font-dm-mono)', color: '#ef4444' }}>THREAT BOARD</span>
            </div>
            <span className="flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontFamily: 'var(--font-dm-mono)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444' }} />CLASSIFIED
            </span>
          </div>
          <p className="text-[11px]" style={{ fontFamily: 'var(--font-dm-mono)', color: '#3f3f46' }}>
            Live risk assessment across top Indian tech cities
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="threat-table-wrap rounded-lg"
          style={{ border: '1px solid #1a1a2e', background: 'rgba(0, 0, 0, 0.3)' }}
        >
          {/* Scanner line */}
          <div className="threat-table-scanner" />
          <div className="overflow-x-auto">
            <table className="threat-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>City</th>
                  <th>Risk</th>
                  <th>Profiles Competing</th>
                  <th>Recommended Pivot</th>
                </tr>
              </thead>
              <tbody>
                {threatRows.map((row, i) => (
                  <ThreatRow key={i} row={row} index={i} />
                ))}
                {/* YOUR PROFILE row */}
                <motion.tr
                  className="your-profile-row"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <td style={{ color: '#f5623a', fontWeight: 700 }}>YOUR PROFILE</td>
                  <td style={{ color: '#52525b' }}>—</td>
                  <td>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full cursor-blink" style={{ background: '#f5623a' }} />
                      <span style={{ color: '#f5623a', fontWeight: 700 }}>???</span>
                    </span>
                  </td>
                  <td style={{ color: '#52525b' }}>—</td>
                  <td>
                    <Link href="/dashboard/risk">
                      <button className="cli-btn cursor-pointer px-3 py-1 text-[10px]" style={{ fontFamily: 'var(--font-dm-mono)', color: '#f5623a', background: 'transparent', border: '1px solid rgba(245,98,58,0.3)', borderRadius: '3px' }}>
                        <span>[ CALCULATE NOW ]</span>
                      </button>
                    </Link>
                  </td>
                </motion.tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 overflow-hidden" style={{ background: 'rgba(0, 0, 0, 0.3)', borderTop: '1px solid #1a1a2e' }}>
        <div className="relative px-6 md:px-10 lg:px-16 pt-12 pb-8 max-w-[1440px] mx-auto">
          {/* Matrix rain behind wordmark */}
          <div className="absolute inset-0 overflow-hidden" style={{ maskImage: 'linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%)', WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%)' }}>
            <MatrixRain />
          </div>

          {/* Giant outlined wordmark */}
          <div className="relative flex justify-center mb-8 select-none pointer-events-none">
            <span style={{
              fontFamily: 'var(--font-syne)', fontWeight: 900,
              fontSize: 'clamp(8rem, 20vw, 14rem)', lineHeight: 0.85,
              color: 'transparent',
              WebkitTextStroke: '1px rgba(245, 98, 58, 0.08)',
              letterSpacing: '-0.04em',
            }}>
              FORGE
            </span>
          </div>

          <div className="relative">
            <p className="mb-2" style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)', color: '#f5623a' }}>
              Don&apos;t let AI replace you. You replace AI.
            </p>
            <p className="text-sm mb-6" style={{ color: '#3f3f46' }}>
              Built for the 24-year-old who refuses to become a statistic.
            </p>

            <div className="flex items-center gap-5 mb-8">
              <Link href="/dashboard/risk">
                <button className="cli-btn cursor-pointer px-5 py-2.5 text-xs" style={{ fontFamily: 'var(--font-dm-mono)', fontWeight: 500, color: '#71717a', background: 'transparent', border: '1px solid #27272a', borderRadius: '4px', letterSpacing: '0.04em' }}>
                  <span>[ run --full-analysis ]</span>
                </button>
              </Link>
              <Link href="/dashboard" className="text-xs transition-colors hover:text-[#f5623a]" style={{ color: '#3f3f46', fontFamily: 'var(--font-dm-mono)' }}>
                enter dashboard →
              </Link>
            </div>

            {/* System stats */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4" style={{ borderTop: '1px solid #1a1a2e' }}>
              {[
                'SYS.VERSION 1.0.0',
                'MARKET.COVERAGE 6 CITIES',
                'ROLES.TRACKED 2.4M',
                'LAST.UPDATED 6HRS AGO',
                'STATUS OPERATIONAL',
              ].map((s) => (
                <span key={s} className="text-[9px] tracking-[0.1em]" style={{ fontFamily: 'var(--font-dm-mono)', color: '#27272a' }}>
                  {s}
                </span>
              ))}
            </div>

            <p className="mt-4 text-[9px]" style={{ color: '#1a1a2e', fontFamily: 'var(--font-dm-mono)' }}>
              © 2026 FORGE · career intelligence terminal
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
