import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SmartMetricsSectionProps {
  calculatedMetrics: any;
  availableYears: string[];
}

export function SmartMetricsSection({ calculatedMetrics, availableYears }: SmartMetricsSectionProps) {
  if (!calculatedMetrics) return null;

  const categories = [
    { key: 'liquidity_ratios', title: 'Liquidity Ratios', icon: '💧', description: 'Ability to meet short-term obligations' },
    { key: 'profitability_ratios', title: 'Profitability Ratios', icon: '💰', description: 'Efficiency in generating profits' },
    { key: 'leverage_ratios', title: 'Leverage Ratios', icon: '⚖️', description: 'Debt and financial structure' },
    { key: 'efficiency_ratios', title: 'Efficiency Ratios', icon: '⚡', description: 'Asset and resource utilization' },
  ];

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryData = calculatedMetrics[category.key];
        if (!categoryData || !Array.isArray(categoryData) || categoryData.length === 0) return null;

        // Separate calculated and uncalculated metrics
        const calculatedRatios = categoryData.filter(m => m.calculated === true);
        const uncalculatedRatios = categoryData.filter(m => m.calculated === false);

        return (
          <div key={category.key}>
            <div className="mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span>{category.icon}</span>
                {category.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
            </div>

            {/* Calculated Metrics */}
            {calculatedRatios.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                {calculatedRatios.map((metricData: any, index: number) => (
                  <SmartMetricCard
                    key={index}
                    metric={metricData}
                    availableYears={availableYears}
                  />
                ))}
              </div>
            )}

            {/* Uncalculated Metrics */}
            {uncalculatedRatios.length > 0 && (
              <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription>
                  <div className="mt-2 space-y-2">
                    <p className="font-medium text-sm">Unable to calculate the following metrics:</p>
                    <ul className="text-sm space-y-1 ml-4">
                      {uncalculatedRatios.map((metric: any, idx: number) => (
                        <li key={idx} className="list-disc">
                          <strong>{metric.metric}</strong> - Missing: {metric.missing_components?.join(', ') || 'required data'}
                          {metric.note && (
                            <p className="text-xs text-muted-foreground mt-1">{metric.note}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SmartMetricCard({ metric, availableYears }: {
  metric: any;
  availableYears: string[];
}) {
  const latestYear = availableYears[0];
  const previousYear = availableYears[1] || null;

  const currentValue = metric.values?.[latestYear] ?? null;
  const previousValue = previousYear ? (metric.values?.[previousYear] ?? null) : null;

  // Calculate trend
  const trend = (previousValue !== null && previousValue !== undefined &&
                  typeof currentValue === 'number' && typeof previousValue === 'number')
    ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100
    : null;

  const getTrendIcon = () => {
    if (trend === null) return <Minus className="h-4 w-4 text-gray-400" />;
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getStatusColor = () => {
    if (metric.status === 'Strong' || metric.status === 'Good') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (metric.status === 'Adequate' || metric.status === 'Fair') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (metric.status === 'Weak' || metric.status === 'Poor') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              {metric.metric}
            </CardTitle>
            {metric.formula && (
              <CardDescription className="text-xs mt-1">
                {metric.formula}
              </CardDescription>
            )}
          </div>
          {getTrendIcon()}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Current Value */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {currentValue !== null
                ? (typeof currentValue === 'number'
                  ? currentValue.toFixed(2)
                  : currentValue)
                : 'N/A'}
            </span>
            {metric.status && (
              <Badge className={getStatusColor()}>
                {metric.status}
              </Badge>
            )}
          </div>

          {trend !== null && (
            <p className="text-sm text-muted-foreground mt-1">
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend).toFixed(1)}% vs {previousYear}
            </p>
          )}
        </div>

        {/* Benchmark */}
        {metric.benchmark_range && (
          <div className="text-sm">
            <span className="text-muted-foreground">Benchmark: </span>
            <span className="font-medium">{metric.benchmark_range}</span>
          </div>
        )}

        {/* Calculation Breakdown - Show Actual Values */}
        {metric.calculation_breakdown && (
          <div className="text-xs space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Calculation Details:</p>
            {Object.entries(metric.calculation_breakdown).map(([year, breakdown]: [string, any]) => (
              <div key={year} className="space-y-1">
                <p className="font-medium text-slate-600 dark:text-slate-400">{year}:</p>
                <p className="font-mono text-slate-800 dark:text-slate-200">
                  {breakdown.calculation_string || 'N/A'}
                </p>
                {breakdown && typeof breakdown === 'object' && (
                  <div className="ml-2 text-slate-600 dark:text-slate-400">
                    {Object.entries(breakdown)
                      .filter(([key]) => key !== 'calculation_string')
                      .map(([key, value]: [string, any]) => (
                        <div key={key} className="text-[10px]">
                          {key}: {typeof value === 'number' ? new Intl.NumberFormat('en-IN').format(value) : value}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Components Used (fallback if no calculation_breakdown) */}
        {!metric.calculation_breakdown && metric.components_used && metric.components_used.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-xs text-muted-foreground cursor-help">
                  ℹ️ Based on {metric.components_used.length} data point(s)
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs space-y-1">
                  <p className="font-semibold">Components used:</p>
                  <ul className="list-disc ml-3">
                    {metric.components_used.map((comp: string, idx: number) => (
                      <li key={idx}>{comp}</li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* CA Insight */}
        {metric.insight && (
          <div className="pt-3 border-t">
            <p className="text-sm leading-relaxed">{metric.insight}</p>
          </div>
        )}

        {/* Recommendation */}
        {metric.recommendation && (
          <div className="pt-2 border-t bg-blue-50 dark:bg-blue-950 -mx-6 -mb-6 px-6 py-3 rounded-b-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              💡 {metric.recommendation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
