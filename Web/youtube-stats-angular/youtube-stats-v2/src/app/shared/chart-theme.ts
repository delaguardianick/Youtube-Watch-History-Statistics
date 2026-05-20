/**
 * Shared ECharts theme — Modernize (dark) + YouTube red.
 *
 * Import these helpers in every chart component so all 13 visualizations share one
 * coherent look (red accent, Plus Jakarta Sans, subtle dashed gridlines, dark
 * tooltips, no toolbar). Hex values mirror the CSS tokens in styles.scss.
 *
 * Usage:
 *   import { CHART, baseChart, valueAxis, categoryAxis, areaGradient } from '../../shared/chart-theme';
 *   this.chartOptions = { ...baseChart(), xAxis: categoryAxis({ data }), ... };
 */
import type { EChartsOption } from 'echarts';

export const CHART = {
  font: "'Plus Jakarta Sans', sans-serif",
  text: '#eaeff4',
  muted: '#8d9bb5',
  faint: '#5f6e8a',
  surface: '#2a3447',
  elevated: '#323d54',
  border: '#333f55',
  grid: 'rgba(255,255,255,0.07)',

  accent: '#ff3621',
  accent2: '#ff6a52',
  accentSoft: 'rgba(255,54,33,0.16)',
  success: '#13deb9',
  error: '#fa896b',
  warning: '#ffae1f',

  /** Multi-series palette, anchored on red — only when several categories must be
   *  distinguished (e.g. genres). Prefer a single accent everywhere else. */
  palette: ['#ff3621', '#ff6a52', '#ffae1f', '#13deb9', '#5d87ff', '#a78bfa', '#fa896b', '#8d9bb5'],

  /** Sequential ramp for heatmaps: near-background -> deep red -> bright red.
   *  Never white; a value of 0 should sit just above the card background. */
  heatRamp: ['#222c3e', '#3a1c1f', '#7a1d14', '#c1230f', '#ff3621'],
};

/** Base option every chart spreads first, then overrides. */
export function baseChart(): EChartsOption {
  return {
    color: [CHART.accent],
    backgroundColor: 'transparent',
    textStyle: { fontFamily: CHART.font, color: CHART.text },
    animationDuration: 700,
    animationEasing: 'cubicOut',
    grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
    tooltip: {
      trigger: 'item',
      backgroundColor: CHART.surface,
      borderColor: CHART.border,
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: CHART.text, fontFamily: CHART.font, fontSize: 12 },
      extraCssText: 'box-shadow: 0 8px 24px rgba(0,0,0,0.4); border-radius: 8px;',
    },
  };
}

interface AxisOpts {
  data?: (string | number)[];
  name?: string;
  showSplit?: boolean;
}

/** Category axis (typically x). */
export function categoryAxis(opts: AxisOpts = {}): any {
  return {
    type: 'category',
    data: opts.data,
    name: opts.name,
    nameTextStyle: { color: CHART.muted, fontFamily: CHART.font, fontSize: 11 },
    axisLine: { lineStyle: { color: CHART.border } },
    axisTick: { show: false },
    axisLabel: { color: CHART.muted, fontFamily: CHART.font, fontSize: 11 },
    splitLine: { show: false },
  };
}

/** Value axis (typically y) with subtle dashed gridlines. */
export function valueAxis(opts: AxisOpts = {}): any {
  return {
    type: 'value',
    name: opts.name,
    nameTextStyle: { color: CHART.muted, fontFamily: CHART.font, fontSize: 11, align: 'left' },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: CHART.muted, fontFamily: CHART.font, fontSize: 11 },
    splitLine: {
      show: opts.showSplit !== false,
      lineStyle: { color: CHART.grid, type: 'dashed' },
    },
  };
}

/** Vertical gradient for area fills (accent -> transparent). */
export function areaGradient(color: string = CHART.accent): any {
  return {
    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [
      { offset: 0, color: hexA(color, 0.45) },
      { offset: 1, color: hexA(color, 0.0) },
    ],
  };
}

/** Hex (#rrggbb) -> rgba string with given alpha. */
export function hexA(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
