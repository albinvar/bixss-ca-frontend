import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsSectionProps {
  metrics: any;
}

export function MetricsSection({ metrics }: MetricsSectionProps) {
  const categories = [
    { key: 'liquidity_ratios', title: 'Liquidity Ratios', icon: '💧', description: 'Ability to meet short-term obligations' },
    { key: 'profitability_ratios', title: 'Profitability Ratios', icon: '💰', description: 'Efficiency in generating profits' },
    { key: 'leverage_ratios', title: 'Leverage Ratios', icon: '⚖️', description: 'Debt and financial structure' },
    { key: 'efficiency_ratios', title: 'Efficiency Ratios', icon: '⚡', description: 'Asset and resource utilization' },
    { key: 'cash_flow_ratios', title: 'Cash Flow Ratios', icon: '💵', description: 'Cash generation capabilities' },
    { key: 'growth_metrics', title: 'Growth Metrics', icon: '📈', description: 'Year-over-year growth rates' },
    { key: 'working_capital_metrics', title: 'Working Capital Metrics', icon: '🔄', description: 'Short-term financial health' },
  ];

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryData = metrics[category.key];
        if (!categoryData || !Array.isArray(categoryData)) return null;

        return (
          <div key={category.key} className="p-6 rounded-2xl bg-gradient-to-br from-white/60 to-slate-50/60 dark:from-slate-900/60 dark:to-slate-800/60 backdrop-blur-sm border border-slate-200/40 dark:border-slate-800/40 shadow-lg">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  {category.title}
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 ml-14">{category.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {categoryData.map((metricData: any, index: number) => (
                <MetricCard
                  key={index}
                  name={metricData.metric || `Metric ${index + 1}`}
                  data={metricData}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetricCard({ name, data }: { name: string; data: any }) {
  // Handle array-based metrics structure from Gemini
  if (!data) return null;

  // Extract values - data is an array element with currentYear, previousYear, etc.
  const currentValue = typeof data.currentYear === 'string'
    ? parseFloat(data.currentYear.replace(/[^0-9.-]/g, '')) || data.currentYear
    : data.currentYear;
  const previousValue = typeof data.previousYear === 'string'
    ? parseFloat(data.previousYear.replace(/[^0-9.-]/g, '')) || data.previousYear
    : data.previousYear;
  const benchmark = data.benchmark;
  const formula = data.formula;
  const commentary = data.commentary;

  // Calculate trend
  const trend = (previousValue !== null && previousValue !== undefined && typeof currentValue === 'number' && typeof previousValue === 'number')
    ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100
    : null;

  // Determine status based on benchmark comparison
  const getStatus = () => {
    if (!benchmark) return 'neutral';

    const benchmarkStr = benchmark.toString().toLowerCase();

    // Handle percentage benchmarks
    if (benchmarkStr.includes('%')) {
      const benchmarkValue = parseFloat(benchmarkStr.replace(/[^0-9.-]/g, ''));
      if (benchmarkStr.includes('+') || benchmarkStr.includes('>')) {
        return currentValue >= benchmarkValue ? 'good' : currentValue >= benchmarkValue * 0.8 ? 'fair' : 'poor';
      } else if (benchmarkStr.includes('<')) {
        return currentValue <= benchmarkValue ? 'good' : currentValue <= benchmarkValue * 1.2 ? 'fair' : 'poor';
      }
    }

    // Handle ratio benchmarks
    const benchmarkValue = parseFloat(benchmarkStr.replace(/[^0-9.]/g, ''));
    if (benchmarkStr.includes('+') || benchmarkStr.includes('>')) {
      return currentValue >= benchmarkValue ? 'good' : currentValue >= benchmarkValue * 0.8 ? 'fair' : 'poor';
    } else if (benchmarkStr.includes('<')) {
      return currentValue <= benchmarkValue ? 'good' : currentValue <= benchmarkValue * 1.2 ? 'fair' : 'poor';
    }

    return 'neutral';
  };

  const status = getStatus();

  // Calculate progress bar value (normalized to 0-100)
  const getProgressValue = () => {
    if (!benchmark) return 50;

    const benchmarkStr = benchmark.toString().toLowerCase();
    const benchmarkValue = parseFloat(benchmarkStr.replace(/[^0-9.]/g, ''));

    if (!benchmarkValue) return 50;

    // For ratios/percentages, normalize against benchmark
    const ratio = (currentValue / benchmarkValue) * 100;
    return Math.min(Math.max(ratio, 0), 100);
  };

  const progressValue = getProgressValue();

  return (
    <Card className="border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-300">{name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                {typeof currentValue === 'number'
                  ? currentValue.toFixed(2)
                  : currentValue}
              </span>
              {trend !== null && (
                <Badge variant={trend >= 0 ? "default" : "destructive"} className="gap-1 shadow-sm">
                  {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(trend).toFixed(1)}%
                </Badge>
              )}
            </div>
          </div>
          <Badge
            variant={status === 'good' ? 'default' : status === 'fair' ? 'secondary' : 'destructive'}
            className="ml-2 shadow-sm"
          >
            {status === 'good' ? '🟢 Good' : status === 'fair' ? '🟡 Fair' : '🔴 Poor'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Progress Bar */}
        {benchmark && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
              <span>vs Benchmark: {benchmark}</span>
              <span>{progressValue.toFixed(0)}%</span>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  status === 'good' ? 'bg-gradient-to-r from-emerald-500 to-green-600' :
                  status === 'fair' ? 'bg-gradient-to-r from-amber-500 to-yellow-600' :
                  'bg-gradient-to-r from-red-500 to-rose-600'
                }`}
                style={{ width: `${progressValue}%` }}
              />
            </div>
          </div>
        )}

        {/* Year Comparison */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
            <p className="text-blue-600 dark:text-blue-400 text-xs font-medium">Current Year</p>
            <p className="font-bold text-blue-700 dark:text-blue-300 text-base">
              {typeof currentValue === 'number' ? currentValue.toFixed(2) : currentValue}
            </p>
          </div>
          {previousValue !== null && previousValue !== undefined && (
            <div className="space-y-1 p-3 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/30 rounded-lg border border-slate-200/50 dark:border-slate-700/30">
              <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">Previous Year</p>
              <p className="font-bold text-slate-700 dark:text-slate-300 text-base">
                {typeof previousValue === 'number' ? previousValue.toFixed(2) : previousValue}
              </p>
            </div>
          )}
        </div>

        {/* Formula */}
        {formula && (
          <div className="border-t pt-2 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Formula</p>
            <p className="text-xs font-mono bg-muted px-2 py-1 rounded">{formula}</p>
          </div>
        )}

        {/* Commentary */}
        {commentary && (
          <div className="border-t pt-2">
            <p className="text-xs font-medium text-muted-foreground mb-1">💡 Analysis</p>
            <p className="text-xs leading-relaxed">{commentary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatMetricName(key: string): string {
  // Convert snake_case to Title Case
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/Roa/g, 'ROA')
    .replace(/Roe/g, 'ROE')
    .replace(/Roce/g, 'ROCE')
    .replace(/Roic/g, 'ROIC')
    .replace(/Ebitda/g, 'EBITDA')
    .replace(/Ebit/g, 'EBIT')
    .replace(/Dso/g, 'DSO')
    .replace(/Dio/g, 'DIO')
    .replace(/Dpo/g, 'DPO')
    .replace(/Ppe/g, 'PP&E');
}
