"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Receipt
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const [isRefreshing, setIsRefreshing] = useState(false);

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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                )}
                <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>
                <span className="ml-1 text-muted-foreground">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activities - Wider Column */}
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Your latest client interactions and updates</CardDescription>
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
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Don't miss these important dates</CardDescription>
              </div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
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