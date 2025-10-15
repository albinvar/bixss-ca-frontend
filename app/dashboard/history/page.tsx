"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  MoreHorizontal,
  FileText,
  Building,
  Calendar,
  CheckCircle2,
  Download,
  Eye,
  RotateCw,
  Clock,
  Filter,
  ArrowUpDown,
  Share2,
  FileCheck,
  AlertTriangle,
  X,
  GitCompare,
  ArrowLeftRight,
  TrendingUp as TrendUp,
  MinusCircle,
  PlusCircle
} from 'lucide-react';

// Analysis types and statuses
type AnalysisType = 'Tax' | 'Compliance' | 'Audit' | 'Financial';
type AnalysisStatus = 'shared' | 'pending_action' | 'completed';

// Mock history data
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

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all'); // all, 7days, 30days, custom
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, company, type
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<number | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [compareMode, setCompareMode] = useState(false);

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

  const handleExport = () => {
    // Export to CSV logic
    console.log('Exporting history to CSV...');
  };

  const handleCompareToggle = (id: number) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else if (prev.length < 2) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      const ids = selectedForCompare.join(',');
      router.push(`/dashboard/history/compare?ids=${ids}`);
    }
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    if (compareMode) {
      // Exit compare mode, clear selections
      setSelectedForCompare([]);
    }
  };

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

  const companies = Array.from(new Set(mockHistory.map(h => h.company)));
  const types: AnalysisType[] = ['Tax', 'Compliance', 'Audit', 'Financial'];

  const filteredHistory = mockHistory
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.insights.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCompany = selectedCompany === 'all' || item.company === selectedCompany;
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

      // Date range filter
      let matchesDate = true;
      if (dateRange !== 'all') {
        const itemDate = new Date(item.createdAt);
        const now = new Date();
        if (dateRange === '7days') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = itemDate >= weekAgo;
        } else if (dateRange === '30days') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = itemDate >= monthAgo;
        }
      }

      return matchesSearch && matchesCompany && matchesType && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'company':
          return a.company.localeCompare(b.company);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  // Show nothing while redirecting non-CA users
  if (!user || user.role !== 'ca') {
    return null;
  }

  const activeFilters = [
    selectedCompany !== 'all' && { key: 'company', label: selectedCompany, clear: () => setSelectedCompany('all') },
    selectedType !== 'all' && { key: 'type', label: selectedType, clear: () => setSelectedType('all') },
    selectedStatus !== 'all' && { key: 'status', label: selectedStatus === 'shared' ? 'Shared' : selectedStatus === 'pending_action' ? 'Pending' : 'Completed', clear: () => setSelectedStatus('all') },
    dateRange !== 'all' && { key: 'date', label: dateRange === '7days' ? 'Last 7 days' : 'Last 30 days', clear: () => setDateRange('all') },
  ].filter(Boolean);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analysis History</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {filteredHistory.length} analysis report{filteredHistory.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={compareMode ? "default" : "outline"}
            size="sm"
            onClick={toggleCompareMode}
            className="hidden sm:flex"
          >
            <GitCompare className="h-4 w-4 mr-2" />
            {compareMode ? 'Exit Compare' : 'Compare'}
          </Button>
          <Button
            variant={compareMode ? "default" : "outline"}
            size="icon"
            onClick={toggleCompareMode}
            className="sm:hidden"
            title={compareMode ? "Exit Compare Mode" : "Compare Mode"}
          >
            <GitCompare className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleExport}
            title="Export to CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh"
          >
            <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Compare Mode Helper */}
      {compareMode && (
        <div className="flex items-center justify-between p-4 bg-muted/50 border rounded-lg">
          <div className="flex items-center gap-2">
            <GitCompare className="h-4 w-4" />
            <span className="text-sm font-medium">
              Select 2 analyses to compare
            </span>
            {selectedForCompare.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedForCompare.length} selected
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={toggleCompareMode}>
            Cancel
          </Button>
        </div>
      )}

      {/* Advanced Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium text-sm">Filters</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('date-desc')}>
                  Date (Newest First)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('date-asc')}>
                  Date (Oldest First)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('company')}>
                  Company (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('type')}>
                  Type (A-Z)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="shared">Shared with Client</SelectItem>
                <SelectItem value="pending_action">Pending Action</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground">Active:</span>
              {activeFilters.map((filter: any) => (
                <Badge key={filter.key} variant="secondary" className="text-xs">
                  {filter.label}
                  <button
                    onClick={filter.clear}
                    className="ml-1.5 hover:bg-muted rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* History List */}
          <div className="space-y-3">
            {filteredHistory.map((item) => {
              const statusBadge = getStatusBadge(item.status);
              const StatusIcon = statusBadge.icon;

              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors ${
                    selectedForCompare.includes(item.id) ? 'border-foreground bg-muted/50' : ''
                  }`}
                >
                  {/* Checkbox for comparison - only show in compare mode */}
                  {compareMode && (
                    <div className="flex-shrink-0 pt-1">
                      <Checkbox
                        checked={selectedForCompare.includes(item.id)}
                        onCheckedChange={() => handleCompareToggle(item.id)}
                        disabled={selectedForCompare.length >= 2 && !selectedForCompare.includes(item.id)}
                      />
                    </div>
                  )}

                  {/* Icon */}
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="text-sm font-semibold">{item.title}</h3>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {item.type}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {item.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {item.documents} docs
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.completedAt).toLocaleDateString()}
                          </span>
                          <span className="hidden sm:flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.duration}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 flex-shrink-0">
                        <Badge variant={statusBadge.variant} className="text-xs">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">{statusBadge.label}</span>
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedAnalysis(item.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {item.reports.map((report, idx) => (
                              <DropdownMenuItem key={idx}>
                                <Download className="mr-2 h-4 w-4" />
                                {report}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem>
                              <Share2 className="mr-2 h-4 w-4" />
                              Share Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Findings Summary */}
                    <div className="flex items-center gap-4 mt-2 mb-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        <FileCheck className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{item.findings.total}</span>
                        <span className="text-muted-foreground">findings</span>
                      </div>
                      {item.findings.critical > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-red-600">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span className="font-medium">{item.findings.critical}</span>
                          <span>critical</span>
                        </div>
                      )}
                      {item.findings.warnings > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span className="font-medium">{item.findings.warnings}</span>
                          <span>warnings</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                        <span>{item.reports.length} report{item.reports.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Key Insights - Collapsed by default */}
                    <div className="text-xs text-muted-foreground">
                      {item.insights.slice(0, 2).map((insight, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 mt-1">
                          <span className="mt-1">•</span>
                          <span>{insight}</span>
                        </div>
                      ))}
                      {item.insights.length > 2 && (
                        <button
                          onClick={() => setSelectedAnalysis(item.id)}
                          className="text-foreground hover:underline mt-1"
                        >
                          +{item.insights.length - 2} more insights
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No history found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Compare Button - only show in compare mode with selections */}
      {compareMode && selectedForCompare.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Card className="shadow-lg border-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <GitCompare className="h-5 w-5" />
                  <span className="font-medium text-sm">
                    {selectedForCompare.length} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedForCompare.length === 2 ? (
                    <Button onClick={handleCompare} size="sm">
                      <ArrowLeftRight className="h-4 w-4 mr-2" />
                      Compare
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Select {2 - selectedForCompare.length} more
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedForCompare([])}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
