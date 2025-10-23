"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Building,
  MoreHorizontal,
  Search,
  Mail,
  Phone,
  MapPin,
  FileText,
  Download,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCw,
  ShieldAlert
} from 'lucide-react';
import { companiesApi } from '@/lib/api';

interface Company {
  _id?: string;
  id?: string;
  name: string;
  representative?: {
    _id: string;
    name: string;
    email: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  industry?: string;
  status?: 'active' | 'pending' | 'inactive';
  createdAt?: string;
  description?: string;
  registrationNumber?: string;
}

export default function ClientsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);

  // Redirect if user is not a CA
  useEffect(() => {
    if (user && user.role !== 'ca') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const response = await companiesApi.getAll({ limit: 100 });

      if (response.success && response.data && response.data.companies) {
        setCompanies(response.data.companies);
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCompanies();
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'inactive':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'inactive':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const filteredCompanies = companies.filter(company => {
    const email = company.representative?.email || company.contactInfo?.email || '';
    const industry = company.industry || '';

    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         industry.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && company.status === activeTab;
  });

  // Show nothing while redirecting non-CA users
  if (!user || user.role !== 'ca') {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Assigned Companies</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage companies assigned to you
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" title="Export">
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

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                <TabsTrigger value="active" className="text-xs sm:text-sm">Active</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending</TabsTrigger>
                <TabsTrigger value="inactive" className="text-xs sm:text-sm">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        {/* Clients Grid */}
        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-6 w-20" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                    <div className="pt-3 border-t space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCompanies.map((company) => {
                  const companyId = company._id || company.id;
                  const email = company.representative?.email || company.contactInfo?.email || 'N/A';
                  const phone = company.contactInfo?.phone || 'N/A';
                  const address = company.contactInfo?.address || 'N/A';
                  const status = company.status || 'active';

                  return (
                    <Card key={companyId} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="text-sm">
                                {company.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{company.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {company.industry || 'N/A'}
                              </CardDescription>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/companies/${companyId}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/documents?companyId=${companyId}`)}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Documents
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/analysis?companyId=${companyId}`)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Analyze Documents
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant={getStatusVariant(status)} className="text-xs">
                            {getStatusIcon(status)}
                            <span className="ml-1 capitalize">{status}</span>
                          </Badge>
                          {company.registrationNumber && (
                            <span className="text-xs text-muted-foreground">
                              Reg: {company.registrationNumber}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{email}</span>
                          </div>
                          {phone !== 'N/A' && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 flex-shrink-0" />
                              <span>{phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{address}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t space-y-2">
                          {company.representative && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Representative</span>
                              <span className="font-medium truncate ml-2">
                                {company.representative.name}
                              </span>
                            </div>
                          )}
                          {company.createdAt && (
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Joined</span>
                              <span>{new Date(company.createdAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredCompanies.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No companies found</h3>
                  <p className="text-sm text-muted-foreground">
                    {companies.length === 0
                      ? 'No companies assigned to you yet'
                      : 'Try adjusting your search or filters'}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}