'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import * as d3 from 'd3';
import { Upload } from 'lucide-react';
import {
  tickerItems as defaultTickerItems,
  careerValueData, roleDemandIndex, hiringCalendar, newsTicker,
} from '@/lib/mockData';

// ─── ANALYSIS RESULT TYPE ───
interface AnalysisResult {
  personal: {
    name: string;
    current_role: string;
    city: string;
    experience_years: number;
    current_salary_estimate: string;
  };
  risk_metrics: {
    overall_risk_score: number;
    risk_level: string;
    timeline_months: number;
    market_demand_score: number;
    transferable_skills_count: number;
    competing_profiles_estimate: number;
    demand_ratio: number;
  };
  skill_analysis: Array<{
    skill: string;
    demand_score: number;
    trend: string;
    automation_risk: string;
    weight_in_profile: number;
  }>;
  task_automation: Array<{
    task: string;
    automation_probability: number;
  }>;
  market_insights: Array<{
    type: string;
    title: string;
    body: string;
  }>;
  pivot_options: Array<{
    role: string;
    match_percentage: number;
    salary_increase_percent: number;
    time_months: number;
    demand_growth: number;
    skills_to_learn: string[];
  }>;
  skill_correlation: {
    skills: string[];
    matrix: number[][];
  };
  risk_timeline: {
    labels: string[];
    no_action: number[];
    with_pivot: number[];
  };
  market_volatility: Array<{
    role: string;
    direction: string;
    magnitude: number;
  }>;
  summary: string;
}

// ─── DESIGN TOKENS ───
const C = {
  danger: '#ff3b5c',
  warning: '#ff9500',
  safe: '#34d399',
  accent: '#f5623a',
  blue: '#60a5fa',
  purple: '#a78bfa',
  bg: '#08090d',
  surface: '#0d0f18',
  border: '#1a1d2e',
  borderLight: '#2a2d42',
  text: '#e4e4e7',
  muted: '#71717a',
  gridLine: '#1a1d2e',
  axisLabel: '#374151',
};

const numStyle = (color: string): React.CSSProperties => ({
  fontFamily: 'var(--font-syne)',
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: '-0.02em',
  color,
  textShadow: `0 0 20px color-mix(in srgb, ${color} 30%, transparent)`,
});

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-dm-mono)',
  fontSize: '9px',
  letterSpacing: '2px',
  opacity: 0.35,
  textTransform: 'uppercase',
  color: C.text,
};

const sectionLabel = (color: string): React.CSSProperties => ({
  fontFamily: 'var(--font-dm-mono)',
  fontSize: '0.6rem',
  color,
  letterSpacing: '0.1em',
});

// ─── COUNT-UP HOOK ───
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

// ─── LIVE CLOCK ───
function LiveClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return <span style={{ fontFamily: 'var(--font-dm-mono)', color: C.text, fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums' }}>{time} IST</span>;
}

// ─── TICKER STRIP ───
function TickerStrip() {
  const items = useMemo(() => [...defaultTickerItems, ...defaultTickerItems, ...defaultTickerItems], []);

  return (
    <div style={{ background: '#06070b', borderBottom: `1px solid ${C.border}`, overflow: 'hidden', width: '100%' }}>
      <div className="terminal-ticker" style={{ gap: 0 }}>
        {items.map((item, i) => {
          let color = C.muted;
          let arrow = '';
          if (item.type === 'pct') {
            const v = item.value as number;
            color = v > 0 ? C.safe : C.danger;
            arrow = v > 0 ? '▲' : '▼';
          }
          return (
            <span key={i} style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '0.7rem',
              padding: '6px 20px',
              whiteSpace: 'nowrap',
              color,
              letterSpacing: '0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}>
              <span style={{ color: C.muted, marginRight: 6 }}>{item.symbol}</span>
              {arrow && <span style={{ marginRight: 2 }}>{arrow}</span>}
              {item.type === 'pct' ? `${(item.value as number) > 0 ? '+' : ''}${item.value}%` : String(item.value)}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── HEADER ROW ───
function HeaderRow({ data }: { data: AnalysisResult | null }) {
  const name = data ? data.personal.name.toUpperCase().replace(/\s+/g, '.') : 'ARJUN.MEHTA';
  const role = data ? data.personal.current_role.toUpperCase() : 'SDE-I';
  const city = data ? data.personal.city.toUpperCase() : 'BANGALORE/KA';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 16px',
      borderBottom: `1px solid ${C.border}`,
      background: '#0a0b10',
    }}>
      <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.7rem', color: C.muted }}>
        <span style={{ color: C.text }}>{name}</span>{' '}
        <span style={{ color: C.blue }}>{role}</span>{' '}
        <span>{city}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-syne)', fontSize: '0.8rem', fontWeight: 700, color: C.accent, letterSpacing: '0.15em' }}>
        CAREER.TERMINAL <span style={{ color: C.muted, fontWeight: 400 }}>v1.0</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-dm-mono)', fontSize: '0.7rem' }}>
        <LiveClock />
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="market-open-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: C.safe, display: 'inline-block' }} />
          <span style={{ color: C.safe, fontSize: '0.65rem' }}>MARKET OPEN</span>
        </span>
        <span style={{ color: C.muted, fontSize: '0.6rem' }}>UPD 14:32:07</span>
      </div>
    </div>
  );
}

// ─── METRIC CARD ───
function MetricCard({ label, value, suffix, color, delta, isHero }: {
  label: string; value: number; suffix: string; color: string; delta: string; isHero?: boolean;
}) {
  const count = useCountUp(value);
  const deltaColor = delta.startsWith('+') || delta.startsWith('▲') ? C.safe : delta.startsWith('→') ? C.muted : C.danger;
  const heroSize = isHero ? '4rem' : '1.6rem';
  const heroGlow = isHero
    ? `0 0 40px color-mix(in srgb, ${color} 40%, transparent), 0 0 80px color-mix(in srgb, ${color} 15%, transparent)`
    : `0 0 20px color-mix(in srgb, ${color} 30%, transparent)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="terminal-surface"
      style={{
        padding: '10px 14px',
        borderTop: `2px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: 0,
      }}
    >
      <span style={labelStyle}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{
          ...numStyle(color),
          fontSize: heroSize,
          textShadow: heroGlow,
        }}>
          {count}{suffix}
        </span>
      </div>
      <div style={{ height: 1, background: `linear-gradient(90deg, ${C.border}, transparent)`, margin: '2px 0' }} />
      <span style={{
        fontFamily: 'var(--font-dm-mono)',
        fontSize: '10px',
        color: deltaColor,
        background: `color-mix(in srgb, ${deltaColor} 10%, transparent)`,
        padding: '2px 6px',
        borderRadius: 4,
        alignSelf: 'flex-end',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {delta}
      </span>
    </motion.div>
  );
}

// ─── CUSTOM TOOLTIP ───
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: C.border,
      border: `1px solid ${C.borderLight}`,
      padding: '6px 10px',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.6rem', color: C.muted, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.65rem', color: p.color, fontVariantNumeric: 'tabular-nums' }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
}

// ─── CHART AXIS PROPS ───
const axisTickStyle = { fontSize: 10, fill: C.axisLabel, fontFamily: 'var(--font-dm-mono)' };
const gridProps = { stroke: C.gridLine, strokeDasharray: '4 4', opacity: 0.5 };

// ─── SKILL HOLDINGS TABLE ───
function SkillHoldingsTable({ data }: { data: AnalysisResult | null }) {
  const trendSymbol = (t: string) => {
    if (t === 'RISING') return '▲';
    if (t === 'STABLE') return '→';
    if (t === 'DECLINING') return '▼';
    if (t === 'DYING') return '▼▼';
    return t;
  };
  const riskColor = (r: string) => {
    const rl = r.toUpperCase();
    return rl === 'LOW' ? C.safe : rl === 'MEDIUM' ? C.warning : C.danger;
  };
  const demandColor = (d: number) => d >= 70 ? C.safe : d >= 50 ? C.warning : C.danger;
  const trendColor = (t: string) => {
    if (t === 'RISING') return C.safe;
    if (t === 'STABLE') return C.muted;
    return C.danger;
  };

  const skills = data
    ? data.skill_analysis.map(s => ({
        skill: s.skill,
        demand: s.demand_score,
        trend: s.trend,
        risk: s.automation_risk,
        weight: s.weight_in_profile,
      }))
    : [
        { skill: 'Python', demand: 89, trend: 'RISING', risk: 'LOW', weight: 28 },
        { skill: 'SQL', demand: 76, trend: 'DECLINING', risk: 'MEDIUM', weight: 22 },
        { skill: 'Excel', demand: 34, trend: 'DYING', risk: 'HIGH', weight: 12 },
        { skill: 'Git', demand: 71, trend: 'STABLE', risk: 'LOW', weight: 18 },
        { skill: 'ETL', demand: 58, trend: 'DECLINING', risk: 'MEDIUM', weight: 20 },
      ];

  return (
    <div className="terminal-surface" style={{ padding: 0, overflow: 'hidden', height: '100%' }}>
      <div style={{ padding: '8px 12px', borderBottom: `1px solid ${C.border}`, position: 'relative', zIndex: 1 }}>
        <span style={sectionLabel(C.accent)}>SKILL HOLDINGS</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative', zIndex: 1 }}>
        <thead>
          <tr>
            {['SKILL', 'DEMAND', 'TREND', 'RISK', 'WEIGHT'].map((h, hi) => (
              <th key={h} style={{
                ...labelStyle,
                padding: '6px 10px',
                textAlign: hi >= 1 ? 'right' : 'left',
                borderBottom: `1px solid ${C.border}`,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {skills.map((s, i) => (
            <motion.tr
              key={s.skill}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="terminal-row-hover"
              style={{
                background: i % 2 === 0 ? C.surface : 'transparent',
                cursor: 'default',
                height: 32,
              }}
            >
              <td style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.7rem', color: C.text, padding: '0 10px' }}>
                {s.skill}
              </td>
              <td style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '0.7rem', padding: '0 10px', textAlign: 'right',
                fontVariantNumeric: 'tabular-nums', color: demandColor(s.demand),
              }}>
                {s.demand}/100
              </td>
              <td style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '10px', padding: '0 10px', textAlign: 'right',
                color: trendColor(s.trend), opacity: 0.7,
              }}>
                {trendSymbol(s.trend)}
              </td>
              <td style={{ padding: '0 10px', textAlign: 'right' }}>
                <span style={{
                  width: 3, height: 14, borderRadius: 1, display: 'inline-block', verticalAlign: 'middle',
                  background: riskColor(s.risk),
                }} />
              </td>
              <td style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '0.7rem', color: C.text, padding: '0 10px', textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {s.weight}%
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── CAREER VALUE CHART ───
function CareerValueChart() {
  return (
    <div className="terminal-surface" style={{ padding: '8px 12px 4px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <span style={{ ...sectionLabel(C.blue), marginBottom: 4, position: 'relative', zIndex: 1 }}>
        CAREER VALUE vs MARKET
      </span>
      <div style={{ flex: 1, minHeight: 0, position: 'relative', zIndex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={careerValueData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="month" tick={axisTickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="you" stroke={C.danger} strokeWidth={2} dot={false} name="You" />
            <Line type="monotone" dataKey="market" stroke={C.blue} strokeWidth={2} dot={false} name="Market" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── ROLE DEMAND CHART ───
function RoleDemandChart() {
  const data = roleDemandIndex.map(d => ({
    ...d,
    growDemand: d.growing ? d.demand : 0,
    shrinkDemand: d.growing ? 0 : d.demand,
  }));
  return (
    <div className="terminal-surface" style={{ padding: '8px 12px 4px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <span style={{ ...sectionLabel(C.blue), marginBottom: 4, position: 'relative', zIndex: 1 }}>
        ROLE DEMAND INDEX
      </span>
      <div style={{ flex: 1, minHeight: 0, position: 'relative', zIndex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={2}>
            <CartesianGrid {...gridProps} horizontal={false} />
            <XAxis type="number" tick={axisTickStyle} axisLine={false} tickLine={false} domain={[0, 100]} />
            <YAxis type="category" dataKey="role" tick={axisTickStyle} axisLine={false} tickLine={false} width={55} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="growDemand" fill={C.safe} radius={[0, 3, 3, 0]} name="Growing" stackId="a" />
            <Bar dataKey="shrinkDemand" fill={C.danger} radius={[0, 3, 3, 0]} name="Shrinking" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── RISK ANALYSIS PANEL ───
function RiskAnalysisPanel({ data }: { data: AnalysisResult | null }) {
  const metrics = data
    ? [
        { label: 'AUTOMATION.PROB', value: `${data.risk_metrics.overall_risk_score}%`, color: C.danger },
        { label: 'MARKET.VOLATILITY', value: data.risk_metrics.risk_level, color: C.warning },
        { label: 'SKILL.OBSOLESCENCE', value: `${data.risk_metrics.timeline_months}mo`, color: C.danger },
        { label: 'DEMAND.RATIO', value: data.risk_metrics.demand_ratio.toFixed(2), color: C.danger },
        { label: 'COMPETING.PROFILES', value: data.risk_metrics.competing_profiles_estimate.toLocaleString(), color: C.warning },
        { label: 'TRANSFERABLE.SKILLS', value: `${data.risk_metrics.transferable_skills_count}`, color: C.safe },
      ]
    : [
        { label: 'AUTOMATION.PROB', value: '71%', color: '#ff3b5c' },
        { label: 'MARKET.VOLATILITY', value: 'HIGH', color: '#ff9500' },
        { label: 'SKILL.OBSOLESCENCE', value: '8.2mo', color: '#ff3b5c' },
        { label: 'DEMAND.RATIO', value: '0.08', color: '#ff3b5c' },
        { label: 'PIVOT.READINESS', value: '67%', color: '#34d399' },
        { label: 'SAFETY.SCORE', value: '3.1/10', color: '#ff3b5c' },
      ];

  return (
    <div className="terminal-surface" style={{ padding: 0, height: '100%' }}>
      <div style={{ padding: '8px 12px', borderBottom: `1px solid ${C.border}`, position: 'relative', zIndex: 1 }}>
        <span style={sectionLabel(C.danger)}>RISK.ANALYSIS</span>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {metrics.map((m, i) => (
          <div key={m.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 12px',
            borderBottom: i < metrics.length - 1 ? `1px solid ${C.border}` : 'none',
          }}>
            <span style={{ ...labelStyle, opacity: 0.5 }}>{m.label}</span>
            <span style={{ ...numStyle(m.color), fontSize: '0.85rem' }}>{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TASK AUTOMATION BARS ───
function TaskAutomationPanel({ data }: { data: AnalysisResult | null }) {
  const tasks = data
    ? data.task_automation.map(t => ({ task: t.task, percentage: t.automation_probability }))
    : [
        { task: 'Data Entry & Processing', percentage: 92 },
        { task: 'Report Generation', percentage: 84 },
        { task: 'Basic Code Review', percentage: 76 },
        { task: 'Customer Support Triage', percentage: 68 },
        { task: 'Content Drafting', percentage: 55 },
        { task: 'Strategic Analysis', percentage: 22 },
      ];

  return (
    <div className="terminal-surface" style={{ padding: 0, height: '100%' }}>
      <div style={{ padding: '8px 12px', borderBottom: `1px solid ${C.border}`, position: 'relative', zIndex: 1 }}>
        <span style={sectionLabel(C.warning)}>TASK AUTOMATION</span>
      </div>
      <div style={{ padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', zIndex: 1 }}>
        {tasks.map((t, i) => {
          const color = t.percentage >= 80 ? C.danger : t.percentage >= 60 ? C.warning : t.percentage >= 40 ? C.purple : C.safe;
          return (
            <div key={t.task}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem', color: '#9ca3af' }}>
                  {t.task.length > 22 ? t.task.slice(0, 22) + '..' : t.task}
                </span>
                <span style={{
                  fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem', color,
                  fontVariantNumeric: 'tabular-nums',
                }}>{t.percentage}%</span>
              </div>
              <div style={{ width: '100%', height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${t.percentage}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                  style={{ height: '100%', background: color, borderRadius: 2 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SKILL CORRELATION MATRIX (D3) ───
function CorrelationMatrix({ data }: { data: AnalysisResult | null }) {
  const ref = useRef<SVGSVGElement>(null);
  const hasDrawn = useRef(false);

  const matrixData = data
    ? { skills: data.skill_correlation.skills, data: data.skill_correlation.matrix }
    : {
        skills: ['Python', 'SQL', 'Cloud', 'ML', 'Docker'],
        data: [
          [1.0, 0.72, 0.45, 0.68, 0.31],
          [0.72, 1.0, 0.38, 0.52, 0.22],
          [0.45, 0.38, 1.0, 0.61, 0.85],
          [0.68, 0.52, 0.61, 1.0, 0.55],
          [0.31, 0.22, 0.85, 0.55, 1.0],
        ],
      };

  useEffect(() => {
    if (!ref.current || hasDrawn.current) return;
    hasDrawn.current = true;

    const { skills, data: matrix } = matrixData;
    const size = skills.length;
    const cellSize = 36;
    const gap = 1;
    const labelSpace = 40;
    const svgW = labelSpace + size * (cellSize + gap);
    const svgH = labelSpace + size * (cellSize + gap);

    const svg = d3.select(ref.current)
      .attr('width', svgW)
      .attr('height', svgH);

    const colorScale = d3.scaleLinear<string>()
      .domain([0, 0.25, 0.5, 0.75, 1])
      .range(['#0d1117', '#1a2744', '#1e3a6e', '#2563eb', '#60a5fa']);

    svg.selectAll('.col-label')
      .data(skills)
      .enter()
      .append('text')
      .attr('x', (_, i) => labelSpace + i * (cellSize + gap) + cellSize / 2)
      .attr('y', labelSpace - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', C.axisLabel)
      .attr('font-size', '8px')
      .attr('font-family', 'var(--font-dm-mono)')
      .text(d => d.slice(0, 5));

    svg.selectAll('.row-label')
      .data(skills)
      .enter()
      .append('text')
      .attr('x', labelSpace - 4)
      .attr('y', (_, i) => labelSpace + i * (cellSize + gap) + cellSize / 2 + 3)
      .attr('text-anchor', 'end')
      .attr('fill', C.axisLabel)
      .attr('font-size', '8px')
      .attr('font-family', 'var(--font-dm-mono)')
      .text(d => d.slice(0, 5));

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const val = matrix[row][col];
        svg.append('rect')
          .attr('class', 'heatmap-cell')
          .attr('x', labelSpace + col * (cellSize + gap))
          .attr('y', labelSpace + row * (cellSize + gap))
          .attr('width', cellSize)
          .attr('height', cellSize)
          .attr('rx', 2)
          .attr('fill', colorScale(val))
          .attr('opacity', 0)
          .transition()
          .delay((row * size + col) * 30)
          .duration(300)
          .attr('opacity', 1);

        svg.append('text')
          .attr('x', labelSpace + col * (cellSize + gap) + cellSize / 2)
          .attr('y', labelSpace + row * (cellSize + gap) + cellSize / 2 + 3)
          .attr('text-anchor', 'middle')
          .attr('fill', val > 0.7 ? '#e4e4e7' : val > 0.4 ? '#9ca3af' : '#4b5563')
          .attr('font-size', '8px')
          .attr('font-family', 'var(--font-dm-mono)')
          .attr('opacity', 0)
          .transition()
          .delay((row * size + col) * 30 + 100)
          .duration(200)
          .attr('opacity', 1)
          .text(val.toFixed(1));
      }
    }
  }, [matrixData]);

  return (
    <div className="terminal-surface" style={{ padding: 0, height: '100%' }}>
      <div style={{ padding: '8px 12px', borderBottom: `1px solid ${C.border}`, position: 'relative', zIndex: 1 }}>
        <span style={sectionLabel(C.blue)}>SKILL CORRELATION</span>
      </div>
      <div style={{ padding: '8px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <svg ref={ref} />
      </div>
    </div>
  );
}

// ─── MARKET VOLATILITY ───
function MarketVolatilityPanel({ data }: { data: AnalysisResult | null }) {
  const volatility = data
    ? data.market_volatility.map(m => ({
        role: m.role,
        volatility: m.magnitude,
        direction: m.direction.toLowerCase() as 'up' | 'down',
      }))
    : [
        { role: 'Prompt Eng', volatility: 92, direction: 'up' as const },
        { role: 'ML Engineer', volatility: 78, direction: 'up' as const },
        { role: 'DevOps', volatility: 45, direction: 'up' as const },
        { role: 'SDE Junior', volatility: 67, direction: 'down' as const },
        { role: 'QA Manual', volatility: 82, direction: 'down' as const },
        { role: 'Data Entry', volatility: 95, direction: 'down' as const },
      ];

  return (
    <div className="terminal-surface" style={{ padding: 0, height: '100%' }}>
      <div style={{ padding: '8px 12px', borderBottom: `1px solid ${C.border}`, position: 'relative', zIndex: 1 }}>
        <span style={sectionLabel(C.purple)}>MARKET VOLATILITY</span>
      </div>
      <div style={{ padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', zIndex: 1 }}>
        {volatility.map((m, i) => {
          const color = m.direction === 'up' ? C.safe : C.danger;
          return (
            <div key={m.role}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem', color: '#9ca3af' }}>{m.role}</span>
                <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem', color, fontVariantNumeric: 'tabular-nums' }}>
                  {m.direction === 'up' ? '▲' : '▼'} {m.volatility}
                </span>
              </div>
              <div style={{ width: '100%', height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.volatility}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                  style={{ height: '100%', background: color, borderRadius: 2 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PIVOT SUGGESTIONS ───
function PivotSuggestionsPanel({ data }: { data: AnalysisResult | null }) {
  const matchColor = (m: number) => m >= 70 ? C.safe : m >= 50 ? C.warning : C.purple;

  const pivots = data
    ? data.pivot_options.map(p => ({
        role: p.role,
        match: p.match_percentage,
        salaryDelta: `+₹${p.salary_increase_percent}%`,
        indicator: (p.match_percentage >= 70 ? 'green' : 'yellow') as 'green' | 'yellow',
        timeMonths: p.time_months,
        skillsToLearn: p.skills_to_learn,
      }))
    : [
        { role: 'ML Engineer', match: 74, salaryDelta: '+₹8L', indicator: 'green' as const, timeMonths: 6, skillsToLearn: [] as string[] },
        { role: 'Data Analyst', match: 82, salaryDelta: '+₹3L', indicator: 'green' as const, timeMonths: 3, skillsToLearn: [] as string[] },
        { role: 'Cloud Architect', match: 58, salaryDelta: '+₹14L', indicator: 'yellow' as const, timeMonths: 9, skillsToLearn: [] as string[] },
      ];

  return (
    <div className="terminal-surface" style={{ padding: 0, height: '100%' }}>
      <div style={{ padding: '8px 12px', borderBottom: `1px solid ${C.border}`, position: 'relative', zIndex: 1 }}>
        <span style={sectionLabel(C.safe)}>PIVOT SUGGESTIONS</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {pivots.map((p, i) => {
          const mColor = matchColor(p.match);
          return (
            <div key={p.role} style={{
              padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: i < pivots.length - 1 ? `1px solid ${C.border}` : 'none',
              borderLeft: `3px solid ${mColor}`,
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${p.match}%`,
                background: `color-mix(in srgb, ${mColor} 8%, transparent)`,
                pointerEvents: 'none',
              }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}>
                <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.7rem', color: C.text }}>{p.role}</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem', color: C.muted, fontVariantNumeric: 'tabular-nums' }}>MATCH {p.match}%</span>
                  <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem', color: C.safe }}>{p.salaryDelta}</span>
                  {data && <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem', color: C.muted }}>{p.timeMonths}mo</span>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
                <span style={{
                  width: 3, height: 14, borderRadius: 1, display: 'inline-block',
                  background: p.indicator === 'green' ? C.safe : C.warning,
                }} />
                <button
                  style={{
                    fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: mColor,
                    background: 'transparent', border: `1px solid ${mColor}`,
                    padding: '2px 8px', borderRadius: 2, cursor: 'pointer',
                    letterSpacing: '0.05em',
                  }}
                >
                  VIEW
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── RISK TIMELINE CHART ───
function RiskTimelineChart({ data }: { data: AnalysisResult | null }) {
  const timeline = data
    ? data.risk_timeline.labels.map((label, i) => ({
        month: label,
        noAction: data.risk_timeline.no_action[i],
        pivotNow: data.risk_timeline.with_pivot[i],
      }))
    : [
        { month: 'Now', noAction: 71, pivotNow: 71 },
        { month: 'M2', noAction: 74, pivotNow: 65 },
        { month: 'M4', noAction: 78, pivotNow: 55 },
        { month: 'M6', noAction: 82, pivotNow: 42 },
        { month: 'M8', noAction: 86, pivotNow: 30 },
        { month: 'M10', noAction: 90, pivotNow: 20 },
        { month: 'M12', noAction: 93, pivotNow: 14 },
        { month: 'M14', noAction: 97, pivotNow: 8 },
      ];

  return (
    <div className="terminal-surface" style={{ padding: '8px 12px 4px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, position: 'relative', zIndex: 1 }}>
        <span style={sectionLabel(C.danger)}>RISK TIMELINE — PROJECTED OUTCOMES</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem', color: C.danger, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 2, background: C.danger, display: 'inline-block' }} />
            NO ACTION
          </span>
          <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem', color: C.safe, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 2, background: C.safe, display: 'inline-block' }} />
            PIVOT NOW
          </span>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, position: 'relative', zIndex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="noActionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.danger} stopOpacity={0.2} />
                <stop offset="100%" stopColor={C.danger} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pivotNowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.safe} stopOpacity={0.2} />
                <stop offset="100%" stopColor={C.safe} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="month" tick={axisTickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="noAction" stroke={C.danger} strokeWidth={2.5} fill="url(#noActionGrad)" name="No Action" />
            <Area type="monotone" dataKey="pivotNow" stroke={C.safe} strokeWidth={2.5} fill="url(#pivotNowGrad)" name="Pivot Now" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── HIRING CALENDAR ───
function HiringCalendarPanel() {
  const intensityColors: Record<number, string> = { 1: C.danger, 2: C.warning, 3: C.safe };

  return (
    <div className="terminal-surface" style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 12px', borderBottom: `1px solid ${C.border}`, position: 'relative', zIndex: 1 }}>
        <span style={sectionLabel(C.purple)}>HIRING CALENDAR</span>
      </div>
      <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          {hiringCalendar.months.map((m, i) => (
            <div key={m} style={{
              padding: '6px 4px', borderRadius: 3, textAlign: 'center',
              background: `color-mix(in srgb, ${intensityColors[hiringCalendar.intensity[i]]} 8%, transparent)`,
              border: `1px solid color-mix(in srgb, ${intensityColors[hiringCalendar.intensity[i]]} 15%, transparent)`,
            }}>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.5rem', color: C.axisLabel }}>{m}</div>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', margin: '4px auto 0',
                background: intensityColors[hiringCalendar.intensity[i]],
              }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
          {hiringCalendar.events.map(e => (
            <div key={e.label} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '4px 0', borderBottom: `1px solid ${C.border}`,
            }}>
              <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem', color: C.text }}>{e.label}</span>
              <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem', color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{e.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MARKET INSIGHTS PANEL ───
function MarketInsightsPanel({ data }: { data: AnalysisResult }) {
  const typeColor = (t: string) => {
    if (t === 'ALERT') return C.danger;
    if (t === 'WARNING') return C.warning;
    return C.safe;
  };

  return (
    <div className="terminal-surface" style={{ padding: 0 }}>
      <div style={{ padding: '8px 12px', borderBottom: `1px solid ${C.border}`, position: 'relative', zIndex: 1 }}>
        <span style={sectionLabel(C.warning)}>MARKET INTELLIGENCE</span>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {data.market_insights.map((insight, i) => (
          <div key={i} style={{
            padding: '10px 12px',
            borderBottom: i < data.market_insights.length - 1 ? `1px solid ${C.border}` : 'none',
            borderLeft: `3px solid ${typeColor(insight.type)}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '0.5rem',
                color: typeColor(insight.type),
                background: `color-mix(in srgb, ${typeColor(insight.type)} 15%, transparent)`,
                padding: '1px 6px', borderRadius: 2, letterSpacing: '0.1em',
              }}>
                {insight.type}
              </span>
              <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.65rem', color: C.text }}>
                {insight.title}
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem', color: C.muted, lineHeight: 1.5, margin: 0 }}>
              {insight.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── NEWS TICKER ───
function NewsTickerBar() {
  const items = useMemo(() => [...newsTicker, ...newsTicker, ...newsTicker], []);
  return (
    <div style={{ background: '#06070b', borderTop: `1px solid ${C.border}`, overflow: 'hidden', width: '100%' }}>
      <div className="terminal-news-ticker" style={{ gap: 0 }}>
        {items.map((item, i) => (
          <span key={i} style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '0.65rem', padding: '6px 32px',
            whiteSpace: 'nowrap', color: '#9ca3af',
          }}>
            <span style={{ color: C.accent, marginRight: 8 }}>&#9632;</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── UPLOAD ZONE ───
function ResumeUploadZone({ onFileSelected }: { onFileSelected: (file: File) => void }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      onFileSelected(file);
    }
  }, [onFileSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  }, [onFileSelected]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`forge-upload-zone ${isDragOver ? 'forge-upload-zone--active' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <Upload size={36} strokeWidth={1} style={{ color: isDragOver ? C.accent : C.muted, marginBottom: 16, transition: 'color 0.3s' }} />
      <div style={{
        fontFamily: 'var(--font-dm-mono)',
        fontSize: '0.85rem',
        color: C.text,
        letterSpacing: '0.15em',
        marginBottom: 8,
      }}>
        DROP RESUME TO INITIATE ANALYSIS
      </div>
      <div style={{
        fontFamily: 'var(--font-dm-mono)',
        fontSize: '0.6rem',
        color: C.muted,
        letterSpacing: '0.05em',
      }}>
        PDF format — your data never leaves this session
      </div>
    </motion.div>
  );
}

// ─── LOADING OVERLAY ───
const BOOT_LINES = [
  'EXTRACTING RESUME DATA...',
  'CONNECTING TO INTELLIGENCE ENGINE...',
  'ANALYSING SKILL MARKET VALUE...',
  'CALCULATING AUTOMATION RISK...',
  'BUILDING PIVOT MATRIX...',
  'GENERATING INTELLIGENCE REPORT...',
];

function LoadingOverlay() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i >= BOOT_LINES.length) {
        // Keep cycling
        i = BOOT_LINES.length;
        clearInterval(interval);
      }
      setVisibleLines(i);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="forge-loading-overlay"
    >
      <div style={{ maxWidth: 500 }}>
        <div style={{
          fontFamily: 'var(--font-syne)',
          fontSize: '1.2rem',
          fontWeight: 700,
          color: C.accent,
          letterSpacing: '0.15em',
          marginBottom: 32,
        }}>
          FORGE.CAREER.INTELLIGENCE
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {BOOT_LINES.map((line, i) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, x: -20 }}
              animate={i < visibleLines ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '0.75rem',
                color: i < visibleLines - 1 ? C.safe : C.accent,
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ color: i < visibleLines - 1 ? C.safe : C.accent }}>
                {i < visibleLines - 1 ? '✓' : '›'}
              </span>
              {line}
              {i === visibleLines - 1 && (
                <span className="forge-blink" style={{ color: C.accent }}>_</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── ERROR DISPLAY ───
function ErrorDisplay({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="terminal-surface"
      style={{
        padding: '24px',
        margin: '16px 8px',
        borderTop: `2px solid ${C.danger}`,
        textAlign: 'center',
      }}
    >
      <div style={{
        fontFamily: 'var(--font-dm-mono)',
        fontSize: '0.8rem',
        color: C.danger,
        letterSpacing: '0.1em',
        marginBottom: 12,
      }}>
        ANALYSIS FAILED — {message} — TRY AGAIN
      </div>
      <button
        onClick={onRetry}
        style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '0.7rem',
          color: C.accent,
          background: 'transparent',
          border: `1px solid ${C.accent}`,
          padding: '6px 20px',
          borderRadius: 2,
          cursor: 'pointer',
          letterSpacing: '0.1em',
        }}
      >
        RETRY UPLOAD
      </button>
    </motion.div>
  );
}

// ─── MAIN PAGE ───
export default function RiskTerminal() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/analyse-resume', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      const data: AnalysisResult = await res.json();
      setAnalysis(data);

      // Dispatch event so Sidebar can pick up the user name
      window.dispatchEvent(new CustomEvent('forge-analysis', { detail: data.personal }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
  }, []);

  const riskScoreValue = analysis ? analysis.risk_metrics.overall_risk_score : 71;
  const timelineValue = analysis ? analysis.risk_metrics.timeline_months : 14;
  const marketDemandValue = analysis ? analysis.risk_metrics.market_demand_score : 43;
  const transferableSkillsValue = analysis ? analysis.risk_metrics.transferable_skills_count : 6;
  const transferableSkillsTotal = analysis ? analysis.skill_analysis.length : 12;

  const riskColor = riskScoreValue >= 70 ? C.danger : riskScoreValue >= 40 ? C.warning : C.safe;

  const showUpload = !analysis && !isLoading && !error;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: C.bg }}>
      <AnimatePresence>
        {isLoading && <LoadingOverlay />}
      </AnimatePresence>

      {showUpload && (
        <div style={{ padding: '32px 8px 0' }}>
          <ResumeUploadZone onFileSelected={handleFileSelected} />
        </div>
      )}

      {error && (
        <ErrorDisplay message={error} onRetry={handleRetry} />
      )}

      <TickerStrip />
      <HeaderRow data={analysis} />

      <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* SUMMARY BAR — only when analysis exists */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="terminal-surface"
            style={{ padding: '10px 14px', borderLeft: `3px solid ${C.accent}` }}
          >
            <span style={{ ...sectionLabel(C.accent), marginRight: 8 }}>INTEL.SUMMARY</span>
            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.6rem', color: C.muted, lineHeight: 1.6 }}>
              {analysis.summary}
            </span>
          </motion.div>
        )}

        {/* ROW 1 — METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          <MetricCard label="RISK.SCORE" value={riskScoreValue} suffix="" color={riskColor} delta={analysis ? `${analysis.risk_metrics.risk_level}` : '▲ +4.2'} isHero />
          <MetricCard label="TIMELINE" value={timelineValue} suffix="mo" color={C.warning} delta={analysis ? `${timelineValue}mo window` : '▼ -2mo'} />
          <MetricCard label="MARKET.DEMAND" value={marketDemandValue} suffix="/100" color={C.blue} delta={analysis ? `ratio ${analysis.risk_metrics.demand_ratio.toFixed(2)}` : '▼ -12'} />
          <MetricCard label="SKILL.VALUE" value={transferableSkillsValue} suffix={`/${transferableSkillsTotal}`} color={C.safe} delta={analysis ? `${analysis.risk_metrics.competing_profiles_estimate.toLocaleString()} competing` : '→ 0'} />
        </div>

        {/* MARKET INSIGHTS — only when analysis */}
        {analysis && (
          <MarketInsightsPanel data={analysis} />
        )}

        {/* ROW 2 — SKILL TABLE | CHARTS | RISK ANALYSIS */}
        <div style={{ display: 'grid', gridTemplateColumns: '40% 35% 25%', gap: 8, minHeight: 280 }}>
          <SkillHoldingsTable data={analysis} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <CareerValueChart />
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <RoleDemandChart />
            </div>
          </div>
          <RiskAnalysisPanel data={analysis} />
        </div>

        {/* ROW 3 — TASK AUTOMATION | CORRELATION | VOLATILITY | PIVOT */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, minHeight: 240 }}>
          <TaskAutomationPanel data={analysis} />
          <CorrelationMatrix data={analysis} />
          <MarketVolatilityPanel data={analysis} />
          <PivotSuggestionsPanel data={analysis} />
        </div>

        {/* ROW 4 — RISK TIMELINE | HIRING CALENDAR */}
        <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: 8, minHeight: 220 }}>
          <RiskTimelineChart data={analysis} />
          <HiringCalendarPanel />
        </div>
      </div>

      <NewsTickerBar />
    </div>
  );
}
