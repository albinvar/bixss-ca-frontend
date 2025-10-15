"use client";

import { Bell, CheckCheck, FileText, UserPlus, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const notifications = [
  {
    id: 1,
    title: 'New client onboarded',
    description: 'Tech Solutions Inc. has been added to your portfolio',
    time: '5 min ago',
    icon: UserPlus,
    unread: true,
  },
  {
    id: 2,
    title: 'Document uploaded',
    description: 'GST return documents from Global Finance Corp',
    time: '1 hour ago',
    icon: FileText,
    unread: true,
  },
  {
    id: 3,
    title: 'Compliance deadline approaching',
    description: 'Tax filing due in 3 days for Retail Masters Ltd',
    time: '2 hours ago',
    icon: AlertCircle,
    unread: true,
  },
  {
    id: 4,
    title: 'Payment received',
    description: '₹50,000 received from Healthcare Plus',
    time: '1 day ago',
    icon: CheckCheck,
    unread: false,
  },
  {
    id: 5,
    title: 'Report generated',
    description: 'Monthly financial report is ready to download',
    time: '2 days ago',
    icon: FileText,
    unread: false,
  },
];

export default function NotificationMenu() {
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 px-2 text-xs">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          <DropdownMenuGroup>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start gap-3 p-3 cursor-pointer"
              >
                <div className={`mt-0.5 rounded-full p-2 ${
                  notification.unread ? 'bg-blue-100 dark:bg-blue-950' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <notification.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-tight ${
                      notification.unread ? 'font-semibold' : 'font-normal'
                    }`}>
                      {notification.title}
                    </p>
                    {notification.unread && (
                      <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification.time}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-sm font-medium cursor-pointer">
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark all as read
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}