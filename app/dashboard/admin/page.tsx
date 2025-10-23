"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Building,
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    // Only super admins can access this page
    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const { overview, growth, companiesByIndustry, topCAs, recentActivities, systemHealth } = analytics || {};

  const stats = [
    {
      title: 'Total Companies',
      value: overview?.totalCompanies || 0,
      change: `${overview?.recentCompanies || 0} this month`,
      icon: Building,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'up'
    },
    {
      title: 'Total CAs',
      value: overview?.totalCAs || 0,
      active: overview?.activeCAs || 0,
      inactive: overview?.inactiveCAs || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: 'neutral'
    },
    {
      title: 'Total Analyses',
      value: overview?.totalAnalyses || 0,
      change: `${growth?.analysesLast30Days || 0} last 30 days`,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'up'
    },
    {
      title: 'System Health',
      value: `${systemHealth?.activeUsers || 0} Active Users`,
      pending: systemHealth?.pendingAnalyses || 0,
      failed: systemHealth?.failedAnalyses || 0,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: systemHealth?.failedAnalyses > 0 ? 'down' : 'up'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive overview of system analytics and management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {stat.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                  {stat.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                  {stat.change}
                </p>
              )}
              {stat.active !== undefined && (
                <div className="flex gap-2 mt-2 text-xs">
                  <Badge variant="outline" className="text-green-600">
                    {stat.active} Active
                  </Badge>
                  <Badge variant="outline" className="text-gray-600">
                    {stat.inactive} Inactive
                  </Badge>
                </div>
              )}
              {stat.pending !== undefined && (
                <div className="flex gap-2 mt-2 text-xs">
                  <Badge variant="outline" className="text-orange-600">
                    {stat.pending} Pending
                  </Badge>
                  {stat.failed > 0 && (
                    <Badge variant="outline" className="text-red-600">
                      {stat.failed} Failed
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cas">Top CAs</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Growth Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
                <CardDescription>Analysis and company growth trends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Analyses (Last 30 Days)</span>
                  </div>
                  <span className="text-2xl font-bold">{growth?.analysesLast30Days || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Analyses (Last 7 Days)</span>
                  </div>
                  <span className="text-2xl font-bold">{growth?.analysesLast7Days || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">New Companies (This Month)</span>
                  </div>
                  <span className="text-2xl font-bold">{growth?.companiesLast30Days || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system health metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Active Users</span>
                  </div>
                  <span className="text-2xl font-bold">{systemHealth?.activeUsers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm">Pending Analyses</span>
                  </div>
                  <span className="text-2xl font-bold">{systemHealth?.pendingAnalyses || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm">Failed Analyses</span>
                  </div>
                  <span className="text-2xl font-bold">{systemHealth?.failedAnalyses || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing CAs</CardTitle>
              <CardDescription>CAs ranked by number of assigned companies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCAs && topCAs.length > 0 ? (
                  topCAs.map((ca: any, index: number) => (
                    <div key={ca._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{ca.name}</p>
                          <p className="text-sm text-muted-foreground">{ca.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{ca.companyCount}</p>
                        <p className="text-xs text-muted-foreground">companies</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No CAs found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Companies by Industry</CardTitle>
              <CardDescription>Distribution of companies across industries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {companiesByIndustry && companiesByIndustry.length > 0 ? (
                  companiesByIndustry.map((industry: any) => (
                    <div key={industry._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{industry._id || 'Not Specified'}</span>
                      </div>
                      <Badge variant="secondary">{industry.count} companies</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest analyses and system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities && recentActivities.length > 0 ? (
                  recentActivities.map((activity: any) => (
                    <div key={activity._id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Analysis {activity.analysisId}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.company?.name} • by {activity.uploadedBy?.name} ({activity.uploadedBy?.role})
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No recent activities</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
