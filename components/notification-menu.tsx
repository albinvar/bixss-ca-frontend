"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, FileText, UserPlus, AlertCircle, BarChart3, Building2 } from 'lucide-react';
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
import { notificationsApi } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

const NOTIFICATION_ICONS: Record<string, any> = {
  client_added: UserPlus,
  document_uploaded: FileText,
  analysis_completed: BarChart3,
  analysis_failed: AlertCircle,
  compliance_deadline: AlertCircle,
  payment_received: CheckCheck,
  report_generated: FileText,
  company_assigned: Building2,
  system: Bell,
};

export default function NotificationMenu() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await notificationsApi.getNotifications({ limit: 50 });
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Poll notifications every 60 seconds
  useEffect(() => {
    fetchNotifications(); // Initial fetch

    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000); // Poll every 60 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    try {
      // Mark as read
      if (!notification.read) {
        await notificationsApi.markAsRead(notification._id);
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate to link if available
      if (notification.link) {
        router.push(notification.link);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationsApi.markAllAsRead();
      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    const IconComponent = NOTIFICATION_ICONS[type] || Bell;
    return IconComponent;
  };

  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
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
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);

                return (
                  <DropdownMenuItem
                    key={notification._id}
                    className="flex items-start gap-3 p-3 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={`mt-0.5 rounded-full p-2 ${
                      notification.read ? 'bg-gray-100 dark:bg-gray-800' : 'bg-blue-100 dark:bg-blue-950'
                    }`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-tight ${
                          notification.read ? 'font-normal' : 'font-semibold'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuGroup>
        </ScrollArea>
        {notifications.length > 0 && unreadCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-sm font-medium cursor-pointer"
              onClick={handleMarkAllAsRead}
              disabled={loading}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              {loading ? 'Marking...' : 'Mark all as read'}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
