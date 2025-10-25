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
import { analysisApi } from '@/lib/api';
import { toast } from 'sonner';
import { MetricsSection } from './components/MetricsSection';
import { OutlookSection } from './components/OutlookSection';
import { DynamicFinancialTable } from './components/DynamicFinancialTable';
import { SmartMetricsSection } from './components/SmartMetricsSection';
import { FinancialCharts } from './components/FinancialCharts';
import { FutureProjectionCharts } from './components/FutureProjectionCharts';

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');

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

        // Set available years and default to most recent
        const years = response.data.available_years || [];
        if (years.length > 0) {
          const sortedYears = [...years].sort((a, b) => parseInt(b) - parseInt(a));
          setAvailableYears(sortedYears);
          setSelectedYear(sortedYears[0]); // Default to most recent year
        }
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

  const handleExportPDF = async () => {
    if (!analysis) return;

    setIsExporting(true);
    try {
      toast.info('Generating PDF...');

      // Call backend to generate PDF (simple version without chart capture)
      const pdfBlob = await analysisApi.exportPDF(analysisId, {});

      // Download the PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Analysis_${analysis.company_information?.company_name || 'Report'}_${analysisId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF exported successfully!');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF: ' + (error.message || 'Unknown error'));
    } finally {
      setIsExporting(false);
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

  // NEW: Dual extraction data
  const extractedFields = analysis.extracted_fields || {};
  const standardizedFields = analysis.standardized_fields || {};
  const calculatedMetrics = analysis.calculated_metrics || {};

  // Legacy data (backward compatibility)
  const balanceSheet = analysis.balance_sheet_data || {};
  const incomeStatement = analysis.income_statement_data || {};
  const cashFlow = analysis.cash_flow_data || {};
  const metrics = analysis.financial_metrics || {};

  const trendAnalysis = analysis.trend_analysis || {};
  const riskAssessment = analysis.risk_assessment || {};
  const industryBench = analysis.industry_benchmarking || {};
  const graphicalData = analysis.graphical_data || {};
  const futureOutlook = analysis.future_outlook || {};

  // Check if we have new dual extraction data
  const hasExtractedFields = extractedFields && Object.keys(extractedFields).length > 0;
  const hasCalculatedMetrics = calculatedMetrics && Object.keys(calculatedMetrics).length > 0;

  // Helper to get year index
  const getYearIndex = (year: string) => {
    const sortedYears = [...availableYears].sort((a, b) => parseInt(b) - parseInt(a));
    return sortedYears.indexOf(year);
  };

  const selectedYearIndex = getYearIndex(selectedYear);
  const previousYear = availableYears[selectedYearIndex + 1] || null;

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
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8" data-analysis-content>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="overview" className="gap-2">
              <FileText className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Ratios & Metrics
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
              balanceSheet={hasExtractedFields ? extractedFields.balance_sheet : balanceSheet}
              incomeStatement={hasExtractedFields ? extractedFields.income_statement : incomeStatement}
              cashFlow={cashFlow}
              extractedFields={extractedFields}
              standardizedFields={standardizedFields}
              selectedYear={selectedYear}
              previousYear={previousYear}
              availableYears={availableYears}
              hasExtractedFields={hasExtractedFields}
            />

            {/* Financial Charts - Visual Analytics */}
            {graphicalData && Object.keys(graphicalData).length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Visual Analytics</h3>
                <FinancialCharts graphicalData={graphicalData} currency={companyInfo.currency || '₹'} />
              </div>
            )}
          </TabsContent>

          {/* METRICS TAB - Smart Ratios with Availability Checks */}
          <TabsContent value="metrics" className="space-y-6">
            {hasCalculatedMetrics ? (
              <SmartMetricsSection
                calculatedMetrics={calculatedMetrics}
                availableYears={availableYears}
              />
            ) : (
              <div data-chart-name="financial_metrics">
                <MetricsSection
                  metrics={metrics}
                  selectedYear={selectedYear}
                  previousYear={previousYear}
                />
              </div>
            )}
          </TabsContent>

          {/* OUTLOOK TAB */}
          <TabsContent value="outlook" className="space-y-6">
            {/* Future Projection Charts */}
            {futureOutlook && Object.keys(futureOutlook).length > 0 && (
              <FutureProjectionCharts
                futureOutlook={futureOutlook}
                currency={companyInfo.currency || '₹'}
              />
            )}

            {/* Additional Outlook Analysis */}
            <div data-chart-name="outlook_analysis">
              <OutlookSection
                healthAnalysis={healthAnalysis}
                trendAnalysis={trendAnalysis}
                riskAssessment={riskAssessment}
                industryBench={industryBench}
                graphicalData={graphicalData}
                futureOutlook={futureOutlook}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// OVERVIEW SECTION COMPONENT
function OverviewSection({
  companyInfo,
  healthAnalysis,
  balanceSheet,
  incomeStatement,
  cashFlow,
  extractedFields,
  standardizedFields,
  selectedYear,
  previousYear,
  availableYears,
  hasExtractedFields
}: any) {
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
      {hasExtractedFields ? (
        /* NEW: Use DynamicFinancialTable for extracted fields */
        <div className="space-y-6">
          {balanceSheet && (
            <DynamicFinancialTable
              title="Balance Sheet"
              description="All line items extracted from your financial document"
              extractedFields={balanceSheet}
              standardizedFields={standardizedFields}
              availableYears={availableYears}
              section="balance_sheet"
            />
          )}

          {incomeStatement && (
            <DynamicFinancialTable
              title="Income Statement"
              description="All line items extracted from your financial document"
              extractedFields={incomeStatement}
              standardizedFields={standardizedFields}
              availableYears={availableYears}
              section="income_statement"
            />
          )}
        </div>
      ) : (
        /* LEGACY: Use old table components for backward compatibility */
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
                <BalanceSheetTable
                  data={balanceSheet}
                  selectedYear={selectedYear}
                  previousYear={previousYear}
                  availableYears={availableYears}
                />
              </TabsContent>

              <TabsContent value="income-statement" className="space-y-4">
                <IncomeStatementTable
                  data={incomeStatement}
                  selectedYear={selectedYear}
                  previousYear={previousYear}
                  availableYears={availableYears}
                />
              </TabsContent>

              <TabsContent value="cash-flow" className="space-y-4">
                <CashFlowTable
                  data={cashFlow}
                  selectedYear={selectedYear}
                  previousYear={previousYear}
                  availableYears={availableYears}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


// Financial Statement Tables
function BalanceSheetTable({ data, selectedYear, previousYear, availableYears }: any) {
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return `₹${(value / 100000).toFixed(2)}L`;
  };

  const calculateChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  // Get value from year-keyed format: {"2024": 1000, "2023": 900, ...}
  const getValue = (obj: any, yearType: 'current' | 'previous') => {
    if (!obj) return null;
    const year = yearType === 'current' ? selectedYear : previousYear;
    return year && typeof obj === 'object' ? obj[year] ?? null : null;
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
                <td className="py-2 text-right">{formatCurrency(getValue(data.assets?.current_assets?.cash_and_bank, 'current'))}</td>
                <td className="py-2 text-right">{formatCurrency(getValue(data.assets?.current_assets?.cash_and_bank, 'previous'))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getValue(data.assets?.current_assets?.cash_and_bank, 'current'),
                      getValue(data.assets?.current_assets?.cash_and_bank, 'previous')
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
                <td className="py-2 text-right">{formatCurrency(getValue(data.assets?.current_assets?.accounts_receivable, 'current'))}</td>
                <td className="py-2 text-right">{formatCurrency(getValue(data.assets?.current_assets?.accounts_receivable, 'previous'))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getValue(data.assets?.current_assets?.accounts_receivable, 'current'),
                      getValue(data.assets?.current_assets?.accounts_receivable, 'previous')
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
                <td className="py-2 text-right">{formatCurrency(getValue(data.assets?.current_assets?.inventory, 'current'))}</td>
                <td className="py-2 text-right">{formatCurrency(getValue(data.assets?.current_assets?.inventory, 'previous'))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getValue(data.assets?.current_assets?.inventory, 'current'),
                      getValue(data.assets?.current_assets?.inventory, 'previous')
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
                <td className="py-2 text-right">{formatCurrency(getValue(data.assets?.current_assets?.total_current_assets, 'current'))}</td>
                <td className="py-2 text-right">{formatCurrency(getValue(data.assets?.current_assets?.total_current_assets, 'previous'))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getValue(data.assets?.current_assets?.total_current_assets, 'current'),
                      getValue(data.assets?.current_assets?.total_current_assets, 'previous')
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
                <td className="py-2 text-right">{formatCurrency(getValue(data.assets?.non_current_assets?.property_plant_equipment, 'current'))}</td>
                <td className="py-2 text-right">{formatCurrency(getValue(data.assets?.non_current_assets?.property_plant_equipment, 'previous'))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getValue(data.assets?.non_current_assets?.property_plant_equipment, 'current'),
                      getValue(data.assets?.non_current_assets?.property_plant_equipment, 'previous')
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
                <td className="py-2 text-right">{formatCurrency(getValue(data.assets?.total_assets, 'current'))}</td>
                <td className="py-2 text-right">{formatCurrency(getValue(data.assets?.total_assets, 'previous'))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getValue(data.assets?.total_assets, 'current'),
                      getValue(data.assets?.total_assets, 'previous')
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
                <td className="py-2 text-right">{formatCurrency(getValue(data.liabilities?.current_liabilities?.accounts_payable, 'current'))}</td>
                <td className="py-2 text-right">{formatCurrency(getValue(data.liabilities?.current_liabilities?.accounts_payable, 'previous'))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getValue(data.liabilities?.current_liabilities?.accounts_payable, 'current'),
                      getValue(data.liabilities?.current_liabilities?.accounts_payable, 'previous')
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
                <td className="py-2 text-right">{formatCurrency(getValue(data.liabilities?.current_liabilities?.short_term_debt, 'current'))}</td>
                <td className="py-2 text-right">{formatCurrency(getValue(data.liabilities?.current_liabilities?.short_term_debt, 'previous'))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getValue(data.liabilities?.current_liabilities?.short_term_debt, 'current'),
                      getValue(data.liabilities?.current_liabilities?.short_term_debt, 'previous')
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
                <td className="py-2 text-right">{formatCurrency(getValue(data.liabilities?.current_liabilities?.total_current_liabilities, 'current'))}</td>
                <td className="py-2 text-right">{formatCurrency(getValue(data.liabilities?.current_liabilities?.total_current_liabilities, 'previous'))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getValue(data.liabilities?.current_liabilities?.total_current_liabilities, 'current'),
                      getValue(data.liabilities?.current_liabilities?.total_current_liabilities, 'previous')
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
                <td className="py-2 text-right">{formatCurrency(getValue(data.equity?.total_equity, 'current'))}</td>
                <td className="py-2 text-right">{formatCurrency(getValue(data.equity?.total_equity, 'previous'))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getValue(data.equity?.total_equity, 'current'),
                      getValue(data.equity?.total_equity, 'previous')
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

function IncomeStatementTable({ data, selectedYear, previousYear, availableYears }: any) {
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return `₹${(value / 100000).toFixed(2)}L`;
  };

  const calculateChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  // Get value from year-keyed format: {"2024": 1000, "2023": 900, ...}
  const getValue = (obj: any, yearType: 'current' | 'previous') => {
    if (!obj) return null;
    const year = yearType === 'current' ? selectedYear : previousYear;
    return year && typeof obj === 'object' ? obj[year] ?? null : null;
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
            <td className="py-2 text-right">{formatCurrency(getValue(data.revenue?.total_revenue, 'current'))}</td>
            <td className="py-2 text-right">{formatCurrency(getValue(data.revenue?.total_revenue, 'previous'))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getValue(data.revenue?.total_revenue, 'current'),
                  getValue(data.revenue?.total_revenue, 'previous')
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
            <td className="py-2 text-right">{formatCurrency(getValue(data.expenses?.cost_of_goods_sold, 'current'))}</td>
            <td className="py-2 text-right">{formatCurrency(getValue(data.expenses?.cost_of_goods_sold, 'previous'))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getValue(data.expenses?.cost_of_goods_sold, 'current'),
                  getValue(data.expenses?.cost_of_goods_sold, 'previous')
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
            <td className="py-2 text-right">{formatCurrency(getValue(data.expenses?.gross_profit, 'current'))}</td>
            <td className="py-2 text-right">{formatCurrency(getValue(data.expenses?.gross_profit, 'previous'))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getValue(data.expenses?.gross_profit, 'current'),
                  getValue(data.expenses?.gross_profit, 'previous')
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
            <td className="py-2 text-right">{formatCurrency(getValue(data.expenses?.operating_expenses?.total_operating_expenses, 'current'))}</td>
            <td className="py-2 text-right">{formatCurrency(getValue(data.expenses?.operating_expenses?.total_operating_expenses, 'previous'))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getValue(data.expenses?.operating_expenses?.total_operating_expenses, 'current'),
                  getValue(data.expenses?.operating_expenses?.total_operating_expenses, 'previous')
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
            <td className="py-2 text-right">{formatCurrency(getValue(data.profitability?.operating_income_ebit, 'current'))}</td>
            <td className="py-2 text-right">{formatCurrency(getValue(data.profitability?.operating_income_ebit, 'previous'))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getValue(data.profitability?.operating_income_ebit, 'current'),
                  getValue(data.profitability?.operating_income_ebit, 'previous')
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
            <td className="py-2 text-right">{formatCurrency(getValue(data.profitability?.net_income, 'current'))}</td>
            <td className="py-2 text-right">{formatCurrency(getValue(data.profitability?.net_income, 'previous'))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getValue(data.profitability?.net_income, 'current'),
                  getValue(data.profitability?.net_income, 'previous')
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

function CashFlowTable({ data, selectedYear, previousYear, availableYears }: any) {
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return `₹${(value / 100000).toFixed(2)}L`;
  };

  const calculateChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  // Get value from year-keyed format: {"2024": 1000, "2023": 900, ...}
  const getValue = (obj: any, yearType: 'current' | 'previous') => {
    if (!obj) return null;
    const year = yearType === 'current' ? selectedYear : previousYear;
    return year && typeof obj === 'object' ? obj[year] ?? null : null;
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
            <td className="py-2 text-right">{formatCurrency(getValue(data.operating_activities?.net_cash_from_operations, 'current'))}</td>
            <td className="py-2 text-right">{formatCurrency(getValue(data.operating_activities?.net_cash_from_operations, 'previous'))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getValue(data.operating_activities?.net_cash_from_operations, 'current'),
                  getValue(data.operating_activities?.net_cash_from_operations, 'previous')
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
            <td className="py-2 text-right">{formatCurrency(getValue(data.investing_activities?.net_cash_from_investing, 'current'))}</td>
            <td className="py-2 text-right">{formatCurrency(getValue(data.investing_activities?.net_cash_from_investing, 'previous'))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getValue(data.investing_activities?.net_cash_from_investing, 'current'),
                  getValue(data.investing_activities?.net_cash_from_investing, 'previous')
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
            <td className="py-2 text-right">{formatCurrency(getValue(data.financing_activities?.net_cash_from_financing, 'current'))}</td>
            <td className="py-2 text-right">{formatCurrency(getValue(data.financing_activities?.net_cash_from_financing, 'previous'))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getValue(data.financing_activities?.net_cash_from_financing, 'current'),
                  getValue(data.financing_activities?.net_cash_from_financing, 'previous')
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
            <td className="py-2 text-right">{formatCurrency(getValue(data.net_change_in_cash, 'current'))}</td>
            <td className="py-2 text-right">{formatCurrency(getValue(data.net_change_in_cash, 'previous'))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getValue(data.net_change_in_cash, 'current'),
                  getValue(data.net_change_in_cash, 'previous')
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
