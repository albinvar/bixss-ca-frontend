"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import CADashboard from '@/components/CADashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Calendar,
  Activity,
  CreditCard,
  Download,
  RotateCw,
  MoreHorizontal,
  Building,
  CheckCircle,
  AlertCircle,
  Clock,
  Receipt,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { companiesApi, analysisApi, documentsApi } from '@/lib/api';
import { toast } from 'sonner';

// Mock dashboard data
const statsData = [
  {
    title: 'Total Clients',
    value: '245',
    change: '+12.5%',
    trend: 'up',
    icon: Building,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Revenue',
    value: '₹45.2L',
    change: '+8.2%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Pending Tasks',
    value: '18',
    change: '-5%',
    trend: 'down',
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Compliance Rate',
    value: '92%',
    change: '+2.1%',
    trend: 'up',
    icon: CheckCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

const recentActivities = [
  { id: 1, action: 'New client onboarded', client: 'Tech Solutions Inc.', time: '2 hours ago', status: 'completed' },
  { id: 2, action: 'Tax return filed', client: 'Global Finance Corp', time: '4 hours ago', status: 'completed' },
  { id: 3, action: 'Compliance check due', client: 'Retail Masters Ltd', time: 'Tomorrow', status: 'pending' },
  { id: 4, action: 'Invoice sent', client: 'Healthcare Plus', time: 'Yesterday', status: 'completed' },
  { id: 5, action: 'Document uploaded', client: 'Manufacturing Pro', time: '3 days ago', status: 'completed' },
];

const upcomingDeadlines = [
  { id: 1, task: 'GST Return Filing', client: 'Tech Solutions Inc.', date: 'Oct 20, 2025', priority: 'high' },
  { id: 2, task: 'Income Tax Return', client: 'Global Finance Corp', date: 'Oct 25, 2025', priority: 'medium' },
  { id: 3, task: 'Audit Report', client: 'Retail Masters Ltd', date: 'Nov 1, 2025', priority: 'high' },
  { id: 4, task: 'Compliance Review', client: 'Healthcare Plus', date: 'Nov 5, 2025', priority: 'low' },
];

const clientOverview = [
  { name: 'Tech Solutions Inc.', industry: 'Technology', status: 'active', revenue: '₹12.5L', tasks: 5 },
  { name: 'Global Finance Corp', industry: 'Finance', status: 'active', revenue: '₹8.3L', tasks: 3 },
  { name: 'Retail Masters Ltd', industry: 'Retail', status: 'active', revenue: '₹6.7L', tasks: 7 },
  { name: 'Healthcare Plus', industry: 'Healthcare', status: 'pending', revenue: '₹4.2L', tasks: 2 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // If user is admin role, redirect to admin dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      router.push('/dashboard/admin');
    }
  }, [user, router]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh action
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // If user is CA role, show CA dashboard
  if (user?.role === 'ca') {
    return <CADashboard user={user} />;
  }

  // If user is company role, show company dashboard
  if (user?.role === 'company') {
    return <CompanyDashboard user={user} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            {getGreeting()}, {user?.name}!
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 font-medium">
            Here's what's happening with your clients today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" title="Export" className="rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm">
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh"
            className="rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm"
          >
            <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <Card key={index} className="border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {stat.title}
              </CardTitle>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${
                stat.color === 'text-blue-600' ? 'from-blue-500 to-indigo-600' :
                stat.color === 'text-green-600' ? 'from-emerald-500 to-green-600' :
                stat.color === 'text-orange-600' ? 'from-amber-500 to-orange-600' :
                'from-violet-500 to-purple-600'
              } shadow-md`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">{stat.value}</div>
              <p className="text-xs flex items-center mt-2">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                )}
                <span className={`font-semibold ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
                <span className="ml-1 text-slate-600 dark:text-slate-400">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activities - Wider Column */}
        <Card className="col-span-full lg:col-span-4 border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Recent Activities</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Your latest client interactions and updates</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View all</DropdownMenuItem>
                  <DropdownMenuItem>Filter</DropdownMenuItem>
                  <DropdownMenuItem>Export</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className={`h-2 w-2 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.action}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.client} • {activity.time}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines - Narrower Column */}
        <Card className="col-span-full lg:col-span-3 border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Upcoming Deadlines</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Don't miss these important dates</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex flex-col space-y-2 p-3 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{deadline.task}</span>
                    <Badge
                      variant={
                        deadline.priority === 'high' ? 'destructive' :
                        deadline.priority === 'medium' ? 'default' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {deadline.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{deadline.client}</span>
                    <span className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {deadline.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Overview Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Client Overview</CardTitle>
              <CardDescription>Manage and monitor your client portfolio</CardDescription>
            </div>
            <Tabs defaultValue="all" className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-3 sm:grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 sm:p-4 font-medium text-xs sm:text-sm whitespace-nowrap">Client</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">Industry</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-xs sm:text-sm whitespace-nowrap">Status</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">Revenue</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-xs sm:text-sm whitespace-nowrap hidden xl:table-cell">Active Tasks</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-xs sm:text-sm whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-background">
                    {clientOverview.map((client, index) => (
                      <tr key={index} className="hover:bg-muted/50 transition-colors">
                        <td className="p-3 sm:p-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                              <AvatarFallback className="text-[10px] sm:text-xs">
                                {client.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{client.name}</span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-xs sm:text-sm hidden md:table-cell whitespace-nowrap">{client.industry}</td>
                        <td className="p-3 sm:p-4 whitespace-nowrap">
                          <Badge
                            variant={client.status === 'active' ? 'default' : 'secondary'}
                            className="text-[10px] sm:text-xs"
                          >
                            {client.status}
                          </Badge>
                        </td>
                        <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium hidden lg:table-cell whitespace-nowrap">{client.revenue}</td>
                        <td className="p-3 sm:p-4 hidden xl:table-cell whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm">{client.tasks}</span>
                            <Progress value={(client.tasks / 10) * 100} className="w-12 sm:w-16 h-2" />
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Send Message</DropdownMenuItem>
                              <DropdownMenuItem>Generate Report</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Company Dashboard Component
function CompanyDashboard({ user }: { user: any }) {
  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    // Company can be an object with _id or just a string ID
    const companyId = user?.company?._id || user?.company;
    if (companyId) {
      fetchCompanyData(companyId);
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchCompanyData = async (companyId: string) => {
    try {
      setIsLoading(true);

      // Fetch company details, analyses, and documents in parallel
      const [companyRes, analysisRes, documentsRes] = await Promise.all([
        companiesApi.getById(companyId),
        analysisApi.getHistory(companyId, 10).catch(() => ({ success: false })),
        documentsApi.getByCompany(companyId).catch(() => ({ success: false }))
      ]);

      if (companyRes.success && companyRes.data.company) {
        setCompany(companyRes.data.company);
      }

      if (analysisRes.success && analysisRes.data?.analyses) {
        setAnalyses(analysisRes.data.analyses.slice(0, 5));
      }

      if (documentsRes.success && documentsRes.data?.documents) {
        setDocuments(documentsRes.data.documents.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      toast.error('Failed to load company information');
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {company?.name || 'Your company'} dashboard
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          {/* Company Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Company Name</p>
                    <p className="text-base font-medium">{company?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Industry</p>
                    <p className="text-base font-medium">{company?.industry || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registration Number</p>
                    <p className="text-base font-medium">{company?.registrationNumber || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{company?.contactInfo?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{company?.contactInfo?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{company?.contactInfo?.address || 'N/A'}</span>
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
              <CardDescription>Your company's CA professionals</CardDescription>
            </CardHeader>
            <CardContent>
              {company?.invitedCAs && company.invitedCAs.length > 0 ? (
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
                      <Badge variant="default">Active</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No CAs assigned yet
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}