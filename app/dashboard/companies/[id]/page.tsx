"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  TrendingUp,
  Users,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { companiesApi, analysisApi, documentsApi } from '@/lib/api';

export default function CompanyDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (companyId) {
      fetchCompanyDetails();
      fetchAnalysisHistory();
      fetchDocuments();
    }
  }, [companyId]);

  const fetchCompanyDetails = async () => {
    try {
      setIsLoading(true);
      const response = await companiesApi.getById(companyId);
      if (response.success && response.data.company) {
        setCompany(response.data.company);
      }
    } catch (error) {
      console.error('Error fetching company:', error);
      toast.error('Failed to load company details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalysisHistory = async () => {
    try {
      const response = await analysisApi.getHistory(companyId, 50);
      if (response.success && response.data && response.data.analyses) {
        const historicalAnalyses = response.data.analyses.map((item: any) => ({
          id: item.analysis_id,
          date: new Date(item.date).toLocaleDateString(),
          documentCount: item.document_count || 0,
          status: 'completed'
        }));
        setAnalyses(historicalAnalyses);
      }
    } catch (error) {
      console.error('Error fetching analysis history:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await documentsApi.getByCompany(companyId);
      if (response.success && response.data && response.data.documents) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      active: 'default',
      pending: 'secondary',
      inactive: 'outline'
    };
    return variants[status] || 'outline';
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-4 sm:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Company Not Found</h3>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-7 w-7" />
            {company.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Company Details and Analysis History
          </p>
        </div>
        <Badge variant={getStatusBadge(company.status)}>
          {company.status || 'Active'}
        </Badge>
      </div>

      {/* Company Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Industry</Label>
                <p className="text-sm font-medium">{company.industry || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Registration Number</Label>
                <p className="text-sm font-medium">{company.registrationNumber || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Representative</Label>
                <p className="text-sm font-medium">{company.representative?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{company.contactInfo?.email || company.representative?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{company.contactInfo?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{company.contactInfo?.address || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(company.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned CAs Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assigned Chartered Accountants
          </CardTitle>
        </CardHeader>
        <CardContent>
          {company.invitedCAs && company.invitedCAs.length > 0 ? (
            <div className="space-y-3">
              {company.invitedCAs.map((invite: any) => (
                <div key={invite._id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar>
                    <AvatarFallback>
                      {invite.ca?.name?.charAt(0) || 'CA'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{invite.ca?.name || 'CA'}</p>
                    <p className="text-xs text-muted-foreground">{invite.ca?.email || ''}</p>
                  </div>
                  <Badge variant={invite.status === 'accepted' ? 'default' : 'secondary'}>
                    {invite.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No CAs assigned to this company yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Documents and Analysis */}
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analysis">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analysis History ({analyses.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents ({documents.length})
          </TabsTrigger>
        </TabsList>

        {/* Analysis History Tab */}
        <TabsContent value="analysis" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Analysis History</CardTitle>
              <CardDescription>Past financial analyses for this company</CardDescription>
            </CardHeader>
            <CardContent>
              {analyses.length > 0 ? (
                <div className="space-y-3">
                  {analyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/analysis`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Analysis on {analysis.date}</p>
                          <p className="text-xs text-muted-foreground">
                            {analysis.documentCount} document{analysis.documentCount !== 1 ? 's' : ''} analyzed
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No analyses yet for this company</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Uploaded financial documents</CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.originalName}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.category} • Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{doc.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
