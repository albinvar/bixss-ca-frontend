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
  const [isExporting, setIsExporting] = useState(false);

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
  const balanceSheet = analysis.balance_sheet_data || {};
  const incomeStatement = analysis.income_statement_data || {};
  const cashFlow = analysis.cash_flow_data || {};
  const metrics = analysis.financial_metrics || {};
  const trendAnalysis = analysis.trend_analysis || {};
  const riskAssessment = analysis.risk_assessment || {};
  const industryBench = analysis.industry_benchmarking || {};
  const graphicalData = analysis.graphical_data || {};
  const futureOutlook = analysis.future_outlook || {};
  const executiveSummary = analysis.executive_summary || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/20">
      {/* Header */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard/analysis')}
              className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                {companyInfo.company_name || 'Company Analysis'}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">{companyInfo.financial_period || 'N/A'}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                  <Building className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium">{companyInfo.industry_sector || 'N/A'}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-950/30 rounded-lg">
                  <FileText className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  <span className="font-medium">{companyInfo.document_type || 'Financial Statement'}</span>
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              className="gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl shadow-sm font-semibold transition-all hover:shadow-md"
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
          <TabsList className="grid w-full grid-cols-3 lg:w-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-1 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
            <TabsTrigger
              value="overview"
              className="gap-2 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md font-semibold transition-all"
            >
              <FileText className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="metrics"
              className="gap-2 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md font-semibold transition-all"
            >
              <BarChart3 className="h-4 w-4" />
              Calculated Metrics
            </TabsTrigger>
            <TabsTrigger
              value="outlook"
              className="gap-2 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md font-semibold transition-all"
            >
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
              graphicalData={graphicalData}
              executiveSummary={executiveSummary}
            />
          </TabsContent>

          {/* METRICS TAB */}
          <TabsContent value="metrics" className="space-y-6">
            <div data-chart-name="financial_metrics">
              <MetricsSection metrics={metrics} />
            </div>
          </TabsContent>

          {/* OUTLOOK TAB */}
          <TabsContent value="outlook" className="space-y-6">
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
  graphicalData,
  executiveSummary
}: any) {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      {executiveSummary && (executiveSummary.headline || executiveSummary.summary) && (
        <Card className="border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 shadow-lg shadow-blue-100/50 dark:shadow-blue-900/20">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {executiveSummary.headline || 'Executive Summary'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">{executiveSummary.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Key Highlights */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Strengths */}
        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 shadow-lg shadow-emerald-100/50 dark:shadow-emerald-900/20 hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                Key Strengths
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {healthAnalysis.key_strengths?.map((strength: string, index: number) => (
                <li key={index} className="flex items-start gap-3 group">
                  <div className="mt-1 p-1 bg-emerald-500/10 rounded-full group-hover:bg-emerald-500/20 transition-colors">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  </div>
                  <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{strength}</span>
                </li>
              )) || <p className="text-sm text-muted-foreground">No data available</p>}
            </ul>
          </CardContent>
        </Card>

        {/* Areas of Concern */}
        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 shadow-lg shadow-amber-100/50 dark:shadow-amber-900/20 hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-amber-700 dark:text-amber-400">
                Areas of Concern
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {healthAnalysis.areas_of_concern?.map((concern: string, index: number) => (
                <li key={index} className="flex items-start gap-3 group">
                  <div className="mt-1 p-1 bg-amber-500/10 rounded-full group-hover:bg-amber-500/20 transition-colors">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                  </div>
                  <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{concern}</span>
                </li>
              )) || <p className="text-sm text-muted-foreground">No data available</p>}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts - Revenue & Profit Trends */}
      {graphicalData && (graphicalData.revenueTrend || graphicalData.profitTrend) && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue Trend Chart */}
          {graphicalData.revenueTrend && (
            <Card className="border-0 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 shadow-lg shadow-violet-100/50 dark:shadow-violet-900/20 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg shadow-md">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-violet-700 dark:text-violet-400">
                      Revenue Trend
                    </CardTitle>
                    <CardDescription className="text-xs">Year-over-year comparison</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {graphicalData.revenueTrend.labels?.map((label: string, index: number) => {
                    const value = graphicalData.revenueTrend.values?.[index];
                    const prevValue = index > 0 ? graphicalData.revenueTrend.values?.[index - 1] : null;
                    const change = prevValue ? ((value - prevValue) / prevValue) * 100 : null;

                    return (
                      <div key={index} className="space-y-2 p-3 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-violet-700 dark:text-violet-400">₹{(value / 100000).toFixed(2)}L</span>
                            {change !== null && (
                              <Badge variant={change >= 0 ? "default" : "destructive"} className="text-xs font-semibold">
                                {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="h-3 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full ${change && change < 0 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-emerald-500 to-green-600'} shadow-sm`}
                            style={{ width: `${Math.min((value / Math.max(...graphicalData.revenueTrend.values)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profit Trend Chart */}
          {graphicalData.profitTrend && (
            <Card className="border-0 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 shadow-lg shadow-cyan-100/50 dark:shadow-cyan-900/20 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-md">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-cyan-700 dark:text-cyan-400">
                      Profit Trend
                    </CardTitle>
                    <CardDescription className="text-xs">Gross & net profit comparison</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {graphicalData.profitTrend.labels?.map((label: string, index: number) => {
                    const value = graphicalData.profitTrend.values?.[index];
                    const maxValue = Math.max(...graphicalData.profitTrend.values);

                    return (
                      <div key={index} className="space-y-2 p-3 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                          <span className="text-base font-bold text-cyan-700 dark:text-cyan-400">₹{(value / 100000).toFixed(2)}L</span>
                        </div>
                        <div className="h-3 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full ${label.includes('Gross') ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-emerald-500 to-green-600'} shadow-sm`}
                            style={{ width: `${(value / maxValue) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Liquidity & Profitability Metrics Comparison */}
      {graphicalData && (graphicalData.liquidityComparison || graphicalData.profitabilityMetricsComparison) && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Liquidity Comparison */}
          {graphicalData.liquidityComparison && (
            <Card className="border-0 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 shadow-lg shadow-sky-100/50 dark:shadow-sky-900/20 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-sky-700 dark:text-sky-400">
                      Liquidity Metrics
                    </CardTitle>
                    <CardDescription className="text-xs">Current vs Previous vs Benchmark</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {graphicalData.liquidityComparison.metrics?.map((metric: string, index: number) => (
                    <div key={index} className="space-y-3 p-3 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{metric}</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg border border-blue-200/50 dark:border-blue-700/30">
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Current</p>
                          <p className="text-base font-bold text-blue-700 dark:text-blue-300">{graphicalData.liquidityComparison.currentYear?.[index]?.toFixed(2)}</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800/30 dark:to-gray-700/20 rounded-lg border border-gray-200/50 dark:border-gray-600/30">
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Previous</p>
                          <p className="text-base font-bold text-gray-700 dark:text-gray-300">{graphicalData.liquidityComparison.previousYear?.[index]?.toFixed(2)}</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-lg border border-emerald-200/50 dark:border-emerald-700/30">
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Target</p>
                          <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">{graphicalData.liquidityComparison.benchmark?.[index]?.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profitability Metrics */}
          {graphicalData.profitabilityMetricsComparison && (
            <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 shadow-lg shadow-rose-100/50 dark:shadow-rose-900/20 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-rose-700 dark:text-rose-400">
                      Profitability Metrics
                    </CardTitle>
                    <CardDescription className="text-xs">Current vs Previous Year</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {graphicalData.profitabilityMetricsComparison.metrics?.map((metric: string, index: number) => {
                    const current = graphicalData.profitabilityMetricsComparison.currentYear?.[index];
                    const previous = graphicalData.profitabilityMetricsComparison.previousYear?.[index];
                    const change = previous ? ((current - previous) / previous) * 100 : null;

                    return (
                      <div key={index} className="space-y-3 p-3 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{metric}</p>
                          {change !== null && (
                            <Badge variant={change >= 0 ? "default" : "destructive"} className="text-xs font-semibold shadow-sm">
                              {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/30 dark:to-rose-800/20 rounded-lg border border-rose-200/50 dark:border-rose-700/30">
                            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mb-1">Current</p>
                            <p className="text-base font-bold text-rose-700 dark:text-rose-300">{current?.toFixed(2)}{metric.includes('%') ? '%' : ''}</p>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800/30 dark:to-gray-700/20 rounded-lg border border-gray-200/50 dark:border-gray-600/30">
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Previous</p>
                            <p className="text-base font-bold text-gray-700 dark:text-gray-300">{previous?.toFixed(2)}{metric.includes('%') ? '%' : ''}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Financial Statements */}
      <Card className="border-0 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/30">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-slate-600 to-gray-700 rounded-lg shadow-md">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-gray-700 bg-clip-text text-transparent dark:from-slate-300 dark:to-gray-300">
                Financial Statements
              </CardTitle>
              <CardDescription className="text-sm">Comprehensive year-over-year financial comparison</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="balance-sheet" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl">
              <TabsTrigger value="balance-sheet" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-800 font-semibold">
                Balance Sheet
              </TabsTrigger>
              <TabsTrigger value="income-statement" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-800 font-semibold">
                Income Statement
              </TabsTrigger>
              <TabsTrigger value="cash-flow" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-800 font-semibold">
                Cash Flow
              </TabsTrigger>
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
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `₹${(value / 100000).toFixed(2)}L`;
  };

  const calculateChange = (current: number | null | undefined, previous: number | null | undefined) => {
    if (!current || !previous) return null;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  const getArrayValue = (arr: any, index: number = 0) => {
    if (!arr || !Array.isArray(arr)) return null;
    return arr[index];
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Sources of Funds */}
      <div>
        <h4 className="font-semibold mb-3">SOURCES OF FUNDS</h4>
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
                <td className="py-2 font-semibold">Partner's Fund</td>
                <td className="py-2"></td>
                <td className="py-2"></td>
                <td className="py-2"></td>
              </tr>
              <tr>
                <td className="py-2 pl-4 text-muted-foreground">Partner's Capital Account</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.sourcesOfFunds?.partnersFund?.partnersCapitalAccount, 0))}</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.sourcesOfFunds?.partnersFund?.partnersCapitalAccount, 1))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getArrayValue(data.sourcesOfFunds?.partnersFund?.partnersCapitalAccount, 0),
                      getArrayValue(data.sourcesOfFunds?.partnersFund?.partnersCapitalAccount, 1)
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
                <td className="py-2 pl-4 text-muted-foreground">Partner's Current Account</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.sourcesOfFunds?.partnersFund?.partnersCurrentAccount, 0))}</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.sourcesOfFunds?.partnersFund?.partnersCurrentAccount, 1))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getArrayValue(data.sourcesOfFunds?.partnersFund?.partnersCurrentAccount, 0),
                      getArrayValue(data.sourcesOfFunds?.partnersFund?.partnersCurrentAccount, 1)
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
                <td className="py-2 pl-4">Total Partner's Fund</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.sourcesOfFunds?.partnersFund?.total, 0))}</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.sourcesOfFunds?.partnersFund?.total, 1))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getArrayValue(data.sourcesOfFunds?.partnersFund?.total, 0),
                      getArrayValue(data.sourcesOfFunds?.partnersFund?.total, 1)
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
                <td className="py-2 font-semibold">Current Liabilities & Provisions</td>
                <td className="py-2"></td>
                <td className="py-2"></td>
                <td className="py-2"></td>
              </tr>
              <tr>
                <td className="py-2 pl-4 text-muted-foreground">Secured Loan</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.sourcesOfFunds?.currentLiabilitiesAndProvisions?.securedLoan, 0))}</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.sourcesOfFunds?.currentLiabilitiesAndProvisions?.securedLoan, 1))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getArrayValue(data.sourcesOfFunds?.currentLiabilitiesAndProvisions?.securedLoan, 0),
                      getArrayValue(data.sourcesOfFunds?.currentLiabilitiesAndProvisions?.securedLoan, 1)
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
                <td className="py-2 pl-4 text-muted-foreground">Trade Payables</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.sourcesOfFunds?.currentLiabilitiesAndProvisions?.tradePayables, 0))}</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.sourcesOfFunds?.currentLiabilitiesAndProvisions?.tradePayables, 1))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getArrayValue(data.sourcesOfFunds?.currentLiabilitiesAndProvisions?.tradePayables, 0),
                      getArrayValue(data.sourcesOfFunds?.currentLiabilitiesAndProvisions?.tradePayables, 1)
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
                <td className="py-2 pl-4 text-muted-foreground">Other Current Liability</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.sourcesOfFunds?.currentLiabilitiesAndProvisions?.otherCurrentLiability, 0))}</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.sourcesOfFunds?.currentLiabilitiesAndProvisions?.otherCurrentLiability, 1))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getArrayValue(data.sourcesOfFunds?.currentLiabilitiesAndProvisions?.otherCurrentLiability, 0),
                      getArrayValue(data.sourcesOfFunds?.currentLiabilitiesAndProvisions?.otherCurrentLiability, 1)
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
                <td className="py-2 pl-4">Total Current Liabilities</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.sourcesOfFunds?.currentLiabilitiesAndProvisions?.total, 0))}</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.sourcesOfFunds?.currentLiabilitiesAndProvisions?.total, 1))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getArrayValue(data.sourcesOfFunds?.currentLiabilitiesAndProvisions?.total, 0),
                      getArrayValue(data.sourcesOfFunds?.currentLiabilitiesAndProvisions?.total, 1)
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
              <tr className="font-semibold border-t-2">
                <td className="py-2">TOTAL SOURCES</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.sourcesOfFunds?.totalSources, 0))}</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.sourcesOfFunds?.totalSources, 1))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getArrayValue(data.sourcesOfFunds?.totalSources, 0),
                      getArrayValue(data.sourcesOfFunds?.totalSources, 1)
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

      {/* Application of Funds */}
      <div>
        <h4 className="font-semibold mb-3">APPLICATION OF FUNDS</h4>
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
                <td className="py-2 font-semibold">Fixed Assets</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.applicationOfFunds?.fixedAssets, 0))}</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.applicationOfFunds?.fixedAssets, 1))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getArrayValue(data.applicationOfFunds?.fixedAssets, 0),
                      getArrayValue(data.applicationOfFunds?.fixedAssets, 1)
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
                <td className="py-2 font-semibold">Current Assets, Deposits, Loans & Advances</td>
                <td className="py-2"></td>
                <td className="py-2"></td>
                <td className="py-2"></td>
              </tr>
              <tr>
                <td className="py-2 pl-4 text-muted-foreground">Inventories</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.inventories, 0))}</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.inventories, 1))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.inventories, 0),
                      getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.inventories, 1)
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
                <td className="py-2 pl-4 text-muted-foreground">Deposits</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.deposits, 0))}</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.deposits, 1))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.deposits, 0),
                      getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.deposits, 1)
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
                <td className="py-2 pl-4 text-muted-foreground">Loans & Advances</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.loansAndAdvances, 0))}</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.loansAndAdvances, 1))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.loansAndAdvances, 0),
                      getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.loansAndAdvances, 1)
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
                <td className="py-2 pl-4 text-muted-foreground">Trade Receivable</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.tradeReceivable, 0))}</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.tradeReceivable, 1))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.tradeReceivable, 0),
                      getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.tradeReceivable, 1)
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
                <td className="py-2 pl-4 text-muted-foreground">Cash in Hand</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.cashInHand, 0))}</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.cashInHand, 1))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.cashInHand, 0),
                      getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.cashInHand, 1)
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
                <td className="py-2 pl-4">Total Current Assets</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.total, 0))}</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.total, 1))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.total, 0),
                      getArrayValue(data.applicationOfFunds?.currentAssetsDepositsLoansAndAdvances?.total, 1)
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
                <td className="py-2">TOTAL APPLICATIONS</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.applicationOfFunds?.totalApplications, 0))}</td>
                <td className="py-2 text-right">{formatCurrency(getArrayValue(data.applicationOfFunds?.totalApplications, 1))}</td>
                <td className="py-2 text-right">
                  {(() => {
                    const change = calculateChange(
                      getArrayValue(data.applicationOfFunds?.totalApplications, 0),
                      getArrayValue(data.applicationOfFunds?.totalApplications, 1)
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
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `₹${(value / 100000).toFixed(2)}L`;
  };

  const calculateChange = (current: number | null | undefined, previous: number | null | undefined) => {
    if (!current || !previous) return null;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  const getArrayValue = (arr: any, index: number = 0) => {
    if (!arr || !Array.isArray(arr)) return null;
    return arr[index];
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
          <tr>
            <td className="py-2 font-semibold">Income</td>
            <td className="py-2"></td>
            <td className="py-2"></td>
            <td className="py-2"></td>
          </tr>
          <tr>
            <td className="py-2 pl-4 text-muted-foreground">Sales</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.income?.sales, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.income?.sales, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.income?.sales, 0),
                  getArrayValue(data.income?.sales, 1)
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
            <td className="py-2 pl-4 text-muted-foreground">Job Work Charges</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.income?.jobWorkCharges, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.income?.jobWorkCharges, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.income?.jobWorkCharges, 0),
                  getArrayValue(data.income?.jobWorkCharges, 1)
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
            <td className="py-2 pl-4 text-muted-foreground">Rent Received</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.income?.rentReceived, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.income?.rentReceived, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.income?.rentReceived, 0),
                  getArrayValue(data.income?.rentReceived, 1)
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
            <td className="py-2 pl-4">Total Operating Income</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.income?.totalOperatingIncome, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.income?.totalOperatingIncome, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.income?.totalOperatingIncome, 0),
                  getArrayValue(data.income?.totalOperatingIncome, 1)
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
            <td className="py-2 font-semibold">Cost of Goods Sold</td>
            <td className="py-2"></td>
            <td className="py-2"></td>
            <td className="py-2"></td>
          </tr>
          <tr>
            <td className="py-2 pl-4 text-muted-foreground">Opening Stock</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.costOfGoodsSold?.openingStock, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.costOfGoodsSold?.openingStock, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.costOfGoodsSold?.openingStock, 0),
                  getArrayValue(data.costOfGoodsSold?.openingStock, 1)
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
            <td className="py-2 pl-4 text-muted-foreground">Purchases</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.costOfGoodsSold?.purchases, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.costOfGoodsSold?.purchases, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.costOfGoodsSold?.purchases, 0),
                  getArrayValue(data.costOfGoodsSold?.purchases, 1)
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
            <td className="py-2 pl-4 text-muted-foreground">Direct Expenses</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.costOfGoodsSold?.directExpenses, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.costOfGoodsSold?.directExpenses, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.costOfGoodsSold?.directExpenses, 0),
                  getArrayValue(data.costOfGoodsSold?.directExpenses, 1)
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
            <td className="py-2 pl-4 text-muted-foreground">Closing Stock</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.costOfGoodsSold?.closingStock, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.costOfGoodsSold?.closingStock, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.costOfGoodsSold?.closingStock, 0),
                  getArrayValue(data.costOfGoodsSold?.closingStock, 1)
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
            <td className="py-2 pl-4">Total Cost of Goods Sold</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.costOfGoodsSold?.total, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.costOfGoodsSold?.total, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.costOfGoodsSold?.total, 0),
                  getArrayValue(data.costOfGoodsSold?.total, 1)
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
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.grossProfit, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.grossProfit, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.grossProfit, 0),
                  getArrayValue(data.grossProfit, 1)
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
            <td className="py-2 pl-4 text-muted-foreground">Indirect Income</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.indirectIncome, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.indirectIncome, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.indirectIncome, 0),
                  getArrayValue(data.indirectIncome, 1)
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
            <td className="py-2 pl-4 text-muted-foreground">Indirect Expenses</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.indirectExpenses?.total, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.indirectExpenses?.total, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.indirectExpenses?.total, 0),
                  getArrayValue(data.indirectExpenses?.total, 1)
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
            <td className="py-2 pl-4 text-muted-foreground">Interest Expense</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.interestExpense, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.interestExpense, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.interestExpense, 0),
                  getArrayValue(data.interestExpense, 1)
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
            <td className="py-2 pl-4 text-muted-foreground">Depreciation</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.depreciation, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.depreciation, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.depreciation, 0),
                  getArrayValue(data.depreciation, 1)
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
            <td className="py-2">Profit Before Tax</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.profitBeforeTax, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.profitBeforeTax, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.profitBeforeTax, 0),
                  getArrayValue(data.profitBeforeTax, 1)
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
            <td className="py-2 pl-4 text-muted-foreground">Tax & Appropriations</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.taxAndAppropriations, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.taxAndAppropriations, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.taxAndAppropriations, 0),
                  getArrayValue(data.taxAndAppropriations, 1)
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
          <tr className="font-semibold border-t-2">
            <td className="py-2">Net Profit</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.netProfit, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.netProfit, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.netProfit, 0),
                  getArrayValue(data.netProfit, 1)
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
  // Check if cash flow data is not provided
  if (data?.status === "Not Provided") {
    return (
      <div className="overflow-x-auto mt-4">
        <Card className="border-muted-foreground/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Cash Flow Statement Not Available</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {data.comment || "A Cash Flow Statement was not included in the provided documents. Analysis of cash movements is limited."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `₹${(value / 100000).toFixed(2)}L`;
  };

  const calculateChange = (current: number | null | undefined, previous: number | null | undefined) => {
    if (!current || !previous) return null;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  const getArrayValue = (arr: any, index: number = 0) => {
    if (!arr || !Array.isArray(arr)) return null;
    return arr[index];
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
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.operating_activities?.net_cash_from_operations, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.operating_activities?.net_cash_from_operations, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.operating_activities?.net_cash_from_operations, 0),
                  getArrayValue(data.operating_activities?.net_cash_from_operations, 1)
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
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.investing_activities?.net_cash_from_investing, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.investing_activities?.net_cash_from_investing, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.investing_activities?.net_cash_from_investing, 0),
                  getArrayValue(data.investing_activities?.net_cash_from_investing, 1)
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
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.financing_activities?.net_cash_from_financing, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.financing_activities?.net_cash_from_financing, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.financing_activities?.net_cash_from_financing, 0),
                  getArrayValue(data.financing_activities?.net_cash_from_financing, 1)
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
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.net_change_in_cash, 0))}</td>
            <td className="py-2 text-right">{formatCurrency(getArrayValue(data.net_change_in_cash, 1))}</td>
            <td className="py-2 text-right">
              {(() => {
                const change = calculateChange(
                  getArrayValue(data.net_change_in_cash, 0),
                  getArrayValue(data.net_change_in_cash, 1)
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
