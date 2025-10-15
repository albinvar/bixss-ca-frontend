"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GitCompare,
  FileText,
  Building,
  Calendar,
  Clock,
  AlertTriangle,
  FileCheck,
  ArrowLeft,
  Download,
  TrendingUp as TrendUp,
  MinusCircle,
  CheckCircle2,
  Share2
} from 'lucide-react';

// Analysis types and statuses
type AnalysisType = 'Tax' | 'Compliance' | 'Audit' | 'Financial';
type AnalysisStatus = 'shared' | 'pending_action' | 'completed';

// Mock history data (same as in history page)
const mockHistory = [
  {
    id: 1,
    title: 'Q4 2024 Tax Analysis',
    company: 'Tech Solutions Inc.',
    type: 'Tax' as AnalysisType,
    documents: 3,
    createdAt: '2025-10-12',
    completedAt: '2025-10-12',
    duration: '2 minutes',
    reports: ['Tax_Summary_Report.pdf', 'Compliance_Check.pdf'],
    insights: ['No compliance issues found', 'Tax optimization opportunities identified', 'Recommended deductions properly claimed'],
    status: 'shared' as AnalysisStatus,
    findings: { total: 5, critical: 0, warnings: 2 },
  },
  {
    id: 2,
    title: 'Annual Financial Review 2024',
    company: 'Global Finance Corp',
    type: 'Financial' as AnalysisType,
    documents: 5,
    createdAt: '2025-10-10',
    completedAt: '2025-10-10',
    duration: '5 minutes',
    reports: ['Financial_Analysis.pdf', 'Risk_Assessment.pdf', 'Recommendations.pdf'],
    insights: ['Strong financial health', 'Revenue growth of 15%', 'Cash flow optimization needed', 'Working capital ratio improved'],
    status: 'pending_action' as AnalysisStatus,
    findings: { total: 8, critical: 1, warnings: 3 },
  },
  {
    id: 3,
    title: 'Q3 Compliance Audit',
    company: 'Retail Masters Ltd',
    type: 'Compliance' as AnalysisType,
    documents: 4,
    createdAt: '2025-10-08',
    completedAt: '2025-10-08',
    duration: '3 minutes',
    reports: ['Compliance_Report.pdf'],
    insights: ['2 minor compliance gaps', 'Corrective actions recommended', 'Documentation requirements met'],
    status: 'completed' as AnalysisStatus,
    findings: { total: 4, critical: 0, warnings: 2 },
  },
  {
    id: 4,
    title: 'GST Return Verification',
    company: 'Tech Solutions Inc.',
    type: 'Tax' as AnalysisType,
    documents: 2,
    createdAt: '2025-10-05',
    completedAt: '2025-10-05',
    duration: '1 minute',
    reports: ['GST_Verification.pdf'],
    insights: ['All entries verified', 'Ready for submission', 'Input tax credit properly accounted'],
    status: 'shared' as AnalysisStatus,
    findings: { total: 3, critical: 0, warnings: 0 },
  },
  {
    id: 5,
    title: 'Quarterly Tax Planning',
    company: 'Healthcare Plus',
    type: 'Tax' as AnalysisType,
    documents: 3,
    createdAt: '2025-10-01',
    completedAt: '2025-10-01',
    duration: '4 minutes',
    reports: ['Tax_Planning_Report.pdf', 'Savings_Opportunities.pdf'],
    insights: ['Potential savings of ₹2.5L identified', 'Investment recommendations provided', '80C deductions optimized'],
    status: 'completed' as AnalysisStatus,
    findings: { total: 6, critical: 0, warnings: 1 },
  },
  {
    id: 6,
    title: 'Internal Audit Q2 2024',
    company: 'Global Finance Corp',
    type: 'Audit' as AnalysisType,
    documents: 6,
    createdAt: '2025-09-28',
    completedAt: '2025-09-28',
    duration: '6 minutes',
    reports: ['Audit_Report.pdf', 'Management_Letter.pdf'],
    insights: ['Internal controls assessed', 'Minor process improvements suggested', 'No material misstatements found'],
    status: 'shared' as AnalysisStatus,
    findings: { total: 7, critical: 0, warnings: 3 },
  },
];

export default function ComparePage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [compareData, setCompareData] = useState<any[]>([]);

  // Redirect if user is not a CA
  useEffect(() => {
    if (user && user.role !== 'ca') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Load comparison data
  useEffect(() => {
    const ids = searchParams.get('ids');
    if (ids) {
      const idArray = ids.split(',').map(id => parseInt(id));
      const data = idArray.map(id => mockHistory.find(h => h.id === id)).filter(Boolean);

      // Simulate loading with animation
      setTimeout(() => {
        setCompareData(data);
        setIsLoading(false);
      }, 1500);
    } else {
      router.push('/dashboard/history');
    }
  }, [searchParams, router]);

  const getStatusBadge = (status: AnalysisStatus) => {
    switch (status) {
      case 'shared':
        return { label: 'Shared with Client', variant: 'default' as const, icon: Share2 };
      case 'pending_action':
        return { label: 'Pending Action', variant: 'secondary' as const, icon: Clock };
      case 'completed':
        return { label: 'Completed', variant: 'outline' as const, icon: CheckCircle2 };
    }
  };

  // Show nothing while redirecting non-CA users
  if (!user || user.role !== 'ca') {
    return null;
  }

  // Loading state with animation
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <GitCompare className="h-16 w-16 text-muted-foreground animate-pulse" />
                  <div className="absolute inset-0 animate-ping">
                    <GitCompare className="h-16 w-16 text-muted-foreground opacity-20" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Comparing Analyses</h3>
                <p className="text-sm text-muted-foreground">
                  Loading comparison data...
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-foreground rounded-full animate-[loading_1.5s_ease-in-out_infinite]"
                       style={{ width: '40%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <style jsx>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
        `}</style>
      </div>
    );
  }

  // If no data or invalid comparison
  if (compareData.length !== 2) {
    return (
      <div className="p-4 sm:p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Invalid Comparison</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please select exactly 2 analyses to compare
              </p>
              <Button onClick={() => router.push('/dashboard/history')}>
                Back to History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <GitCompare className="h-6 w-6 sm:h-7 sm:w-7" />
              Analysis Comparison
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Side-by-side comparison of selected analyses
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

      {/* Header Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-700">
        {compareData.map((item: any, idx) => {
          const statusBadge = getStatusBadge(item.status);
          const StatusIcon = statusBadge.icon;

          return (
            <Card key={idx} className="border-2 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs font-mono">
                        Analysis {String.fromCharCode(65 + idx)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-base sm:text-lg">{item.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5" />
                      Company
                    </span>
                    <span className="font-medium">{item.company}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Date
                    </span>
                    <span className="font-medium">{new Date(item.completedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Duration
                    </span>
                    <span className="font-medium">{item.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      Documents
                    </span>
                    <span className="font-medium">{item.documents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <FileCheck className="h-3.5 w-3.5" />
                      Reports
                    </span>
                    <span className="font-medium">{item.reports.length}</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <Badge variant={statusBadge.variant} className="text-xs w-full justify-center">
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusBadge.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Findings Comparison */}
      <div className="animate-in slide-in-from-bottom-5 duration-1000">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Findings Overview
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {compareData.map((item: any, idx) => (
            <Card key={idx} className="border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Findings</span>
                    <span className="font-bold text-3xl">{item.findings.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-600 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" />
                      Critical Issues
                    </span>
                    <span className="font-semibold text-red-600 text-lg">{item.findings.critical}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" />
                      Warnings
                    </span>
                    <span className="font-semibold text-lg">{item.findings.warnings}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Difference Indicator */}
      <Card className="animate-in slide-in-from-bottom-6 duration-1200 bg-muted/30 border-2">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-2">Findings Difference</div>
              <div className="font-bold text-2xl sm:text-3xl flex items-center justify-center gap-2">
                {Math.abs(compareData[0].findings.total - compareData[1].findings.total)}
                {compareData[0].findings.total > compareData[1].findings.total ? (
                  <TrendUp className="h-5 w-5 text-red-600" />
                ) : compareData[0].findings.total < compareData[1].findings.total ? (
                  <MinusCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <span className="text-muted-foreground text-sm">(Same)</span>
                )}
              </div>
            </div>
            <div className="hidden sm:block border-l" />
            <div className="text-center sm:col-span-1">
              <div className="text-xs text-muted-foreground mb-2">Time Difference</div>
              <div className="font-bold text-2xl sm:text-3xl">
                {Math.abs(
                  new Date(compareData[0].completedAt).getTime() -
                  new Date(compareData[1].completedAt).getTime()
                ) / (1000 * 60 * 60 * 24)} days
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights Comparison */}
      <div className="animate-in slide-in-from-bottom-7 duration-1400">
        <h3 className="font-semibold text-lg mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {compareData.map((item: any, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-mono">
                    Analysis {String.fromCharCode(65 + idx)}
                  </Badge>
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {item.insights.map((insight: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm animate-in slide-in-from-left duration-300"
                         style={{ animationDelay: `${i * 100}ms` }}>
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{insight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Reports Comparison */}
      <div className="animate-in slide-in-from-bottom-8 duration-1600">
        <h3 className="font-semibold text-lg mb-4">Generated Reports</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {compareData.map((item: any, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-mono">
                    Analysis {String.fromCharCode(65 + idx)}
                  </Badge>
                  {item.reports.length} Report{item.reports.length > 1 ? 's' : ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {item.reports.map((report: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                      <FileText className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span className="text-sm truncate flex-1">{report}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
