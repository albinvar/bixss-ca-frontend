"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building, UserCheck, Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'ca' | 'company'>('company');

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (role: 'admin' | 'ca' | 'company') => {
    switch (role) {
      case 'admin':
        setEmail('admin@bixssca.com');
        setPassword('admin123');
        break;
      case 'ca':
        setEmail('ca@bixssca.com');
        setPassword('ca123');
        break;
      case 'company':
        setEmail('company@techsolutions.com');
        setPassword('company123');
        break;
    }
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-black">
            Bixss CA
          </h1>
          <p className="text-sm text-gray-600">
            Comprehensive CA Management Platform
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quick Login Tabs */}
              <Tabs value={selectedRole} onValueChange={(value) => quickLogin(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="admin" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </TabsTrigger>
                  <TabsTrigger value="ca" className="text-xs">
                    <UserCheck className="h-3 w-3 mr-1" />
                    CA
                  </TabsTrigger>
                  <TabsTrigger value="company" className="text-xs">
                    <Building className="h-3 w-3 mr-1" />
                    Company
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="admin" className="mt-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs font-medium mb-1">Demo Account</p>
                    <p className="text-xs text-muted-foreground">
                      Full system access and control
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="ca" className="mt-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs font-medium mb-1">Demo Account</p>
                    <p className="text-xs text-muted-foreground">
                      Manage multiple client companies
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="company" className="mt-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs font-medium mb-1">Demo Account</p>
                    <p className="text-xs text-muted-foreground">
                      Company representative access
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Login Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 text-xs text-center text-muted-foreground">
            <p>Demo credentials are pre-filled when you select a role</p>
            <div className="flex gap-2 text-xs">
              <a href="#" className="hover:underline">Forgot Password?</a>
              <span>•</span>
              <a href="#" className="hover:underline">Contact Support</a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}