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
        if (!categoryData) return null;

        return (
          <div key={category.key}>
            <div className="mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span>{category.icon}</span>
                {category.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(categoryData).map(([metricKey, metricData]: [string, any]) => (
                <MetricCard
                  key={metricKey}
                  name={formatMetricName(metricKey)}
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
  if (!data || !data.current_year) return null;

  const currentYear = data.current_year;
  const previousYear = data.previous_year;
  const currentValue = currentYear.value;
  const previousValue = previousYear?.value;
  const benchmark = currentYear.benchmark;
  const interpretation = currentYear.interpretation;
  const formula = currentYear.formula;
  const calculation = currentYear.calculation;

  // Calculate trend
  const trend = previousValue !== null && previousValue !== undefined
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold">{name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold">
                {typeof currentValue === 'number'
                  ? currentValue.toFixed(2)
                  : currentValue}
              </span>
              {trend !== null && (
                <Badge variant={trend >= 0 ? "default" : "destructive"} className="gap-1">
                  {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(trend).toFixed(1)}%
                </Badge>
              )}
            </div>
          </div>
          <Badge
            variant={status === 'good' ? 'default' : status === 'fair' ? 'secondary' : 'destructive'}
            className="ml-2"
          >
            {status === 'good' ? '🟢 Good' : status === 'fair' ? '🟡 Fair' : '🔴 Poor'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Progress Bar */}
        {benchmark && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>vs Benchmark: {benchmark}</span>
              <span>{progressValue.toFixed(0)}%</span>
            </div>
            <Progress
              value={progressValue}
              className={`h-2 ${
                status === 'good' ? 'bg-green-100' :
                status === 'fair' ? 'bg-yellow-100' :
                'bg-red-100'
              }`}
            />
          </div>
        )}

        {/* Year Comparison */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Current Year</p>
            <p className="font-semibold">{currentValue?.toFixed(2)}</p>
          </div>
          {previousValue !== null && previousValue !== undefined && (
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Previous Year</p>
              <p className="font-semibold">{previousValue.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Formula & Calculation */}
        {formula && (
          <div className="border-t pt-2 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Formula</p>
            <p className="text-xs font-mono bg-muted px-2 py-1 rounded">{formula}</p>
          </div>
        )}

        {calculation && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Calculation</p>
            <p className="text-xs font-mono bg-muted px-2 py-1 rounded">{calculation}</p>
          </div>
        )}

        {/* Interpretation */}
        {interpretation && (
          <div className="border-t pt-2">
            <p className="text-xs font-medium text-muted-foreground mb-1">💡 Interpretation</p>
            <p className="text-xs leading-relaxed">{interpretation}</p>
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
