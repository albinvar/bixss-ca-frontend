"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  FileText,
  Upload,
  Download,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  Filter,
  Calendar,
  User,
  Building,
  File,
  RotateCw,
  FolderOpen,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { financialAnalysisApi, type JobStatus as AnalysisJobStatus } from '@/lib/financial-analysis-api';
import { companiesApi, documentsApi } from '@/lib/api';
import { toast } from 'sonner';

// Document categories
const documentCategories = [
  'Tax Returns',
  'Financial Statements',
  'GST Returns',
  'Compliance Documents',
  'Audit Reports',
  'Invoices',
  'Receipts',
  'Contracts',
  'Other',
];

// Mock documents data
const mockDocuments = [
  {
    id: 1,
    name: 'GST_Return_Q4_2024.pdf',
    category: 'GST Returns',
    size: '2.4 MB',
    uploadedBy: 'John CA',
    uploadDate: '2025-10-10',
    type: 'pdf',
    status: 'verified',
  },
  {
    id: 2,
    name: 'Annual_Financial_Statement_2024.xlsx',
    category: 'Financial Statements',
    size: '5.1 MB',
    uploadedBy: 'John CA',
    uploadDate: '2025-10-08',
    type: 'excel',
    status: 'pending',
  },
  {
    id: 3,
    name: 'Tax_Return_Assessment_Year_2024.pdf',
    category: 'Tax Returns',
    size: '3.8 MB',
    uploadedBy: 'Sarah Tech',
    uploadDate: '2025-10-05',
    type: 'pdf',
    status: 'verified',
  },
  {
    id: 4,
    name: 'Compliance_Certificate_2024.pdf',
    category: 'Compliance Documents',
    size: '1.2 MB',
    uploadedBy: 'John CA',
    uploadDate: '2025-10-03',
    type: 'pdf',
    status: 'verified',
  },
  {
    id: 5,
    name: 'Invoice_Template.docx',
    category: 'Invoices',
    size: '0.8 MB',
    uploadedBy: 'John CA',
    uploadDate: '2025-09-28',
    type: 'word',
    status: 'pending',
  },
  {
    id: 6,
    name: 'Audit_Report_H1_2024.pdf',
    category: 'Audit Reports',
    size: '4.5 MB',
    uploadedBy: 'Admin User',
    uploadDate: '2025-09-20',
    type: 'pdf',
    status: 'verified',
  },
];

interface Company {
  _id: string;
  id: string;
  name: string;
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<AnalysisJobStatus | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    category: '',
    companyId: '',
    files: [] as File[],
  });
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all');

  // Redirect if user is not a CA
  useEffect(() => {
    if (!user) return;

    if (user.role === 'ca') {
      // Fetch CA's companies
      fetchCompanies();
    } else if (user.role === 'company') {
      // For company users, fetch documents for their company
      // company can be either a string (ObjectId) or an object with _id
      const companyId = typeof user.company === 'string'
        ? user.company
        : user.company?._id || user.company?.id;
      console.log('Company user - companyId:', companyId, 'user.company:', user.company);
      if (companyId) {
        fetchDocuments(companyId);
      } else {
        console.error('Company user has no company ID');
      }
    } else {
      // Redirect non-CA and non-company users
      router.push('/dashboard');
    }
  }, [user, router]);

  // Fetch documents when companies are loaded (for CA users)
  useEffect(() => {
    if (user?.role === 'ca' && companies.length > 0) {
      fetchDocuments(selectedCompanyFilter);
    }
  }, [companies, selectedCompanyFilter]);

  const fetchCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      // Check if user is authenticated
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        console.error('No user token found');
        toast.error('Please login again');
        router.push('/login');
        return;
      }

      const response = await companiesApi.getAll({ limit: 100 });
      if (response.success && response.data.companies) {
        setCompanies(response.data.companies);
        // Auto-select first company if available
        if (response.data.companies.length > 0 && !uploadForm.companyId) {
          setUploadForm(prev => ({
            ...prev,
            companyId: response.data.companies[0]._id || response.data.companies[0].id
          }));
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch companies:', error);

      // Handle 401 Unauthorized
      if (error.message && error.message.includes('Unauthorized')) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
      } else {
        toast.error('Failed to load companies. Please check if backend is running.');
      }
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const fetchDocuments = async (companyId?: string) => {
    setIsLoadingDocuments(true);
    try {
      let allDocuments: any[] = [];

      if (companyId && companyId !== 'all') {
        // Fetch documents for specific company
        const response = await documentsApi.getByCompany(companyId, {});
        if (response.success && response.data && response.data.documents) {
          allDocuments = response.data.documents;
        }
      } else {
        // Fetch documents for all companies
        const companyPromises = companies.map(company =>
          documentsApi.getByCompany(company._id || company.id, {})
        );
        const responses = await Promise.all(companyPromises);
        responses.forEach(response => {
          if (response.success && response.data && response.data.documents) {
            allDocuments = [...allDocuments, ...response.data.documents];
          }
        });
      }

      setDocuments(allDocuments);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDocuments(selectedCompanyFilter);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadForm({ ...uploadForm, files: filesArray });
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.files.length || !uploadForm.companyId) {
      toast.error('Please select files and a company');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Find selected company
      const selectedCompany = companies.find(c =>
        (c._id || c.id) === uploadForm.companyId
      );

      if (!selectedCompany) {
        toast.error('Selected company not found');
        return;
      }

      // Upload documents to Node.js backend (MongoDB)
      const response = await documentsApi.upload(
        uploadForm.files,
        uploadForm.companyId,
        uploadForm.category || undefined
      );

      if (response.success) {
        toast.success(`${uploadForm.files.length} document(s) uploaded successfully!`, {
          description: 'Documents are now available for analysis',
        });

        setIsUploadOpen(false);
        setUploadForm({ category: '', companyId: companies[0]?._id || companies[0]?.id || '', files: [] });
        setUploadProgress(100);

        // Refresh documents list to show new uploads
        await fetchDocuments(selectedCompanyFilter);
      } else {
        toast.error(response.error || 'Failed to upload documents');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    try {
      await financialAnalysisApi.pollJobStatus(
        jobId,
        (status) => {
          setJobStatus(status);
          setUploadProgress(status.progress);

          if (status.status === 'processing') {
            toast.info(status.message, { id: jobId });
          }
        }
      );

      // Job completed
      const finalStatus = await financialAnalysisApi.getJobStatus(jobId);
      setJobStatus(finalStatus);

      if (finalStatus.result?.analysis_id) {
        toast.success('Analysis complete! View results in the Analysis page.', {
          action: {
            label: 'View Analysis',
            onClick: () => router.push(`/dashboard/analysis?id=${finalStatus.result?.analysis_id}`)
          }
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Job failed');
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'excel':
        return <FileText className="h-8 w-8 text-green-600" />;
      case 'word':
        return <FileText className="h-8 w-8 text-blue-600" />;
      case 'image':
        return <FileText className="h-8 w-8 text-purple-600" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const docName = doc.originalName || doc.filename || '';
    const docCategory = doc.category || '';
    const matchesSearch = docName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         docCategory.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || docCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSelectedCompany = () => {
    if (user?.role === 'ca' && user.selectedCompany) {
      return user.selectedCompany.name;
    }
    if (user?.role === 'company' && user.company) {
      // company can be a string (ObjectId) or object with name
      return typeof user.company === 'string' ? 'Your Company' : user.company.name;
    }
    return 'All Companies';
  };

  const stats = [
    { label: 'Total Documents', value: documents.length, icon: FileText, color: 'text-blue-600' },
    { label: 'Verified', value: documents.filter(d => d.status === 'analyzed' || d.status === 'verified').length, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Pending', value: documents.filter(d => d.status === 'uploaded' || d.status === 'processing' || d.status === 'pending').length, icon: Clock, color: 'text-yellow-600' },
    { label: 'Categories', value: new Set(documents.map(d => d.category).filter(Boolean)).size, icon: FolderOpen, color: 'text-purple-600' },
  ];

  // Show nothing while loading or for unauthorized users
  if (!user || (user.role !== 'ca' && user.role !== 'company')) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage documents for <span className="font-semibold">{getSelectedCompany()}</span>
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
          {/* Only show upload for CA users */}
          {user?.role === 'ca' && (
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Upload</span>
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle className="text-2xl">Upload Document</DialogTitle>
                <DialogDescription className="text-base">
                  Upload a new document for <span className="font-semibold text-foreground">{getSelectedCompany()}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Company Selection */}
                <div className="space-y-3">
                  <Label htmlFor="company" className="text-base font-semibold">
                    Select Company
                  </Label>
                  {isLoadingCompanies ? (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Loading companies...</span>
                    </div>
                  ) : companies.length > 0 ? (
                    <Select
                      value={uploadForm.companyId}
                      onValueChange={(value) => setUploadForm({ ...uploadForm, companyId: value })}
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

                {/* Category Selection */}
                <div className="space-y-3">
                  <Label htmlFor="category" className="text-base font-semibold">
                    Document Category
                  </Label>
                  <Select
                    value={uploadForm.category}
                    onValueChange={(value) => setUploadForm({ ...uploadForm, category: value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            {category}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* File Upload Area */}
                <div className="space-y-3">
                  <Label htmlFor="file" className="text-base font-semibold">
                    Select Files (Financial Documents)
                  </Label>
                  <div className="relative">
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      multiple
                      className="cursor-pointer"
                      disabled={isUploading}
                    />
                  </div>
                  {uploadForm.files.length > 0 ? (
                    <div className="space-y-2">
                      {uploadForm.files.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-green-900 dark:text-green-100 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-4 border-2 border-dashed rounded-lg text-center">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        PDF, Word, Excel, or Image files supported (Multiple files allowed)
                      </p>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          {jobStatus?.message || 'Uploading and analyzing documents...'}
                        </p>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {uploadProgress}% complete
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsUploadOpen(false);
                    setUploadForm({ category: '', companyId: companies[0]?._id || companies[0]?.id || '', files: [] });
                  }}
                  className="flex-1 sm:flex-none"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!uploadForm.files.length || !uploadForm.companyId || isUploading}
                  className="flex-1 sm:flex-none"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload & Analyze ({uploadForm.files.length})
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center text-center space-y-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Documents List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {documentCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {/* Documents List */}
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc._id || doc.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {getFileIcon(doc.fileType || doc.type || 'pdf')}
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{doc.originalName || doc.filename || doc.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FolderOpen className="h-3 w-3" />
                          {doc.category || 'Uncategorized'}
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {doc.uploadedBy?.name || doc.uploadedBy || 'Unknown'}
                        </span>
                        <span className="hidden md:flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(doc.createdAt || doc.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={doc.status === 'analyzed' || doc.status === 'verified' ? 'default' : 'secondary'}
                      className="text-xs flex-shrink-0"
                    >
                      {doc.status === 'analyzed' || doc.status === 'verified' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </>
                      ) : (
                        doc.status === 'processing' ? 'Processing' : 'Pending'
                      )}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {doc.size || (doc.fileSize ? `${(doc.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'Unknown size')}
                  </p>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or upload a new document
              </p>
              <Button onClick={() => setIsUploadOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}