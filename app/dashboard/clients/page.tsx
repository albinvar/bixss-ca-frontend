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

// Mock clients data
const clients = [
  {
    id: 1,
    name: 'Tech Solutions Inc.',
    email: 'contact@techsolutions.com',
    phone: '+91 98765 43210',
    industry: 'Technology',
    size: '50-200',
    status: 'active',
    location: 'Mumbai, Maharashtra',
    joinDate: '2024-01-15',
    revenue: '₹12.5L',
    pendingTasks: 5,
    completedTasks: 45,
    lastActivity: '2 hours ago',
  },
  {
    id: 2,
    name: 'Global Finance Corp',
    email: 'info@globalfinance.com',
    phone: '+91 98765 43211',
    industry: 'Finance',
    size: '200-500',
    status: 'active',
    location: 'Delhi, NCR',
    joinDate: '2024-02-20',
    revenue: '₹8.3L',
    pendingTasks: 3,
    completedTasks: 32,
    lastActivity: '1 day ago',
  },
  {
    id: 3,
    name: 'Retail Masters Ltd',
    email: 'hello@retailmasters.com',
    phone: '+91 98765 43212',
    industry: 'Retail',
    size: '10-50',
    status: 'active',
    location: 'Bangalore, Karnataka',
    joinDate: '2024-03-10',
    revenue: '₹6.7L',
    pendingTasks: 7,
    completedTasks: 28,
    lastActivity: '3 hours ago',
  },
  {
    id: 4,
    name: 'Healthcare Plus',
    email: 'admin@healthcareplus.com',
    phone: '+91 98765 43213',
    industry: 'Healthcare',
    size: '100-200',
    status: 'pending',
    location: 'Pune, Maharashtra',
    joinDate: '2024-04-05',
    revenue: '₹4.2L',
    pendingTasks: 2,
    completedTasks: 15,
    lastActivity: '5 days ago',
  },
  {
    id: 5,
    name: 'Manufacturing Pro',
    email: 'contact@mfgpro.com',
    phone: '+91 98765 43214',
    industry: 'Manufacturing',
    size: '500-1000',
    status: 'inactive',
    location: 'Chennai, Tamil Nadu',
    joinDate: '2023-12-01',
    revenue: '₹15.8L',
    pendingTasks: 0,
    completedTasks: 67,
    lastActivity: '2 months ago',
  },
  {
    id: 6,
    name: 'EduTech Innovators',
    email: 'info@edutech.in',
    phone: '+91 98765 43215',
    industry: 'Education',
    size: '50-100',
    status: 'active',
    location: 'Hyderabad, Telangana',
    joinDate: '2024-05-12',
    revenue: '₹5.9L',
    pendingTasks: 4,
    completedTasks: 22,
    lastActivity: '4 hours ago',
  },
];

export default function ClientsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect if user is not a CA
  useEffect(() => {
    if (user && user.role !== 'ca') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh action
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
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

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.industry.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && client.status === activeTab;
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{client.name}</CardTitle>
                        <CardDescription className="text-xs">{client.industry}</CardDescription>
                      </div>
                    </div>
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
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Update Info
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Generate Report
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Export Data
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={getStatusVariant(client.status)} className="text-xs">
                      {getStatusIcon(client.status)}
                      <span className="ml-1 capitalize">{client.status}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">{client.size} employees</span>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span>{client.location}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-semibold">{client.revenue}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tasks</span>
                      <span>
                        <span className="font-semibold text-orange-600">{client.pendingTasks}</span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="text-green-600">{client.completedTasks}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last activity</span>
                      <span>{client.lastActivity}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No companies found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}