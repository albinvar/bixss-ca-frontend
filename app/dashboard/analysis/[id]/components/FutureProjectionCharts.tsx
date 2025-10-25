import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
} from 'recharts';

interface GraphicalProjections {
  revenue_forecast_chart?: {
    labels: string[];
    actual_values: (number | null)[];
    expected_values: (number | null)[];
    min_range?: (number | null)[];
    max_range?: (number | null)[];
  };
  profit_forecast_chart?: {
    labels: string[];
    actual_values: (number | null)[];
    expected_values: (number | null)[];
    min_range?: (number | null)[];
    max_range?: (number | null)[];
  };
  metrics_forecast_chart?: {
    labels: string[];
    current_ratio?: number[];
    net_margin_percent?: number[];
    roe_percent?: number[];
  };
}

interface FutureOutlook {
  graphical_projections?: GraphicalProjections;
  growth_trajectory?: string;
  trajectory_description?: string;
  major_opportunities?: string[];
  potential_challenges?: string[];
}

interface FutureProjectionChartsProps {
  futureOutlook: FutureOutlook;
  currency?: string;
}

export function FutureProjectionCharts({ futureOutlook, currency = '₹' }: FutureProjectionChartsProps) {
  if (!futureOutlook?.graphical_projections) {
    return null;
  }

  const { graphical_projections } = futureOutlook;

  // Format large numbers
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    if (value >= 10000000) {
      return `${currency}${(value / 10000000).toFixed(2)}Cr`;
    } else if (value >= 100000) {
      return `${currency}${(value / 100000).toFixed(2)}L`;
    }
    return `${currency}${value.toFixed(0)}`;
  };

  // Prepare Revenue Forecast Data
  const revenueForecastData = graphical_projections.revenue_forecast_chart?.labels?.map((label, index) => ({
    year: label,
    actual: graphical_projections.revenue_forecast_chart?.actual_values[index],
    expected: graphical_projections.revenue_forecast_chart?.expected_values[index],
    min: graphical_projections.revenue_forecast_chart?.min_range?.[index],
    max: graphical_projections.revenue_forecast_chart?.max_range?.[index],
  })) || [];

  // Prepare Profit Forecast Data
  const profitForecastData = graphical_projections.profit_forecast_chart?.labels?.map((label, index) => ({
    year: label,
    actual: graphical_projections.profit_forecast_chart?.actual_values[index],
    expected: graphical_projections.profit_forecast_chart?.expected_values[index],
    min: graphical_projections.profit_forecast_chart?.min_range?.[index],
    max: graphical_projections.profit_forecast_chart?.max_range?.[index],
  })) || [];

  // Prepare Metrics Forecast Data
  const metricsForecastData = graphical_projections.metrics_forecast_chart?.labels?.map((label, index) => ({
    year: label,
    current_ratio: graphical_projections.metrics_forecast_chart?.current_ratio?.[index],
    net_margin: graphical_projections.metrics_forecast_chart?.net_margin_percent?.[index],
    roe: graphical_projections.metrics_forecast_chart?.roe_percent?.[index],
  })) || [];

  return (
    <div className="space-y-6">
      {/* Growth Trajectory Summary */}
      {futureOutlook.growth_trajectory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📈 {futureOutlook.growth_trajectory}
            </CardTitle>
            {futureOutlook.trajectory_description && (
              <CardDescription className="text-base mt-2">
                {futureOutlook.trajectory_description}
              </CardDescription>
            )}
          </CardHeader>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Forecast Chart */}
        {revenueForecastData.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Forecast (3-Year Projection)</CardTitle>
              <CardDescription>Historical actual vs projected revenue with min/max ranges</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={revenueForecastData} margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} width={90} />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="max"
                    fill="#d1fae5"
                    stroke="none"
                    name="Max Range"
                  />
                  <Area
                    type="monotone"
                    dataKey="min"
                    fill="#ffffff"
                    stroke="none"
                    name="Min Range"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#8884d8"
                    strokeWidth={3}
                    name="Actual"
                    dot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expected"
                    stroke="#10b981"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Expected"
                    dot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Profit Forecast Chart */}
        {profitForecastData.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Profit Forecast (3-Year Projection)</CardTitle>
              <CardDescription>Historical actual vs projected profit with min/max ranges</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={profitForecastData} margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} width={90} />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="max"
                    fill="#fef3c7"
                    stroke="none"
                    name="Max Range"
                  />
                  <Area
                    type="monotone"
                    dataKey="min"
                    fill="#ffffff"
                    stroke="none"
                    name="Min Range"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="Actual"
                    dot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expected"
                    stroke="#10b981"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Expected"
                    dot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics Forecast */}
        {metricsForecastData.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Key Metrics Forecast</CardTitle>
              <CardDescription>Projected financial health indicators over 3 years</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={metricsForecastData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis width={60} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="current_ratio"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Current Ratio"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="net_margin"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Net Margin %"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="roe"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="ROE %"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Opportunities and Challenges */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Major Opportunities */}
        {futureOutlook.major_opportunities && futureOutlook.major_opportunities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">🎯 Major Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {futureOutlook.major_opportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-sm">{opportunity}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Potential Challenges */}
        {futureOutlook.potential_challenges && futureOutlook.potential_challenges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-amber-600">⚠️ Potential Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {futureOutlook.potential_challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">!</span>
                    <span className="text-sm">{challenge}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
