'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface RiskGaugeProps {
  score: number;
  size?: number;
}

export default function RiskGauge({ score, size = 340 }: RiskGaugeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!svgRef.current || hasAnimated.current) return;
    hasAnimated.current = true;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = size;
    const height = size * 0.65;
    const radius = width * 0.42;
    const cx = width / 2;
    const cy = height - 30;
    const startAngle = -Math.PI / 2 - Math.PI * 0.25;
    const endAngle = Math.PI / 2 + Math.PI * 0.25;
    const totalAngle = endAngle - startAngle;

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g');

    // Background arc segments (green → yellow → orange → red)
    const zones = [
      { start: 0, end: 0.3, color: '#00e5a0' },
      { start: 0.3, end: 0.5, color: '#f5c542' },
      { start: 0.5, end: 0.7, color: '#f5943a' },
      { start: 0.7, end: 1.0, color: '#ef4444' },
    ];

    zones.forEach((zone) => {
      const arc = d3.arc<unknown>()
        .innerRadius(radius - 22)
        .outerRadius(radius)
        .startAngle(startAngle + zone.start * totalAngle)
        .endAngle(startAngle + zone.end * totalAngle)
        .cornerRadius(3);

      g.append('path')
        .attr('d', arc({} as unknown) as string)
        .attr('transform', `translate(${cx}, ${cy})`)
        .attr('fill', zone.color)
        .attr('opacity', 0.2);
    });

    // Animated foreground arc
    const scoreAngle = startAngle + (score / 100) * totalAngle;
    const scoreColor = score >= 70 ? '#ef4444' : score >= 50 ? '#f5943a' : score >= 30 ? '#f5c542' : '#00e5a0';

    const fgArc = d3.arc<unknown>()
      .innerRadius(radius - 22)
      .outerRadius(radius)
      .startAngle(startAngle)
      .cornerRadius(3);

    const fgPath = g.append('path')
      .attr('transform', `translate(${cx}, ${cy})`)
      .attr('fill', scoreColor)
      .attr('filter', `drop-shadow(0 0 8px ${scoreColor}66)`);

    // Needle
    const needleLen = radius - 35;
    const needleLine = g.append('line')
      .attr('x1', cx)
      .attr('y1', cy)
      .attr('stroke', '#e4e4e7')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round');

    // Center dot
    g.append('circle')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', 6)
      .attr('fill', '#e4e4e7');

    g.append('circle')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', 3)
      .attr('fill', '#08090d');

    // Score text
    const scoreText = g.append('text')
      .attr('x', cx)
      .attr('y', cy + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', scoreColor)
      .attr('font-size', '36px')
      .attr('font-weight', '800')
      .attr('font-family', 'var(--font-syne), sans-serif')
      .text('0%');

    // Label
    g.append('text')
      .attr('x', cx)
      .attr('y', cy + 60)
      .attr('text-anchor', 'middle')
      .attr('fill', '#71717a')
      .attr('font-size', '11px')
      .attr('letter-spacing', '0.1em')
      .attr('text-transform', 'uppercase')
      .text('OVERALL RISK SCORE');

    // Tick marks
    for (let i = 0; i <= 10; i++) {
      const angle = startAngle + (i / 10) * totalAngle;
      const x1 = cx + Math.cos(angle) * (radius + 6);
      const y1 = cy + Math.sin(angle) * (radius + 6);
      const x2 = cx + Math.cos(angle) * (radius + (i % 5 === 0 ? 14 : 10));
      const y2 = cy + Math.sin(angle) * (radius + (i % 5 === 0 ? 14 : 10));

      g.append('line')
        .attr('x1', x1).attr('y1', y1)
        .attr('x2', x2).attr('y2', y2)
        .attr('stroke', '#3f3f46')
        .attr('stroke-width', i % 5 === 0 ? 1.5 : 0.8);
    }

    // Animate
    const duration = 1800;
    const startTime = performance.now();

    function animateGauge(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentScore = eased * score;
      const currentAngle = startAngle + (currentScore / 100) * totalAngle;

      fgPath.attr('d', fgArc.endAngle(currentAngle)({} as unknown) as string);

      const nx = cx + Math.cos(currentAngle) * needleLen;
      const ny = cy + Math.sin(currentAngle) * needleLen;
      needleLine.attr('x2', nx).attr('y2', ny);

      scoreText.text(`${Math.round(currentScore)}%`);

      if (progress < 1) requestAnimationFrame(animateGauge);
    }

    requestAnimationFrame(animateGauge);
  }, [score, size]);

  return <svg ref={svgRef} />;
}
