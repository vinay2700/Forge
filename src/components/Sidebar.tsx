'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Briefcase, FileText, User } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/dashboard/risk', label: 'Risk Analysis', icon: AlertTriangle },
  { href: '/dashboard/pivot', label: 'Pivot Options', icon: TrendingUp },
  { href: '/dashboard/jobs', label: 'Job Market', icon: Briefcase },
  { href: '/dashboard/resume', label: 'Resume', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState('User Name');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.name) setUserName(detail.name);
      if (detail?.current_role) setUserRole(detail.current_role);
    };
    window.addEventListener('forge-analysis', handler);
    return () => window.removeEventListener('forge-analysis', handler);
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] border-r border-[var(--border)] bg-[var(--bg)] flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-syne)' }}>
          <span className="text-[var(--primary)]">FORGE</span>
        </h1>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors',
                isActive
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5'
              )}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 mb-4">
        <div className="glass-card p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center">
            <User size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-[var(--text-muted)] truncate">{userRole || 'user@email.com'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
