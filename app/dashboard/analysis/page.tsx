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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import AnalysisNotes from '@/components/analysis-notes';
import { companiesApi, documentsApi, benchmarksApi } from '@/lib/api';
import { financialAnalysisApi } from '@/lib/financial-analysis-api';
import { analysisApi } from '@/lib/api';
import { toast } from 'sonner';

// Analysis statuses
type AnalysisStatus = 'queued' | 'processing' | 'completed' | 'failed';

interface Company {
  _id: string;
  id: string;
  name: string;
}

interface Document {
  _id: string;
  originalName: string;
  category: string;
  fileType: string;
  status: string;
  createdAt: string;
}

export default function AnalysisPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isNewAnalysisOpen, setIsNewAnalysisOpen] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [expandedAnalysisId, setExpandedAnalysisId] = useState<string | null>(null);

  // Redirect if user is not authorized
  useEffect(() => {
    if (!user) return;

    if (user.role === 'ca') {
      fetchCompanies();
    } else if (user.role === 'company') {
      // For company users, set their company as selected
      const companyId = user?.company?._id || user?.company;
      console.log('Company user - companyId:', companyId, 'user.company:', user.company);
      if (companyId) {
        setSelectedCompanyId(companyId);
        // Set company name for display
        if (user.company?.name) {
          setSelectedCompany({ id: companyId, name: user.company.name });
        }
      } else {
        console.error('Company user has no company ID');
      }
    } else {
      // Redirect non-CA and non-company users
      router.push('/dashboard');
    }
  }, [user, router]);

  // Fetch documents when company changes
  useEffect(() => {
    if (selectedCompanyId) {
      fetchDocuments(selectedCompanyId);
      fetchAnalysisHistory(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      const response = await companiesApi.getAll({ limit: 100 });
      if (response.success && response.data.companies) {
        setCompanies(response.data.companies);
        if (response.data.companies.length > 0) {
          setSelectedCompanyId(response.data.companies[0]._id || response.data.companies[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const fetchDocuments = async (companyId: string) => {
    setIsLoadingDocuments(true);
    try {
      // Call Node.js backend for documents
      const response = await documentsApi.getByCompany(companyId, { status: 'uploaded' });
      if (response.success && response.data && response.data.documents) {
        setDocuments(response.data.documents);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error('Failed to load documents');
      setDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const fetchAnalysisHistory = async (companyId: string) => {
    try {
      // Call Node.js backend instead of Python
      const response = await analysisApi.getHistory(companyId, 50);
      if (response.success && response.data && response.data.analyses) {
        // Map history to analysis list
        const historicalAnalyses = response.data.analyses.map((item: any) => ({
          id: item.analysis_id,
          title: `Analysis for ${response.data.company_name}`,
          company: response.data.company_name,
          status: 'completed' as AnalysisStatus,
          documents: item.document_count || 0,
          createdAt: new Date(item.date).toISOString().split('T')[0],
          completedAt: new Date(item.date).toISOString().split('T')[0],
          reports: [],
          progress: 100,
          queuePosition: null,
        }));
        setAnalyses(historicalAnalyses);
      }
    } catch (error) {
      console.error('Failed to fetch analysis history:', error);
      // Don't show error toast as this is not critical
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (selectedCompanyId) {
      fetchDocuments(selectedCompanyId);
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleDocumentToggle = (docId: string) => {
    setSelectedDocuments(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSubmitAnalysis = async () => {
    if (!selectedCompanyId || selectedDocuments.length === 0) {
      toast.error('Please select documents to analyze');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get selected company details
      const selectedCompany = companies.find(c =>
        (c._id || c.id) === selectedCompanyId
      );

      if (!selectedCompany) {
        toast.error('Selected company not found');
        return;
      }

      // Get the selected documents details
      const selectedDocs = documents.filter(doc =>
        selectedDocuments.includes(doc._id)
      );

      if (selectedDocs.length === 0) {
        toast.error('Selected documents not found');
        return;
      }

      // Get MongoDB document IDs (strings)
      const documentIds = selectedDocs.map(doc => doc._id);

      // Call Node.js backend which proxies to Python microservice
      // Benchmarks will be automatically fetched by the backend
      const response = await analysisApi.trigger(
        documentIds,
        selectedCompanyId,
        selectedCompany.name,
        'comprehensive'
      );

      console.log('Analysis response:', response);

      if (response.success && response.data?.job_id) {
        const jobId = response.data.job_id;
        // Create analysis entry with real job ID
        const queuedCount = analyses.filter(a => a.status === 'queued' || a.status === 'processing').length;
        const newAnalysis = {
          id: jobId,
          title: `Analysis for ${selectedCompany.name}`,
          company: selectedCompany.name,
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

        toast.success(`Analysis started! Job ID: ${jobId}`);

        // Start polling for job status
        pollJobStatus(jobId);
      } else {
        throw new Error('No job ID returned from analysis service');
      }

      // Show success animation
      setTimeout(() => {
        setShowSuccess(false);
        setIsNewAnalysisOpen(false);
        setSelectedDocuments([]);
      }, 2000);

    } catch (error: any) {
      console.error('Failed to start analysis:', error);
      toast.error(error.message || 'Failed to start analysis');
      setIsSubmitting(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    try {
      await financialAnalysisApi.pollJobStatus(
        jobId,
        (status) => {
          // Update analysis in list
          setAnalyses(prev => prev.map(analysis =>
            analysis.id === jobId
              ? {
                  ...analysis,
                  status: status.status as AnalysisStatus,
                  progress: status.progress
                }
              : analysis
          ));

          if (status.status === 'processing') {
            toast.info(status.message, { id: jobId });
          }
        }
      );

      // Job completed - get final status
      const finalStatus = await financialAnalysisApi.getJobStatus(jobId);

      // Update analysis with actual analysis_id from result
      const analysisId = finalStatus.result?.analysis_id;

      setAnalyses(prev => prev.map(analysis =>
        analysis.id === jobId
          ? {
              ...analysis,
              id: analysisId || analysis.id, // Update to analysis_id
              status: 'completed' as AnalysisStatus,
              progress: 100,
              completedAt: new Date().toISOString().split('T')[0]
            }
          : analysis
      ));

      if (analysisId) {
        toast.success('Analysis complete!', {
          description: `Analysis ID: ${analysisId}`,
          action: {
            label: 'View Results',
            onClick: () => router.push(`/dashboard/analysis/${analysisId}`)
          }
        });
      }
    } catch (error: any) {
      console.error('Job polling error:', error);
      setAnalyses(prev => prev.map(analysis =>
        analysis.id === jobId
          ? { ...analysis, status: 'failed' as AnalysisStatus }
          : analysis
      ));
      toast.error('Analysis failed');
    }
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

  // Show nothing while loading or for unauthorized users
  if (!user || (user.role !== 'ca' && user.role !== 'company')) {
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
          {/* Only show new analysis button for CA users */}
          {user?.role === 'ca' && (
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
                    {/* Company Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="company-select" className="text-sm sm:text-base font-semibold">
                        Select Company
                      </Label>
                      {isLoadingCompanies ? (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Loading companies...</span>
                        </div>
                      ) : companies.length > 0 ? (
                        <Select
                          value={selectedCompanyId}
                          onValueChange={setSelectedCompanyId}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map((company) => (
                              <SelectItem key={company._id || company.id} value={company._id || company.id}>
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4" />
                                  {company.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-900 dark:text-yellow-100">No companies assigned to you</span>
                        </div>
                      )}
                    </div>

                    {/* Document Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm sm:text-base font-semibold">Select Documents ({selectedDocuments.length})</Label>
                      {isLoadingDocuments ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : documents.length > 0 ? (
                        <div className="border rounded-lg divide-y max-h-[250px] sm:max-h-[300px] overflow-y-auto">
                          {documents.map((doc) => (
                            <div
                              key={doc._id}
                              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => handleDocumentToggle(doc._id)}
                            >
                              <Checkbox
                                checked={selectedDocuments.includes(doc._id)}
                                onCheckedChange={() => handleDocumentToggle(doc._id)}
                                className="flex-shrink-0"
                              />
                              <FileText className="h-4 w-4 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium truncate">{doc.originalName}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{doc.category}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          No documents uploaded for this company. Upload documents first from the Documents page.
                        </div>
                      )}
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
          )}
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
                className={`flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                  analysis.status === 'completed' ? 'cursor-pointer' : ''
                }`}
                onClick={() => {
                  if (analysis.status === 'completed') {
                    router.push(`/dashboard/analysis/${analysis.id}`);
                  }
                }}
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

                  {/* Show Notes Button (only for completed analyses) */}
                  {analysis.status === 'completed' && (
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedAnalysisId(expandedAnalysisId === analysis.id ? null : analysis.id);
                        }}
                        className="w-full"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {expandedAnalysisId === analysis.id ? 'Hide' : 'Show'} CA Notes
                        {expandedAnalysisId === analysis.id ? (
                          <ChevronUp className="h-4 w-4 ml-auto" />
                        ) : (
                          <ChevronDown className="h-4 w-4 ml-auto" />
                        )}
                      </Button>

                      {/* Notes Component */}
                      {expandedAnalysisId === analysis.id && (
                        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                          <AnalysisNotes analysisId={analysis.id} />
                        </div>
                      )}
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