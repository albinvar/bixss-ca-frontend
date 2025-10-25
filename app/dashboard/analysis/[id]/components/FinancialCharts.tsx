import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface GraphicalData {
  revenue_trend?: {
    labels: string[];
    values: number[];
  };
  profit_trend?: {
    labels: string[];
    values: number[];
  };
  liquidity_comparison?: {
    labels: string[];
    year1_values: number[];
    year2_values: number[];
  };
  asset_composition?: {
    labels: string[];
    values: number[];
  };
}

interface FinancialChartsProps {
  graphicalData: GraphicalData;
  currency?: string;
}

export function FinancialCharts({ graphicalData, currency = '₹' }: FinancialChartsProps) {
  if (!graphicalData || Object.keys(graphicalData).length === 0) {
    return null;
  }

  // Format large numbers to Lakhs/Crores
  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `${currency}${(value / 10000000).toFixed(2)}Cr`;
    } else if (value >= 100000) {
      return `${currency}${(value / 100000).toFixed(2)}L`;
    }
    return `${currency}${value.toFixed(0)}`;
  };

  // Prepare data for Revenue Trend Chart
  const revenueData = graphicalData.revenue_trend?.labels?.map((label, index) => ({
    year: label,
    revenue: graphicalData.revenue_trend?.values[index] || 0,
  })) || [];

  // Prepare data for Profit Trend Chart
  const profitData = graphicalData.profit_trend?.labels?.map((label, index) => ({
    year: label,
    profit: graphicalData.profit_trend?.values[index] || 0,
  })) || [];

  // Prepare data for Liquidity Comparison
  const liquidityData = graphicalData.liquidity_comparison?.labels?.map((label, index) => ({
    metric: label,
    year1: graphicalData.liquidity_comparison?.year1_values[index] || 0,
    year2: graphicalData.liquidity_comparison?.year2_values[index] || 0,
  })) || [];

  // Prepare data for Asset Composition
  const assetData = graphicalData.asset_composition?.labels?.map((label, index) => ({
    name: label,
    value: graphicalData.asset_composition?.values[index] || 0,
  })) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Revenue Trend Chart */}
      {revenueData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Year-over-year revenue comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={formatCurrency} width={80} />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Profit Trend Chart */}
      {profitData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Profit Trend</CardTitle>
            <CardDescription>Year-over-year profit comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={formatCurrency} width={80} />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="profit" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Liquidity Comparison Chart */}
      {liquidityData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Liquidity Ratios Comparison</CardTitle>
            <CardDescription>Year-over-year liquidity metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={liquidityData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis width={60} />
                <Tooltip />
                <Legend />
                <Bar dataKey="year1" fill="#8884d8" name={revenueData[0]?.year || 'Current Year'} />
                <Bar dataKey="year2" fill="#82ca9d" name={revenueData[1]?.year || 'Previous Year'} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Asset Composition Pie Chart */}
      {assetData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Asset Composition</CardTitle>
            <CardDescription>Distribution of total assets</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
