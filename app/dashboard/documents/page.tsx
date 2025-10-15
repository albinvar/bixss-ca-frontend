"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Clock
} from 'lucide-react';

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

export default function DocumentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    category: '',
    file: null as File | null,
  });

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm({ ...uploadForm, file: e.target.files[0] });
    }
  };

  const handleUpload = () => {
    // Handle upload logic here
    console.log('Uploading:', uploadForm);
    setIsUploadOpen(false);
    setUploadForm({ category: '', file: null });
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

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSelectedCompany = () => {
    if (user?.role === 'ca' && user.selectedCompany) {
      return user.selectedCompany.name;
    }
    if (user?.role === 'company' && user.company) {
      return user.company.name;
    }
    return 'All Companies';
  };

  const stats = [
    { label: 'Total Documents', value: mockDocuments.length, icon: FileText, color: 'text-blue-600' },
    { label: 'Verified', value: mockDocuments.filter(d => d.status === 'verified').length, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Pending', value: mockDocuments.filter(d => d.status === 'pending').length, icon: Clock, color: 'text-yellow-600' },
    { label: 'Categories', value: documentCategories.length - 1, icon: FolderOpen, color: 'text-purple-600' },
  ];

  // Show nothing while redirecting non-CA users
  if (!user || user.role !== 'ca') {
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
                {/* Company Info Badge */}
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{getSelectedCompany()}</span>
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
                    Select File
                  </Label>
                  <div className="relative">
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      className="cursor-pointer"
                    />
                  </div>
                  {uploadForm.file ? (
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100 truncate">
                          {uploadForm.file.name}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-4 border-2 border-dashed rounded-lg text-center">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        PDF, Word, Excel, or Image files supported
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
                    setUploadForm({ category: '', file: null });
                  }}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!uploadForm.category || !uploadForm.file}
                  className="flex-1 sm:flex-none"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                key={doc.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {getFileIcon(doc.type)}
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{doc.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FolderOpen className="h-3 w-3" />
                          {doc.category}
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {doc.uploadedBy}
                        </span>
                        <span className="hidden md:flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={doc.status === 'verified' ? 'default' : 'secondary'}
                      className="text-xs flex-shrink-0"
                    >
                      {doc.status === 'verified' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </>
                      ) : (
                        'Pending'
                      )}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {doc.size}
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