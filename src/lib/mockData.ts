// ============ RISK ANALYSIS DATA ============

export const riskScore = {
  overall: 71,
  trend: 'increasing',
  timeline: 14,
  marketDemand: 43,
  transferableSkills: { current: 6, total: 12 },
  factors: [
    { name: 'Task Automation', score: 75, impact: 'high' },
    { name: 'Skill Obsolescence', score: 62, impact: 'medium' },
    { name: 'Market Demand', score: 45, impact: 'high' },
  ],
};

export const taskAutomation = [
  { task: 'Data Entry & Processing', percentage: 92, timeframe: '2025' },
  { task: 'Report Generation', percentage: 84, timeframe: '2026' },
  { task: 'Basic Code Review', percentage: 76, timeframe: '2026' },
  { task: 'Customer Support Triage', percentage: 68, timeframe: '2027' },
  { task: 'Content Drafting', percentage: 55, timeframe: '2027' },
  { task: 'Strategic Analysis', percentage: 22, timeframe: '2030+' },
];

export const skillDemandTrend = [
  { month: 'Jan', pythonSql: 82, pythonCloud: 45, mlAi: 30 },
  { month: 'Feb', pythonSql: 79, pythonCloud: 48, mlAi: 34 },
  { month: 'Mar', pythonSql: 76, pythonCloud: 52, mlAi: 39 },
  { month: 'Apr', pythonSql: 72, pythonCloud: 56, mlAi: 45 },
  { month: 'May', pythonSql: 68, pythonCloud: 60, mlAi: 52 },
  { month: 'Jun', pythonSql: 65, pythonCloud: 64, mlAi: 58 },
  { month: 'Jul', pythonSql: 61, pythonCloud: 67, mlAi: 63 },
  { month: 'Aug', pythonSql: 57, pythonCloud: 71, mlAi: 69 },
  { month: 'Sep', pythonSql: 53, pythonCloud: 74, mlAi: 74 },
  { month: 'Oct', pythonSql: 49, pythonCloud: 78, mlAi: 80 },
  { month: 'Nov', pythonSql: 45, pythonCloud: 81, mlAi: 85 },
  { month: 'Dec', pythonSql: 41, pythonCloud: 85, mlAi: 91 },
];

export const jobPostingVolume = [
  { role: 'Data Entry Clerk', change: -42 },
  { role: 'Junior Dev', change: -34 },
  { role: 'QA Manual', change: -28 },
  { role: 'Content Writer', change: -18 },
  { role: 'DevOps Engineer', change: 12 },
  { role: 'ML Engineer', change: 38 },
  { role: 'AI Product Mgr', change: 45 },
  { role: 'Prompt Engineer', change: 67 },
];

export const riskTimeline = [
  { month: 'Now', noAction: 71, pivotNow: 71 },
  { month: 'M2', noAction: 74, pivotNow: 65 },
  { month: 'M4', noAction: 78, pivotNow: 55 },
  { month: 'M6', noAction: 82, pivotNow: 42 },
  { month: 'M8', noAction: 86, pivotNow: 30 },
  { month: 'M10', noAction: 90, pivotNow: 20 },
  { month: 'M12', noAction: 93, pivotNow: 14 },
  { month: 'M14', noAction: 97, pivotNow: 8 },
];

export const competitorTable = [
  { skill: 'Python', you: true, market: true, gap: 'none' },
  { skill: 'SQL', you: true, market: true, gap: 'none' },
  { skill: 'Machine Learning', you: false, market: true, gap: 'critical' },
  { skill: 'Cloud (AWS/GCP)', you: false, market: true, gap: 'critical' },
  { skill: 'Docker/K8s', you: false, market: true, gap: 'high' },
  { skill: 'LLM Fine-tuning', you: false, market: true, gap: 'critical' },
  { skill: 'Data Visualization', you: true, market: true, gap: 'none' },
  { skill: 'CI/CD Pipelines', you: false, market: true, gap: 'high' },
  { skill: 'System Design', you: true, market: true, gap: 'low' },
  { skill: 'Prompt Engineering', you: false, market: true, gap: 'medium' },
];

export const keyInsights = [
  {
    type: 'danger' as const,
    title: 'Immediate Threat Detected',
    description:
      'Your primary skill set (Python + SQL) is now the baseline, not a differentiator. 4,200+ candidates in your city alone have identical profiles. Without ML/Cloud skills, you are competing on price alone.',
  },
  {
    type: 'warning' as const,
    title: 'Window Closing Fast',
    description:
      'Junior hiring in your domain dropped 34% in 90 days. Companies are replacing entry-level roles with AI agents. The pivot window narrows by ~6% every month you delay.',
  },
  {
    type: 'positive' as const,
    title: 'High-Value Pivot Available',
    description:
      'Your existing Python + Data Viz foundation gives you a 3-month head start on the ML Engineer path. Demand for this role grew 38% this quarter. Median salary: ₹18-32 LPA.',
  },
];

// ============ LANDING PAGE STATS ============

export const landingStats = [
  { value: 4200, suffix: '+', label: 'profiles competing for your role' },
  { value: 34, suffix: '%', label: 'drop in junior roles in 90 days' },
  { value: 5, suffix: '', label: 'months to completely reinvent your career' },
];

// ============ PIVOT OPTIONS ============

export const pivotOptions = [
  {
    id: 1,
    title: 'AI Product Manager',
    match: 82,
    salary: '$120k-$180k',
    demand: 'High',
    skills: ['Product Strategy', 'ML Basics', 'User Research'],
    timeToTransition: '6-9 months',
  },
  {
    id: 2,
    title: 'Data Analyst',
    match: 76,
    salary: '$80k-$120k',
    demand: 'Very High',
    skills: ['SQL', 'Python', 'Visualization'],
    timeToTransition: '3-6 months',
  },
  {
    id: 3,
    title: 'UX Researcher',
    match: 71,
    salary: '$90k-$140k',
    demand: 'Medium',
    skills: ['User Testing', 'Analysis', 'Communication'],
    timeToTransition: '4-8 months',
  },
];

// ============ JOB LISTINGS ============

export const jobListings = [
  {
    id: 1,
    title: 'Senior Product Manager - AI',
    company: 'TechCorp',
    location: 'Remote',
    salary: '$150k-$200k',
    posted: '2 days ago',
    match: 85,
    type: 'Full-time',
  },
  {
    id: 2,
    title: 'Data Analyst',
    company: 'DataFlow Inc',
    location: 'New York, NY',
    salary: '$90k-$120k',
    posted: '1 week ago',
    match: 78,
    type: 'Full-time',
  },
  {
    id: 3,
    title: 'UX Researcher',
    company: 'DesignHub',
    location: 'San Francisco, CA',
    salary: '$110k-$150k',
    posted: '3 days ago',
    match: 72,
    type: 'Contract',
  },
];

// ============ SKILL DEMAND (legacy) ============

export const skillDemand = [
  { month: 'Jan', ai: 45, cloud: 62, data: 58 },
  { month: 'Feb', ai: 52, cloud: 65, data: 60 },
  { month: 'Mar', ai: 58, cloud: 68, data: 62 },
  { month: 'Apr', ai: 65, cloud: 70, data: 64 },
  { month: 'May', ai: 72, cloud: 72, data: 66 },
  { month: 'Jun', ai: 78, cloud: 75, data: 68 },
];

// ============ BLOOMBERG TERMINAL DATA ============

export const tickerItems = [
  { symbol: 'JUNIOR.SDE/BLR', value: -34, type: 'pct' as const },
  { symbol: 'ML.OPS/BLR', value: 89, type: 'pct' as const },
  { symbol: 'RISK.SCORE', value: 71, type: 'raw' as const },
  { symbol: 'MARKET.DEMAND', value: '43/100', type: 'label' as const },
  { symbol: 'COMPETING.PROFILES', value: '4,247', type: 'label' as const },
  { symbol: 'DATA.ENG/HYD', value: 67, type: 'pct' as const },
  { symbol: 'AUTOMATION.INDEX', value: 'HIGH', type: 'label' as const },
  { symbol: 'CLOUD.ENG/PUN', value: 42, type: 'pct' as const },
  { symbol: 'SKILL.GAP', value: -28, type: 'pct' as const },
  { symbol: 'PIVOT.WINDOW', value: '5mo', type: 'label' as const },
];

export const skillHoldings = [
  { skill: 'Python', demand: 89, trend: '▲' as const, risk: 'green' as const, weight: 28, sparkline: [72, 78, 82, 89] },
  { skill: 'SQL', demand: 76, trend: '▼' as const, risk: 'yellow' as const, weight: 22, sparkline: [84, 81, 78, 76] },
  { skill: 'Excel', demand: 34, trend: '▼▼' as const, risk: 'red' as const, weight: 12, sparkline: [55, 48, 40, 34] },
  { skill: 'Git', demand: 71, trend: '→' as const, risk: 'green' as const, weight: 18, sparkline: [70, 71, 70, 71] },
  { skill: 'ETL', demand: 58, trend: '▼' as const, risk: 'yellow' as const, weight: 20, sparkline: [68, 65, 61, 58] },
];

export const careerValueData = [
  { month: 'Jan', you: 72, market: 65 },
  { month: 'Feb', you: 70, market: 66 },
  { month: 'Mar', you: 68, market: 67 },
  { month: 'Apr', you: 65, market: 68 },
  { month: 'May', you: 62, market: 70 },
  { month: 'Jun', you: 58, market: 71 },
  { month: 'Jul', you: 55, market: 73 },
  { month: 'Aug', you: 52, market: 74 },
  { month: 'Sep', you: 48, market: 76 },
  { month: 'Oct', you: 45, market: 77 },
  { month: 'Nov', you: 42, market: 79 },
  { month: 'Dec', you: 38, market: 80 },
];

export const roleDemandIndex = [
  { role: 'ML Eng', demand: 89, growing: true },
  { role: 'Data Eng', demand: 76, growing: true },
  { role: 'DevOps', demand: 72, growing: true },
  { role: 'SDE Jr', demand: 34, growing: false },
  { role: 'QA Man', demand: 22, growing: false },
  { role: 'Data Entry', demand: 12, growing: false },
];

export const riskAnalysisMetrics = [
  { label: 'AUTOMATION.PROB', value: '71%', color: '#ff3b5c' },
  { label: 'MARKET.VOLATILITY', value: 'HIGH', color: '#ff9500' },
  { label: 'SKILL.OBSOLESCENCE', value: '8.2mo', color: '#ff3b5c' },
  { label: 'DEMAND.RATIO', value: '0.08', color: '#ff3b5c' },
  { label: 'PIVOT.READINESS', value: '67%', color: '#34d399' },
  { label: 'SAFETY.SCORE', value: '3.1/10', color: '#ff3b5c' },
];

export const skillCorrelationMatrix = {
  skills: ['Python', 'SQL', 'Cloud', 'ML', 'Docker'],
  data: [
    [1.0, 0.72, 0.45, 0.68, 0.31],
    [0.72, 1.0, 0.38, 0.52, 0.22],
    [0.45, 0.38, 1.0, 0.61, 0.85],
    [0.68, 0.52, 0.61, 1.0, 0.55],
    [0.31, 0.22, 0.85, 0.55, 1.0],
  ],
};

export const marketVolatility = [
  { role: 'Prompt Eng', volatility: 92, direction: 'up' as const },
  { role: 'ML Engineer', volatility: 78, direction: 'up' as const },
  { role: 'DevOps', volatility: 45, direction: 'up' as const },
  { role: 'SDE Junior', volatility: 67, direction: 'down' as const },
  { role: 'QA Manual', volatility: 82, direction: 'down' as const },
  { role: 'Data Entry', volatility: 95, direction: 'down' as const },
];

export const pivotSuggestions = [
  { role: 'ML Engineer', match: 74, salaryDelta: '+₹8L', indicator: 'green' as const },
  { role: 'Data Analyst', match: 82, salaryDelta: '+₹3L', indicator: 'green' as const },
  { role: 'Cloud Architect', match: 58, salaryDelta: '+₹14L', indicator: 'yellow' as const },
];

export const hiringCalendar = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  intensity: [2, 1, 3, 3, 2, 1, 1, 2, 3, 3, 2, 1] as const, // 1=low/freeze, 2=medium, 3=high
  events: [
    { label: 'Q2.HIRING.SEASON', date: 'APR 15' },
    { label: 'FLIPKART.INTAKE', date: 'MAY 2026' },
    { label: 'INFOSYS.FREEZE.END', date: 'JUN 2026' },
  ],
};

export const newsTicker = [
  'COGNIZANT: Automation of 8,400 junior roles confirmed Q2 2026',
  'FLIPKART: ML Ops team expanding — 34 open roles Bangalore',
  'MARKET: Junior SDE demand index hits 18-month low',
  'WIPRO: Skills transition program launched for 12,000 engineers',
  'TCS: Cloud engineering division hiring 2,800 across 6 cities',
  'AMAZON: AI/ML intern conversion rate drops to 12% from 38%',
  'INFOSYS: Generative AI practice adds 450 roles in Hyderabad',
];
