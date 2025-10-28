"use client";

import { useState } from 'react';
import ProtectedRoute from '@/components/protected-route';
import CompanySwitcher from '@/components/company-switcher';
import UserMenu from '@/components/user-menu';
import NotificationMenu from '@/components/notification-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  Home,
  Users,
  FileText,
  Calculator,
  TrendingUp,
  Settings,
  HelpCircle,
  CreditCard,
  Building,
  FolderOpen,
  Calendar,
  BarChart3,
  Shield,
  Receipt,
  Briefcase,
  ChevronRight,
  Target
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

const navigationItems = {
  main: [
    { title: 'Dashboard', icon: Home, href: '/dashboard', badge: null },
    { title: 'Companies', icon: Building, href: '/dashboard/clients', badge: '6' },
    { title: 'Documents', icon: FileText, href: '/dashboard/documents', badge: 'New' },
    { title: 'Analysis', icon: BarChart3, href: '/dashboard/analysis', badge: '2' },
    { title: 'Compare', icon: Calendar, href: '/dashboard/compare', badge: null },
    { title: 'Benchmarks', icon: Target, href: '/dashboard/benchmarks', badge: null, caOnly: true },
  ],
  admin: [
    { title: 'Manage CAs', icon: Users, href: '/dashboard/admin/cas' },
    { title: 'Manage Companies', icon: Building, href: '/dashboard/admin/companies' },
  ]
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/10">
          {/* Sidebar */}
          <Sidebar className="border-r-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-slate-900/50">
            <SidebarHeader className="border-b border-slate-200/60 dark:border-slate-800/60 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/30">
                  <span className="text-xl font-bold">B</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">Bixss CA</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Management Platform</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <ScrollArea className="flex-1 px-3">
                {/* Main Navigation */}
                <SidebarGroup>
                  <SidebarGroupLabel>Main</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {navigationItems.main.map((item: any) => {
                        // Hide CA-only items for non-CA users
                        if (item.caOnly && user?.role !== 'ca') {
                          return null;
                        }

                        // Hide CA-specific items for company users (Companies, Compare)
                        if (user?.role === 'company' && (item.title === 'Companies' || item.title === 'Compare')) {
                          return null;
                        }

                        // Hide Documents and Analysis for admin (show for both CA and company)
                        if (user?.role === 'admin' && (item.title === 'Documents' || item.title === 'Analysis')) {
                          return null;
                        }

                        return (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname === item.href}
                            >
                              <Link href={item.href}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                                {item.badge && (
                                  <Badge
                                    variant={item.badge === 'New' ? 'default' : 'secondary'}
                                    className="ml-auto h-5 px-1.5 text-[10px]"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                {/* Admin Section - Only for admin role */}
                {user?.role === 'admin' && (
                  <SidebarGroup>
                    <SidebarGroupLabel>Administration</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {navigationItems.admin.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname === item.href}
                            >
                              <Link href={item.href}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                )}
              </ScrollArea>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200/60 dark:border-slate-800/60 p-4 bg-gradient-to-t from-slate-50/50 to-transparent dark:from-slate-900/50">
              {/* Footer content removed */}
            </SidebarFooter>
          </Sidebar>

          {/* Main Content Area */}
          <SidebarInset className="flex-1 overflow-hidden">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-10 flex h-16 items-center gap-2 sm:gap-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-3 sm:px-6 shadow-sm">
              <SidebarTrigger className="-ml-1 sm:-ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" />
              <Separator orientation="vertical" className="h-6 hidden sm:block bg-slate-200/60 dark:bg-slate-800/60" />

              {/* Breadcrumb or Page Title Area */}
              <div className="flex-1 min-w-0">
                {user?.role === 'ca' && <CompanySwitcher />}
                {user?.role === 'company' && user.company && (
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg">{user.company.logo}</span>
                    <span className="font-medium text-sm sm:text-base truncate">{user.company.name}</span>
                    <Badge variant="outline" className="ml-2 hidden sm:inline-flex">{user.company.industry}</Badge>
                  </div>
                )}
                {user?.role === 'admin' && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                    <span className="font-semibold text-sm sm:text-base truncate">System Administration</span>
                  </div>
                )}
              </div>

              {/* Right side of navbar */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <ThemeToggle />
                <NotificationMenu />
                <UserMenu />
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50/50 via-blue-50/20 to-indigo-50/10 dark:from-slate-950/50 dark:via-blue-950/20 dark:to-indigo-950/10">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}