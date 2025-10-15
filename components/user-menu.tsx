"use client";

import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  Building,
  Shield,
  UserCheck,
  CreditCard,
  Bell
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleBadge = () => {
    switch (user.role) {
      case 'admin':
        return <Badge variant="destructive" className="ml-2"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'ca':
        return <Badge variant="default" className="ml-2"><UserCheck className="h-3 w-3 mr-1" />CA</Badge>;
      case 'company':
        return <Badge variant="secondary" className="ml-2"><Building className="h-3 w-3 mr-1" />Company</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <Avatar className="h-9 w-9">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : (
              <AvatarFallback className="text-sm">{user.avatar || getInitials(user.name)}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{user.name}</p>
              {getRoleBadge()}
            </div>
            <p className="text-xs text-muted-foreground">
              {user.email}
            </p>
            {user.role === 'ca' && user.selectedCompany && (
              <div className="flex items-center gap-1 pt-1">
                <Building className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Company:</span>
                <span className="text-xs font-medium">{user.selectedCompany.name}</span>
              </div>
            )}
            {user.role === 'company' && user.company && (
              <div className="flex items-center gap-1 pt-1">
                <Building className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Company:</span>
                <span className="text-xs font-medium">{user.company.name}</span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
            <Badge variant="destructive" className="ml-auto h-4 px-1 text-[10px]">3</Badge>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
          <LogOut className="mr-2 h-4 w-4" />
          <span className="font-medium">Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}