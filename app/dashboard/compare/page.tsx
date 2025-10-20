"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  GitCompare,
  FileText,
  Building2,
  Calendar,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  Percent,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { analysisApi, companiesApi } from '@/lib/api';

interface Company {
  _id?: string;
  id?: string;
  name: string;
  industry?: string;
}

export default function ComparePage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [companyName, setCompanyName] = useState('');

  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [selectedAnalysisIds, setSelectedAnalysisIds] = useState<string[]>([]);

  const [comparisonData, setComparisonData] = useState<any>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Redirect if user is not authorized
  useEffect(() => {
    if (user && !['ca', 'company', 'admin'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoadingCompanies(true);
        const response = await companiesApi.getAll({ limit: 100 });
        if (response.success && response.data && response.data.companies) {
          setCompanies(response.data.companies);

          // Auto-select company from URL or first company
          const urlCompanyId = searchParams.get('companyId');
          if (urlCompanyId) {
            setSelectedCompanyId(urlCompanyId);
          } else if (response.data.companies.length > 0) {
            const firstCompanyId = response.data.companies[0]._id || response.data.companies[0].id;
            setSelectedCompanyId(firstCompanyId);
          }
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast.error('Failed to load companies');
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [searchParams]);

  // Fetch analysis history when company changes
  useEffect(() => {
    if (selectedCompanyId) {
      fetchAnalysisHistory();
    }
  }, [selectedCompanyId]);

  const fetchAnalysisHistory = async () => {
    try {
      setIsLoadingHistory(true);
      setSelectedAnalysisIds([]);
      setShowComparison(false);

      const response = await analysisApi.getHistory(selectedCompanyId, 50);

      if (response.success && response.data && response.data.analyses) {
        setAnalysisHistory(response.data.analyses);
        setCompanyName(response.data.company_name);
      } else {
        setAnalysisHistory([]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Failed to load analysis history');
      setAnalysisHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleAnalysisToggle = (analysisId: string) => {
    setSelectedAnalysisIds(prev => {
      if (prev.includes(analysisId)) {
        return prev.filter(id => id !== analysisId);
      } else {
        return [...prev, analysisId];
      }
    });
  };

  const handleCompare = async () => {
    if (selectedAnalysisIds.length < 2) {
      toast.error('Please select at least 2 analyses to compare');
      return;
    }

    try {
      setIsLoading(true);
      const response = await analysisApi.compare(selectedCompanyId, {
        analysisIds: selectedAnalysisIds
      });

      if (response.success && response.data) {
        setComparisonData(response.data);
        setShowComparison(true);
      } else {
        toast.error('Failed to load comparison data');
      }
    } catch (error) {
      console.error('Error comparing analyses:', error);
      toast.error('Failed to compare analyses');
    } finally {
      setIsLoading(false);
    }
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <ArrowUpRight className="h-4 w-4" />
          <span className="font-semibold">+{change.toFixed(1)}%</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <ArrowDownRight className="h-4 w-4" />
          <span className="font-semibold">{change.toFixed(1)}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Minus className="h-4 w-4" />
          <span className="font-semibold">0%</span>
        </div>
      );
    }
  };

  // Show nothing while redirecting unauthorized users
  if (!user || !['ca', 'company', 'admin'].includes(user.role)) {
    return null;
  }

  // If showing comparison results
  if (showComparison && comparisonData) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setShowComparison(false)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                <GitCompare className="h-6 w-6 sm:h-7 sm:w-7" />
                Analysis Comparison
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {companyName} • {comparisonData.analyses_count} analyses compared
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Date Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <div className="font-semibold">
                    {new Date(comparisonData.date_range.start).toLocaleDateString()}
                  </div>
                  <div className="text-muted-foreground">to</div>
                  <div className="font-semibold">
                    {new Date(comparisonData.date_range.end).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Health Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {comparisonData.health_progression && comparisonData.health_progression.length > 0 && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Latest:</span>
                      <Badge variant="default">
                        {comparisonData.health_progression[comparisonData.health_progression.length - 1]?.health_status || 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Earliest:</span>
                      <Badge variant="outline">
                        {comparisonData.health_progression[0]?.health_status || 'N/A'}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overall Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{comparisonData.improving_metrics?.length || 0}</span>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">Improving</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold text-lg">{comparisonData.declining_metrics?.length || 0}</span>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-muted-foreground">Declining</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        {comparisonData.summary && (
          <Card className="bg-muted/30 border-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {comparisonData.summary}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Improving Metrics */}
        {comparisonData.improving_metrics && comparisonData.improving_metrics.length > 0 && (
          <Card className="border-green-200 dark:border-green-900">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-400">
                <TrendingUp className="h-5 w-5" />
                Improving Metrics ({comparisonData.improving_metrics.length})
              </CardTitle>
              <CardDescription>
                Metrics showing positive improvement over the comparison period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comparisonData.improving_metrics.map((metric: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">
                        {metric.metric.split('.').pop()?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-700 dark:text-green-400 font-semibold">
                        +{metric.change.toFixed(1)}%
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Declining Metrics */}
        {comparisonData.declining_metrics && comparisonData.declining_metrics.length > 0 && (
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
                <TrendingDown className="h-5 w-5" />
                Declining Metrics ({comparisonData.declining_metrics.length})
              </CardTitle>
              <CardDescription>
                Metrics showing negative trends that may require attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comparisonData.declining_metrics.map((metric: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-red-50 dark:bg-red-950/20">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">
                        {metric.metric.split('.').pop()?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-red-700 dark:text-red-400 font-semibold">
                        {metric.change.toFixed(1)}%
                      </span>
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metric Trends */}
        {comparisonData.metric_trends && Object.keys(comparisonData.metric_trends).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Detailed Metric Trends
              </CardTitle>
              <CardDescription>
                Timeline view of all tracked financial metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(comparisonData.metric_trends).slice(0, 10).map(([metricKey, values]: [string, any]) => {
                  if (!values || values.length === 0) return null;

                  const metricName = metricKey.split('.').pop()?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                  const firstValue = values[0]?.value;
                  const lastValue = values[values.length - 1]?.value;
                  const change = firstValue !== 0 ? ((lastValue - firstValue) / Math.abs(firstValue)) * 100 : 0;

                  return (
                    <div key={metricKey} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metricName}</span>
                        {getChangeIndicator(change)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>From: {firstValue?.toFixed(2)}</span>
                        <span>→</span>
                        <span>To: {lastValue?.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${change > 0 ? 'bg-green-500' : change < 0 ? 'bg-red-500' : 'bg-muted-foreground'}`}
                          style={{ width: `${Math.min(Math.abs(change), 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Health Progression Timeline */}
        {comparisonData.health_progression && comparisonData.health_progression.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Health Status Progression
              </CardTitle>
              <CardDescription>
                Timeline of health status changes across analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comparisonData.health_progression.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="flex-shrink-0 w-24 text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div className="flex-1">
                      <Badge variant="default">{item.health_status}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Percent className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{(item.confidence_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Selection screen
  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <GitCompare className="h-6 w-6 sm:h-7 sm:w-7" />
          Compare Analyses
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a company and at least 2 analyses to compare
        </p>
      </div>

      {/* Company Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Company</CardTitle>
          <CardDescription>Choose a company to view its analysis history</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingCompanies ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company._id || company.id} value={company._id || company.id || ''}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{company.name}</span>
                      {company.industry && (
                        <span className="text-xs text-muted-foreground">({company.industry})</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Analysis Selection */}
      {selectedCompanyId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Select Analyses to Compare</CardTitle>
                <CardDescription>Choose at least 2 analyses from the list below</CardDescription>
              </div>
              {selectedAnalysisIds.length >= 2 && (
                <Button onClick={handleCompare} disabled={isLoading}>
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare {selectedAnalysisIds.length} Analyses
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : analysisHistory.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Analysis History</h3>
                <p className="text-sm text-muted-foreground">
                  This company doesn't have any completed analyses yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {analysisHistory.map((analysis) => (
                  <div
                    key={analysis.analysis_id}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedAnalysisIds.includes(analysis.analysis_id)
                        ? 'border-primary bg-muted/50'
                        : 'hover:bg-muted/30'
                    }`}
                    onClick={() => handleAnalysisToggle(analysis.analysis_id)}
                  >
                    <Checkbox
                      checked={selectedAnalysisIds.includes(analysis.analysis_id)}
                      onCheckedChange={() => handleAnalysisToggle(analysis.analysis_id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {new Date(analysis.date).toLocaleDateString()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {analysis.health_status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {analysis.document_count} docs
                        </span>
                        {analysis.key_metrics?.current_ratio && (
                          <span>CR: {analysis.key_metrics.current_ratio.toFixed(2)}</span>
                        )}
                        {analysis.key_metrics?.net_margin && (
                          <span>NM: {(analysis.key_metrics.net_margin * 100).toFixed(1)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selection Summary */}
      {selectedAnalysisIds.length > 0 && (
        <Card className="bg-muted/30 border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                <span className="font-medium">
                  {selectedAnalysisIds.length} {selectedAnalysisIds.length === 1 ? 'analysis' : 'analyses'} selected
                </span>
              </div>
              {selectedAnalysisIds.length >= 2 ? (
                <Button onClick={handleCompare} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Compare Now'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Select {2 - selectedAnalysisIds.length} more to compare
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
