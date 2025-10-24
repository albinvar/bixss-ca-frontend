"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building,
  FileText,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  RotateCw
} from 'lucide-react';
import { caApi } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CADashboardData {
  metrics: {
    assignedCompanies: number;
    newCompaniesThisMonth: number;
    totalAnalyses: number;
    recentAnalyses: number;
    totalDocuments: number;
    recentDocuments: number;
    analysisStatus: {
      completed: number;
      processing: number;
      failed: number;
    };
    successRate: number;
  };
  recentActivities: Array<{
    type: string;
    action: string;
    company: string;
    timestamp: string;
    status: string;
    analysisId?: string;
  }>;
  companies: Array<{
    _id: string;
    name: string;
    industry: string;
    totalAnalyses: number;
    totalDocuments: number;
    lastAnalysisDate: string | null;
    lastAnalysisStatus: string | null;
    daysSinceLastActivity: number | null;
  }>;
}

export default function CADashboard({ user }: { user: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CADashboardData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await caApi.getDashboard();
      if (response.success) {
        setData(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData().finally(() => {
      setIsRefreshing(false);
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const { metrics } = data || {};

  const stats = [
    {
      title: 'Assigned Companies',
      value: metrics?.assignedCompanies || 0,
      change: `${metrics?.newCompaniesThisMonth || 0} this month`,
      icon: Building,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'up'
    },
    {
      title: 'Total Analyses',
      value: metrics?.totalAnalyses || 0,
      change: `${metrics?.recentAnalyses || 0} last 30 days`,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'up'
    },
    {
      title: 'Documents Uploaded',
      value: metrics?.totalDocuments || 0,
      change: `${metrics?.recentDocuments || 0} last 7 days`,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: 'up'
    },
    {
      title: 'Success Rate',
      value: `${metrics?.successRate || 0}%`,
      change: `${metrics?.analysisStatus?.failed || 0} failed`,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: metrics?.analysisStatus?.failed && metrics.analysisStatus.failed > 0 ? 'down' : 'up'
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {getGreeting()}, {user?.name}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Here's what's happening with your clients today.
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

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analysis Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Status</CardTitle>
          <CardDescription>Current status of all analyses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <span className="text-2xl font-bold">{metrics?.analysisStatus?.completed || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Processing</span>
              </div>
              <span className="text-2xl font-bold">{metrics?.analysisStatus?.processing || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium">Failed</span>
              </div>
              <span className="text-2xl font-bold">{metrics?.analysisStatus?.failed || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities and Companies */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Your latest client interactions and updates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentActivities && data.recentActivities.length > 0 ? (
                data.recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`mt-1 rounded-full p-1 ${
                      activity.status === 'completed' ? 'bg-green-100' :
                      activity.status === 'failed' ? 'bg-red-100' :
                      'bg-orange-100'
                    }`}>
                      {activity.status === 'completed' ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : activity.status === 'failed' ? (
                        <AlertCircle className="w-3 h-3 text-red-600" />
                      ) : (
                        <Clock className="w-3 h-3 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.company} • {formatTimestamp(activity.timestamp)}</p>
                    </div>
                    {activity.analysisId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/analysis/${activity.analysisId}`)}
                      >
                        View
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Companies Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Companies Overview</CardTitle>
            <CardDescription>Your assigned companies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.companies && data.companies.length > 0 ? (
                data.companies.slice(0, 5).map((company) => (
                  <div
                    key={company._id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer"
                    onClick={() => router.push(`/dashboard/companies/${company._id}`)}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{company.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{company.industry || 'N/A'}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {company.totalAnalyses} analyses
                        </span>
                      </div>
                    </div>
                    {company.daysSinceLastActivity && company.daysSinceLastActivity > 30 && (
                      <Badge variant="destructive">Needs attention</Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No companies assigned yet</p>
              )}
            </div>
            {data?.companies && data.companies.length > 5 && (
              <Button variant="link" className="w-full mt-2" onClick={() => router.push('/dashboard/clients')}>
                View all {data.companies.length} companies
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
