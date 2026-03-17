'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import {
  AlertTriangle, Clock, TrendingDown, TrendingUp, Activity,
  Shield, Zap, CheckCircle2, XCircle, AlertCircle, Minus,
} from 'lucide-react';
import RiskGauge from '@/components/RiskGauge';
import {
  riskScore, taskAutomation, skillDemandTrend,
  jobPostingVolume, riskTimeline, competitorTable, keyInsights,
} from '@/lib/mockData';

// ─── Animated counter hook ───
function useCountUp(end: number, duration = 1500, decimals = 0) {
  const [value, setValue] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Number((eased * end).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration, decimals]);

  return value;
}

// ─── Stat Card ───
function StatCard({
  label, value, suffix, color, icon: Icon, trend, delay,
}: {
  label: string; value: number; suffix: string; color: string;
  icon: React.ElementType; trend: string; delay: number;
}) {
  const count = useCountUp(value, 1800);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="stat-card"
    >
      <div className="h-1" style={{ background: color }} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="section-label">{label}</span>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${color}15` }}
          >
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
        </div>
        <div className="flex items-end gap-1">
          <span
            className="text-3xl font-bold"
            style={{ fontFamily: 'var(--font-dm-mono)', color }}
          >
            {count}{suffix}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          {trend === 'up' ? (
            <TrendingUp className="w-3 h-3 text-red-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-green-500" />
          )}
          <span className="text-xs" style={{ color: '#71717a' }}>
            {trend === 'up' ? '+3.2% this month' : '-2.1% this month'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section wrapper ───
function Section({
  children, label, title, delay = 0,
}: {
  children: React.ReactNode; label: string; title: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card p-6"
    >
      <p className="section-label">{label}</p>
      <h3 className="section-title mb-5">{title}</h3>
      {children}
    </motion.div>
  );
}

// ─── Custom Recharts Tooltip ───
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div
      className="rounded-lg p-3 text-xs"
      style={{
        background: 'rgba(8, 9, 13, 0.95)',
        border: '1px solid #27272a',
        backdropFilter: 'blur(12px)',
      }}
    >
      <p className="font-semibold mb-1" style={{ color: '#e4e4e7' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

// ─── Automation bar ───
function AutomationBar({
  task, percentage, index,
}: {
  task: string; percentage: number; index: number;
}) {
  const barColor = percentage >= 80 ? '#ef4444' : percentage >= 50 ? '#f5943a' : percentage < 30 ? '#00e5a0' : '#f5c542';
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="mb-4"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm" style={{ color: '#e4e4e7' }}>{task}</span>
        <span className="text-sm font-bold" style={{ color: barColor, fontFamily: 'var(--font-dm-mono)' }}>
          {percentage}%
        </span>
      </div>
      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: barColor, boxShadow: `0 0 12px ${barColor}44` }}
        />
      </div>
    </motion.div>
  );
}

// ─── GAP BADGE ───
function GapBadge({ gap }: { gap: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    none: { bg: 'rgba(0, 229, 160, 0.1)', text: '#00e5a0', label: '✓ Matched' },
    low: { bg: 'rgba(0, 229, 160, 0.1)', text: '#00e5a0', label: 'Low Gap' },
    medium: { bg: 'rgba(245, 148, 58, 0.1)', text: '#f5943a', label: 'Medium Gap' },
    high: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', label: 'High Gap' },
    critical: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', label: '⚠ Critical' },
  };
  const c = config[gap] || config.medium;
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full font-medium"
      style={{ background: c.bg, color: c.text }}
    >
      {c.label}
    </span>
  );
}

// ════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════

export default function RiskPage() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="section-label">Intelligence Report</p>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: 'var(--font-syne)', color: '#e4e4e7' }}
          >
            Risk Analysis
          </h1>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
          style={{
            background: 'rgba(245, 98, 58, 0.08)',
            border: '1px solid rgba(245, 98, 58, 0.2)',
            color: '#f5623a',
            fontFamily: 'var(--font-dm-mono)',
          }}
        >
          <Activity className="w-3 h-3" />
          Live · Updated 2h ago
        </div>
      </motion.div>

      {/* ─── TOP ROW: 4 Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Risk Score" value={riskScore.overall} suffix="%"
          color="#ef4444" icon={AlertTriangle} trend="up" delay={0.1}
        />
        <StatCard
          label="Timeline" value={riskScore.timeline} suffix=" mo"
          color="#f5943a" icon={Clock} trend="up" delay={0.2}
        />
        <StatCard
          label="Market Demand" value={riskScore.marketDemand} suffix="/100"
          color="#3a7bfd" icon={TrendingDown} trend="down" delay={0.3}
        />
        <StatCard
          label="Transferable Skills" value={riskScore.transferableSkills.current} suffix={`/${riskScore.transferableSkills.total}`}
          color="#00e5a0" icon={Shield} trend="down" delay={0.4}
        />
      </div>

      {/* ─── ROW 2: Gauge + Task Automation ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Gauge */}
        <Section label="Assessment" title="Risk Gauge">
          <div className="flex flex-col items-center">
            <RiskGauge score={riskScore.overall} size={340} />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Low Risk', color: '#00e5a0', range: '0-30%' },
              { label: 'Medium', color: '#f5c542', range: '31-60%' },
              { label: 'High Risk', color: '#ef4444', range: '61-100%' },
            ].map((z) => (
              <div key={z.label} className="flex items-center gap-2 text-xs" style={{ color: '#71717a' }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: z.color }} />
                {z.label} ({z.range})
              </div>
            ))}
          </div>
        </Section>

        {/* Task Automation Risk */}
        <Section label="Automation Exposure" title="Task Automation Risk">
          {taskAutomation.map((t, i) => (
            <AutomationBar key={t.task} task={t.task} percentage={t.percentage} index={i} />
          ))}
          <p className="text-xs mt-3" style={{ color: '#71717a' }}>
            Based on current AI capability trajectory and industry adoption rates
          </p>
        </Section>
      </div>

      {/* ─── ROW 3: Skill Demand + Job Posting ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Demand Trend */}
        <Section label="Market Intelligence" title="Skill Demand Trend (12 Months)">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={skillDemandTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
              <XAxis
                dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={{ stroke: '#27272a' }} tickLine={false}
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={{ stroke: '#27272a' }} tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#71717a' }}
                iconType="circle" iconSize={8}
              />
              <Line
                type="monotone" dataKey="pythonSql" name="Python+SQL Only"
                stroke="#ef4444" strokeWidth={2.5} dot={false}
                strokeDasharray="6 3"
              />
              <Line
                type="monotone" dataKey="pythonCloud" name="Python+Cloud"
                stroke="#00e5a0" strokeWidth={2.5} dot={false}
              />
              <Line
                type="monotone" dataKey="mlAi" name="ML/AI Adjacent"
                stroke="#3a7bfd" strokeWidth={2.5} dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Section>

        {/* Job Posting Volume */}
        <Section label="Hiring Trends" title="Job Posting Volume (% Change)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={jobPostingVolume} layout="vertical" barCategoryGap="18%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" horizontal={false} />
              <XAxis
                type="number" tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={{ stroke: '#27272a' }} tickLine={false}
                domain={[-50, 80]}
              />
              <YAxis
                dataKey="role" type="category" width={110}
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                axisLine={{ stroke: '#27272a' }} tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="change" name="% Change" radius={[0, 4, 4, 0]}>
                {jobPostingVolume.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.change >= 0 ? '#00e5a0' : '#ef4444'}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* ─── ROW 4: Risk Timeline ─── */}
      <Section label="Projection" title="Risk Timeline — Action vs Inaction">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={riskTimeline}>
            <defs>
              <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00e5a0" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00e5a0" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
            <XAxis
              dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={{ stroke: '#27272a' }} tickLine={false}
            />
            <YAxis
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={{ stroke: '#27272a' }} tickLine={false}
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', color: '#71717a' }}
              iconType="circle" iconSize={8}
            />
            <Area
              type="monotone" dataKey="noAction" name="No Action"
              stroke="#ef4444" strokeWidth={2.5} fill="url(#gradRed)"
            />
            <Area
              type="monotone" dataKey="pivotNow" name="Start Pivot Now"
              stroke="#00e5a0" strokeWidth={2.5} fill="url(#gradGreen)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 mt-4 text-xs" style={{ color: '#71717a' }}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 rounded-full" style={{ background: '#ef4444' }} />
            Inaction leads to <span className="font-bold text-red-400">97% risk</span> in 14 months
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 rounded-full" style={{ background: '#00e5a0' }} />
            Pivoting now drops risk to <span className="font-bold text-green-400">8%</span>
          </div>
        </div>
      </Section>

      {/* ─── ROW 5: Competitor Table + Key Insights ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Competitor Table — 3 cols */}
        <div className="lg:col-span-3">
          <Section label="Gap Analysis" title="Your Profile vs Market Requirements">
            <div className="overflow-x-auto">
              <table className="risk-table">
                <thead>
                  <tr>
                    <th>Skill</th>
                    <th>You</th>
                    <th>Market Requires</th>
                    <th>Gap Status</th>
                  </tr>
                </thead>
                <tbody>
                  {competitorTable.map((row, i) => (
                    <motion.tr
                      key={row.skill}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                      <td className="font-medium" style={{ color: '#e4e4e7' }}>{row.skill}</td>
                      <td>
                        {row.you ? (
                          <CheckCircle2 className="w-4 h-4" style={{ color: '#00e5a0' }} />
                        ) : (
                          <XCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
                        )}
                      </td>
                      <td>
                        {row.market ? (
                          <CheckCircle2 className="w-4 h-4" style={{ color: '#3a7bfd' }} />
                        ) : (
                          <Minus className="w-4 h-4" style={{ color: '#71717a' }} />
                        )}
                      </td>
                      <td><GapBadge gap={row.gap} /></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs" style={{ color: '#71717a' }}>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" style={{ color: '#00e5a0' }} /> 4 skills matched
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="w-3 h-3" style={{ color: '#ef4444' }} /> 6 gaps identified
              </span>
            </div>
          </Section>
        </div>

        {/* Key Insights — 2 cols */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-6 h-full"
          >
            <p className="section-label">Analysis</p>
            <h3 className="section-title mb-5">Key Insights</h3>
            <div className="space-y-4">
              {keyInsights.map((insight, i) => {
                const colorMap = {
                  danger: '#ef4444',
                  warning: '#f5943a',
                  positive: '#00e5a0',
                };
                const iconMap = {
                  danger: AlertTriangle,
                  warning: AlertCircle,
                  positive: Zap,
                };
                const borderColor = colorMap[insight.type];
                const Icon = iconMap[insight.type];

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    className="rounded-lg p-4"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      borderLeft: `3px solid ${borderColor}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4" style={{ color: borderColor }} />
                      <span className="text-sm font-semibold" style={{ color: '#e4e4e7' }}>
                        {insight.title}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#a1a1aa' }}>
                      {insight.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center pt-4"
      >
        <div
          className="h-px w-full max-w-md mx-auto mb-4"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(245, 98, 58, 0.2), transparent)' }}
        />
        <p className="text-xs" style={{ color: '#3f3f46', fontFamily: 'var(--font-dm-mono)' }}>
          FORGE Intelligence Report · Generated {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · Data sources: LinkedIn, Indeed, Naukri, GitHub Jobs API
        </p>
      </motion.div>
    </div>
  );
}
