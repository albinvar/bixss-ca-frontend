"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Building,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  BarChart3,
  LineChart,
  Download,
} from 'lucide-react';
import { financialAnalysisApi } from '@/lib/financial-analysis-api';
import { analysisApi } from '@/lib/api';
import { toast } from 'sonner';
import { MetricsSection } from './components/MetricsSection';
import { OutlookSection } from './components/OutlookSection';

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (analysisId) {
      fetchAnalysisDetails();
    }
  }, [analysisId]);

  const fetchAnalysisDetails = async () => {
    setLoading(true);
    try {
      // Call Node.js backend instead of Python
      const response = await analysisApi.getById(analysisId);
      if (response.success && response.data) {
        setAnalysis(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Failed to fetch analysis:', error);
      toast.error('Failed to load analysis details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <p className="text-muted-foreground">Analysis not found</p>
          <Button onClick={() => router.push('/dashboard/analysis')}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const companyInfo = analysis.company_information || {};
  const healthAnalysis = analysis.health_analysis || {};
  const balanceSheet = analysis.balance_sheet_data || {};
  const incomeStatement = analysis.income_statement_data || {};
  const cashFlow = analysis.cash_flow_data || {};
  const metrics = analysis.financial_metrics || {};
  const trendAnalysis = analysis.trend_analysis || {};
  const riskAssessment = analysis.risk_assessment || {};
  const industryBench = analysis.industry_benchmarking || {};

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard/analysis')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{companyInfo.company_name || 'Company Analysis'}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {companyInfo.financial_period || 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {companyInfo.industry_sector || 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {companyInfo.document_type || 'Financial Statement'}
                </span>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="overview" className="gap-2">
              <FileText className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Calculated Metrics
            </TabsTrigger>
            <TabsTrigger value="outlook" className="gap-2">
              <LineChart className="h-4 w-4" />
              Future Outlook
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewSection
              companyInfo={companyInfo}
              healthAnalysis={healthAnalysis}
              balanceSheet={balanceSheet}
              incomeStatement={incomeStatement}
              cashFlow={cashFlow}
            />
          </TabsContent>

          {/* METRICS TAB */}
          <TabsContent value="metrics" className="space-y-6">
            <MetricsSection metrics={metrics} />
          </TabsContent>

          {/* OUTLOOK TAB */}
          <TabsContent value="outlook" className="space-y-6">
            <OutlookSection
              healthAnalysis={healthAnalysis}
              trendAnalysis={trendAnalysis}
              riskAssessment={riskAssessment}
              industryBench={industryBench}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// OVERVIEW SECTION COMPONENT
function OverviewSection({ companyInfo, healthAnalysis, balanceSheet, incomeStatement, cashFlow }: any) {
  return (
    <div className="space-y-6">
      {/* Key Highlights */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {healthAnalysis.key_strengths?.map((strength: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span className="text-sm">{strength}</span>
                </li>
              )) || <p className="text-sm text-muted-foreground">No data available</p>}
            </ul>
          </CardContent>
        </Card>

        {/* Areas of Concern */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              Areas of Concern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {healthAnalysis.areas_of_concern?.map((concern: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span className="text-sm">{concern}</span>
                </li>
              )) || <p className="text-sm text-muted-foreground">No data available</p>}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Financial Statements */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Statements</CardTitle>
          <CardDescription>Year-over-year comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="balance-sheet" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
              <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
              <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
            </TabsList>

            <TabsContent value="balance-sheet" className="space-y-4">
              <BalanceSheetTable data={balanceSheet} />
            </TabsContent>

            <TabsContent value="income-statement" className="space-y-4">
              <IncomeStatementTable data={incomeStatement} />
            </TabsContent>

            <TabsContent value="cash-flow" className="space-y-4">
              <CashFlowTable data={cashFlow} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}


// Financial Statement Tables
function BalanceSheetTable({ data }: any) {
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return `₹${(value / 100000).toFixed(2)}L`;
  };

  const calculateChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Assets */}
      <div>
        <h4 className="font-semibold mb-3">ASSETS</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="pb-2 font-medium">Item</th>
                <th className="pb-2 font-medium text-right">Current Year</th>
                <th className="pb-2 font-medium text-right">Previous Year</th>
                <th className="pb-2 font-medium text-right">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-2 pl-4 text-muted-foreground">Cash & Bank</td>
                <td className="py-2 text-right">{formatCurrency(data.assets?.current_assets?.cash_and_bank?.current_year)}</td>
                <td className="py-2 text-right">{formatCurrency(data.assets?.current_assets?.cash_and_bank?.previous_year)}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      data.assets?.current_assets?.cash_and_bank?.current_year,
                      data.assets?.current_assets?.cash_and_bank?.previous_year
                    );
                    if (change === null) return 'N/A';
                    return (
                      <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                      </span>
                    );
                  })()}
                </td>
              </tr>
              <tr>
                <td className="py-2 pl-4 text-muted-foreground">Accounts Receivable</td>
                <td className="py-2 text-right">{formatCurrency(data.assets?.current_assets?.accounts_receivable?.current_year)}</td>
                <td className="py-2 text-right">{formatCurrency(data.assets?.current_assets?.accounts_receivable?.previous_year)}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      data.assets?.current_assets?.accounts_receivable?.current_year,
                      data.assets?.current_assets?.accounts_receivable?.previous_year
                    );
                    if (change === null) return 'N/A';
                    return (
                      <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                      </span>
                    );
                  })()}
                </td>
              </tr>
              <tr>
                <td className="py-2 pl-4 text-muted-foreground">Inventory</td>
                <td className="py-2 text-right">{formatCurrency(data.assets?.current_assets?.inventory?.current_year)}</td>
                <td className="py-2 text-right">{formatCurrency(data.assets?.current_assets?.inventory?.previous_year)}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      data.assets?.current_assets?.inventory?.current_year,
                      data.assets?.current_assets?.inventory?.previous_year
                    );
                    if (change === null) return 'N/A';
                    return (
                      <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                      </span>
                    );
                  })()}
                </td>
              </tr>
              <tr className="font-semibold">
                <td className="py-2">Total Current Assets</td>
                <td className="py-2 text-right">{formatCurrency(data.assets?.current_assets?.total_current_assets?.current_year)}</td>
                <td className="py-2 text-right">{formatCurrency(data.assets?.current_assets?.total_current_assets?.previous_year)}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      data.assets?.current_assets?.total_current_assets?.current_year,
                      data.assets?.current_assets?.total_current_assets?.previous_year
                    );
                    if (change === null) return 'N/A';
                    return (
                      <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                      </span>
                    );
                  })()}
                </td>
              </tr>
              <tr>
                <td className="py-2 pl-4 text-muted-foreground">Property, Plant & Equipment</td>
                <td className="py-2 text-right">{formatCurrency(data.assets?.non_current_assets?.property_plant_equipment?.current_year)}</td>
                <td className="py-2 text-right">{formatCurrency(data.assets?.non_current_assets?.property_plant_equipment?.previous_year)}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      data.assets?.non_current_assets?.property_plant_equipment?.current_year,
                      data.assets?.non_current_assets?.property_plant_equipment?.previous_year
                    );
                    if (change === null) return 'N/A';
                    return (
                      <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                      </span>
                    );
                  })()}
                </td>
              </tr>
              <tr className="font-semibold border-t-2">
                <td className="py-2">TOTAL ASSETS</td>
                <td className="py-2 text-right">{formatCurrency(data.assets?.total_assets?.current_year)}</td>
                <td className="py-2 text-right">{formatCurrency(data.assets?.total_assets?.previous_year)}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      data.assets?.total_assets?.current_year,
                      data.assets?.total_assets?.previous_year
                    );
                    if (change === null) return 'N/A';
                    return (
                      <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                      </span>
                    );
                  })()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Liabilities & Equity */}
      <div>
        <h4 className="font-semibold mb-3">LIABILITIES & EQUITY</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="pb-2 font-medium">Item</th>
                <th className="pb-2 font-medium text-right">Current Year</th>
                <th className="pb-2 font-medium text-right">Previous Year</th>
                <th className="pb-2 font-medium text-right">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-2 pl-4 text-muted-foreground">Accounts Payable</td>
                <td className="py-2 text-right">{formatCurrency(data.liabilities?.current_liabilities?.accounts_payable?.current_year)}</td>
                <td className="py-2 text-right">{formatCurrency(data.liabilities?.current_liabilities?.accounts_payable?.previous_year)}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      data.liabilities?.current_liabilities?.accounts_payable?.current_year,
                      data.liabilities?.current_liabilities?.accounts_payable?.previous_year
                    );
                    if (change === null) return 'N/A';
                    return (
                      <span className={change >= 0 ? 'text-red-600' : 'text-green-600'}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                      </span>
                    );
                  })()}
                </td>
              </tr>
              <tr>
                <td className="py-2 pl-4 text-muted-foreground">Short-term Debt</td>
                <td className="py-2 text-right">{formatCurrency(data.liabilities?.current_liabilities?.short_term_debt?.current_year)}</td>
                <td className="py-2 text-right">{formatCurrency(data.liabilities?.current_liabilities?.short_term_debt?.previous_year)}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      data.liabilities?.current_liabilities?.short_term_debt?.current_year,
                      data.liabilities?.current_liabilities?.short_term_debt?.previous_year
                    );
                    if (change === null) return 'N/A';
                    return (
                      <span className={change >= 0 ? 'text-red-600' : 'text-green-600'}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                      </span>
                    );
                  })()}
                </td>
              </tr>
              <tr className="font-semibold">
                <td className="py-2">Total Current Liabilities</td>
                <td className="py-2 text-right">{formatCurrency(data.liabilities?.current_liabilities?.total_current_liabilities?.current_year)}</td>
                <td className="py-2 text-right">{formatCurrency(data.liabilities?.current_liabilities?.total_current_liabilities?.previous_year)}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      data.liabilities?.current_liabilities?.total_current_liabilities?.current_year,
                      data.liabilities?.current_liabilities?.total_current_liabilities?.previous_year
                    );
                    if (change === null) return 'N/A';
                    return (
                      <span className={change >= 0 ? 'text-red-600' : 'text-green-600'}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                      </span>
                    );
                  })()}
                </td>
              </tr>
              <tr className="font-semibold">
                <td className="py-2">Total Equity</td>
                <td className="py-2 text-right">{formatCurrency(data.equity?.total_equity?.current_year)}</td>
                <td className="py-2 text-right">{formatCurrency(data.equity?.total_equity?.previous_year)}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      data.equity?.total_equity?.current_year,
                      data.equity?.total_equity?.previous_year
                    );
                    if (change === null) return 'N/A';
                    return (
                      <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                      </span>
                    );
                  })()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function IncomeStatementTable({ data }: any) {
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return `₹${(value / 100000).toFixed(2)}L`;
  };

  const calculateChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr className="text-left">
            <th className="pb-2 font-medium">Item</th>
            <th className="pb-2 font-medium text-right">Current Year</th>
            <th className="pb-2 font-medium text-right">Previous Year</th>
            <th className="pb-2 font-medium text-right">Change</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          <tr className="font-semibold">
            <td className="py-2">Total Revenue</td>
            <td className="py-2 text-right">{formatCurrency(data.revenue?.total_revenue?.current_year)}</td>
            <td className="py-2 text-right">{formatCurrency(data.revenue?.total_revenue?.previous_year)}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  data.revenue?.total_revenue?.current_year,
                  data.revenue?.total_revenue?.previous_year
                );
                if (change === null) return 'N/A';
                return (
                  <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                  </span>
                );
              })()}
            </td>
          </tr>
          <tr>
            <td className="py-2 pl-4 text-muted-foreground">Cost of Goods Sold</td>
            <td className="py-2 text-right">{formatCurrency(data.expenses?.cost_of_goods_sold?.current_year)}</td>
            <td className="py-2 text-right">{formatCurrency(data.expenses?.cost_of_goods_sold?.previous_year)}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  data.expenses?.cost_of_goods_sold?.current_year,
                  data.expenses?.cost_of_goods_sold?.previous_year
                );
                if (change === null) return 'N/A';
                return (
                  <span className={change >= 0 ? 'text-red-600' : 'text-green-600'}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                  </span>
                );
              })()}
            </td>
          </tr>
          <tr className="font-semibold">
            <td className="py-2">Gross Profit</td>
            <td className="py-2 text-right">{formatCurrency(data.expenses?.gross_profit?.current_year)}</td>
            <td className="py-2 text-right">{formatCurrency(data.expenses?.gross_profit?.previous_year)}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  data.expenses?.gross_profit?.current_year,
                  data.expenses?.gross_profit?.previous_year
                );
                if (change === null) return 'N/A';
                return (
                  <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                  </span>
                );
              })()}
            </td>
          </tr>
          <tr>
            <td className="py-2 pl-4 text-muted-foreground">Operating Expenses</td>
            <td className="py-2 text-right">{formatCurrency(data.expenses?.operating_expenses?.total_operating_expenses?.current_year)}</td>
            <td className="py-2 text-right">{formatCurrency(data.expenses?.operating_expenses?.total_operating_expenses?.previous_year)}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  data.expenses?.operating_expenses?.total_operating_expenses?.current_year,
                  data.expenses?.operating_expenses?.total_operating_expenses?.previous_year
                );
                if (change === null) return 'N/A';
                return (
                  <span className={change >= 0 ? 'text-red-600' : 'text-green-600'}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                  </span>
                );
              })()}
            </td>
          </tr>
          <tr className="font-semibold">
            <td className="py-2">Operating Income (EBIT)</td>
            <td className="py-2 text-right">{formatCurrency(data.profitability?.operating_income_ebit?.current_year)}</td>
            <td className="py-2 text-right">{formatCurrency(data.profitability?.operating_income_ebit?.previous_year)}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  data.profitability?.operating_income_ebit?.current_year,
                  data.profitability?.operating_income_ebit?.previous_year
                );
                if (change === null) return 'N/A';
                return (
                  <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                  </span>
                );
              })()}
            </td>
          </tr>
          <tr className="font-semibold border-t-2">
            <td className="py-2">Net Income</td>
            <td className="py-2 text-right">{formatCurrency(data.profitability?.net_income?.current_year)}</td>
            <td className="py-2 text-right">{formatCurrency(data.profitability?.net_income?.previous_year)}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  data.profitability?.net_income?.current_year,
                  data.profitability?.net_income?.previous_year
                );
                if (change === null) return 'N/A';
                return (
                  <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                  </span>
                );
              })()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function CashFlowTable({ data }: any) {
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return `₹${(value / 100000).toFixed(2)}L`;
  };

  const calculateChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr className="text-left">
            <th className="pb-2 font-medium">Item</th>
            <th className="pb-2 font-medium text-right">Current Year</th>
            <th className="pb-2 font-medium text-right">Previous Year</th>
            <th className="pb-2 font-medium text-right">Change</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          <tr className="font-semibold">
            <td className="py-2">Operating Activities</td>
            <td className="py-2 text-right">{formatCurrency(data.operating_activities?.net_cash_from_operations?.current_year)}</td>
            <td className="py-2 text-right">{formatCurrency(data.operating_activities?.net_cash_from_operations?.previous_year)}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  data.operating_activities?.net_cash_from_operations?.current_year,
                  data.operating_activities?.net_cash_from_operations?.previous_year
                );
                if (change === null) return 'N/A';
                return (
                  <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                  </span>
                );
              })()}
            </td>
          </tr>
          <tr className="font-semibold">
            <td className="py-2">Investing Activities</td>
            <td className="py-2 text-right">{formatCurrency(data.investing_activities?.net_cash_from_investing?.current_year)}</td>
            <td className="py-2 text-right">{formatCurrency(data.investing_activities?.net_cash_from_investing?.previous_year)}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  data.investing_activities?.net_cash_from_investing?.current_year,
                  data.investing_activities?.net_cash_from_investing?.previous_year
                );
                if (change === null) return 'N/A';
                return (
                  <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                  </span>
                );
              })()}
            </td>
          </tr>
          <tr className="font-semibold">
            <td className="py-2">Financing Activities</td>
            <td className="py-2 text-right">{formatCurrency(data.financing_activities?.net_cash_from_financing?.current_year)}</td>
            <td className="py-2 text-right">{formatCurrency(data.financing_activities?.net_cash_from_financing?.previous_year)}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  data.financing_activities?.net_cash_from_financing?.current_year,
                  data.financing_activities?.net_cash_from_financing?.previous_year
                );
                if (change === null) return 'N/A';
                return (
                  <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                  </span>
                );
              })()}
            </td>
          </tr>
          <tr className="font-semibold border-t-2">
            <td className="py-2">Net Change in Cash</td>
            <td className="py-2 text-right">{formatCurrency(data.net_change_in_cash?.current_year)}</td>
            <td className="py-2 text-right">{formatCurrency(data.net_change_in_cash?.previous_year)}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  data.net_change_in_cash?.current_year,
                  data.net_change_in_cash?.previous_year
                );
                if (change === null) return 'N/A';
                return (
                  <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                  </span>
                );
              })()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
