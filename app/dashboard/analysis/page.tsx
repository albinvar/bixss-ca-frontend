"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  MoreHorizontal,
  FileText,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Download,
  Eye,
  RotateCw,
  AlertCircle,
  PlayCircle,
  Sparkles
} from 'lucide-react';

// Analysis statuses
type AnalysisStatus = 'queued' | 'processing' | 'completed' | 'failed';

// Mock documents data
const mockDocuments = [
  { id: 1, name: 'GST_Return_Q4_2024.pdf', category: 'GST Returns', selected: false },
  { id: 2, name: 'Annual_Financial_Statement_2024.xlsx', category: 'Financial Statements', selected: false },
  { id: 3, name: 'Tax_Return_Assessment_Year_2024.pdf', category: 'Tax Returns', selected: false },
  { id: 4, name: 'Compliance_Certificate_2024.pdf', category: 'Compliance Documents', selected: false },
  { id: 5, name: 'Audit_Report_H1_2024.pdf', category: 'Audit Reports', selected: false },
];

// Mock analysis data
const mockAnalyses = [
  {
    id: 1,
    title: 'Q4 2024 Tax Analysis',
    company: 'Tech Solutions Inc.',
    status: 'completed' as AnalysisStatus,
    documents: 3,
    createdAt: '2025-10-12',
    completedAt: '2025-10-12',
    reports: ['Tax_Summary_Report.pdf', 'Compliance_Check.pdf'],
    progress: 100,
    queuePosition: null,
  },
  {
    id: 2,
    title: 'Financial Statement Review',
    company: 'Global Finance Corp',
    status: 'processing' as AnalysisStatus,
    documents: 2,
    createdAt: '2025-10-13',
    completedAt: null,
    reports: [],
    progress: 65,
    queuePosition: 1,
  },
  {
    id: 3,
    title: 'Compliance Audit Q3',
    company: 'Retail Masters Ltd',
    status: 'queued' as AnalysisStatus,
    documents: 4,
    createdAt: '2025-10-14',
    completedAt: null,
    reports: [],
    progress: 0,
    queuePosition: 2,
  },
  {
    id: 4,
    title: 'Annual Report Analysis',
    company: 'Healthcare Plus',
    status: 'queued' as AnalysisStatus,
    documents: 3,
    createdAt: '2025-10-14',
    completedAt: null,
    reports: [],
    progress: 0,
    queuePosition: 3,
  },
];

export default function AnalysisPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isNewAnalysisOpen, setIsNewAnalysisOpen] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analyses, setAnalyses] = useState(mockAnalyses);

  // Redirect if user is not a CA
  useEffect(() => {
    if (user && user.role !== 'ca') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleDocumentToggle = (docId: number) => {
    setSelectedDocuments(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSubmitAnalysis = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Add new analysis to the list
    const queuedCount = analyses.filter(a => a.status === 'queued' || a.status === 'processing').length;
    const newAnalysis = {
      id: analyses.length + 1,
      title: `Analysis #${analyses.length + 1}`,
      company: getSelectedCompany(),
      status: 'queued' as AnalysisStatus,
      documents: selectedDocuments.length,
      createdAt: new Date().toISOString().split('T')[0],
      completedAt: null,
      reports: [],
      progress: 0,
      queuePosition: queuedCount + 1,
    };

    setAnalyses([newAnalysis, ...analyses]);
    setIsSubmitting(false);
    setShowSuccess(true);

    // Show success animation
    setTimeout(() => {
      setShowSuccess(false);
      setIsNewAnalysisOpen(false);
      setSelectedDocuments([]);
    }, 2000);
  };

  const getSelectedCompany = () => {
    if (user?.role === 'ca' && user.selectedCompany) {
      return user.selectedCompany.name;
    }
    if (user?.role === 'company' && user.company) {
      return user.company.name;
    }
    return 'All Companies';
  };

  const getStatusIcon = (status: AnalysisStatus) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: AnalysisStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'queued':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'completed':
        return 'outline';
      case 'failed':
        return 'destructive';
    }
  };

  const getStatusColor = (status: AnalysisStatus) => {
    switch (status) {
      case 'queued':
        return 'text-muted-foreground';
      case 'processing':
        return 'text-foreground';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
    }
  };

  // Show nothing while redirecting non-CA users
  if (!user || user.role !== 'ca') {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analysis</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            AI-powered document analysis for <span className="font-semibold">{getSelectedCompany()}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh"
          >
            <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={isNewAnalysisOpen} onOpenChange={setIsNewAnalysisOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">New Analysis</span>
                <span className="sm:hidden">New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-2xl">Start New Analysis</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Select documents for <span className="font-semibold text-foreground truncate inline-block max-w-[200px] align-bottom">{getSelectedCompany()}</span>
                </DialogDescription>
              </DialogHeader>

              {!showSuccess ? (
                <>
                  <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
                    {/* Company Info */}
                    <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-muted rounded-lg">
                      <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{getSelectedCompany()}</span>
                    </div>

                    {/* Document Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm sm:text-base font-semibold">Select Documents ({selectedDocuments.length})</Label>
                      <div className="border rounded-lg divide-y max-h-[250px] sm:max-h-[300px] overflow-y-auto">
                        {mockDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => handleDocumentToggle(doc.id)}
                          >
                            <Checkbox
                              checked={selectedDocuments.includes(doc.id)}
                              onCheckedChange={() => handleDocumentToggle(doc.id)}
                              className="flex-shrink-0"
                            />
                            <FileText className="h-4 w-4 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium truncate">{doc.name}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{doc.category}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsNewAnalysisOpen(false);
                        setSelectedDocuments([]);
                      }}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitAnalysis}
                      disabled={selectedDocuments.length === 0 || isSubmitting}
                      className="flex-1 sm:flex-none"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting Analysis...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Start Analysis
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <div className="py-12 text-center space-y-4 animate-in fade-in duration-500">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center animate-in zoom-in duration-300">
                      <CheckCircle2 className="h-8 w-8 text-green-600 animate-in zoom-in duration-500 delay-150" />
                    </div>
                  </div>
                  <div className="space-y-2 animate-in slide-in-from-bottom duration-500 delay-300">
                    <h3 className="text-xl font-semibold">Analysis Added to Queue!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your analysis has been queued and will be processed shortly
                    </p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Global Queue Overview */}
      {analyses.some(a => a.status === 'queued' || a.status === 'processing') && (
        <div className="flex items-center gap-2 px-4 py-2.5 border rounded-lg bg-muted/30">
          <TrendingUp className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium text-sm">Global Queue:</span>
          <span className="text-sm text-muted-foreground">
            {analyses.filter(a => a.status === 'processing').length} processing • {analyses.filter(a => a.status === 'queued').length} queued
          </span>
        </div>
      )}

      {/* Analysis List */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Queue</CardTitle>
          <CardDescription>Track and manage your document analyses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Status Icon with Queue Position */}
                <div className="flex-shrink-0">
                  {analysis.queuePosition ? (
                    <div className={`flex items-center justify-center h-10 w-10 rounded-full border ${
                      analysis.status === 'processing'
                        ? 'border-foreground bg-foreground/5 animate-pulse'
                        : 'border-muted-foreground bg-muted'
                    }`}>
                      <span className="text-sm font-bold">
                        #{analysis.queuePosition}
                      </span>
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  )}
                </div>

                {/* Analysis Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium mb-1">{analysis.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          <span className="truncate max-w-[120px] sm:max-w-none">{analysis.company}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {analysis.documents} docs
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 flex-shrink-0">
                      <Badge variant={getStatusVariant(analysis.status)} className="text-xs">
                        {getStatusIcon(analysis.status)}
                        <span className="ml-1 capitalize hidden sm:inline">{analysis.status}</span>
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {analysis.status === 'completed' && analysis.reports.length > 0 && (
                            <>
                              {analysis.reports.map((report, idx) => (
                                <DropdownMenuItem key={idx}>
                                  <Download className="mr-2 h-4 w-4" />
                                  {report}
                                </DropdownMenuItem>
                              ))}
                            </>
                          )}
                          {analysis.status === 'queued' && (
                            <DropdownMenuItem className="text-red-600">
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Cancel Analysis
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Progress Bar (for processing analyses) */}
                  {analysis.status === 'processing' && (
                    <div className="space-y-1.5 mt-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">Progress</span>
                        <span className="font-bold">{analysis.progress}%</span>
                      </div>
                      <Progress value={analysis.progress} className="h-1.5" />
                    </div>
                  )}

                  {/* Queue Position Info (for queued analyses) */}
                  {analysis.status === 'queued' && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Position #{analysis.queuePosition}</span>
                    </div>
                  )}

                  {/* Reports (only for completed analyses) */}
                  {analysis.status === 'completed' && analysis.reports.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                      <span>{analysis.reports.length} report{analysis.reports.length > 1 ? 's' : ''} ready</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {analyses.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No analyses yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start your first document analysis
              </p>
              <Button onClick={() => setIsNewAnalysisOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}