'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Shield, Eye, EyeOff, Loader2, Mail } from 'lucide-react';

function AdminLoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  // Check if admin setup is needed
  useEffect(() => {
    async function checkSetup() {
      const supabase = createClient();
      const { count, error } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true });

      if (!error && (count ?? 0) === 0) {
        setNeedsSetup(true);
      }
      setIsCheckingSetup(false);
    }
    checkSetup();
  }, []);

  // Check if already authenticated as admin
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check if user is admin
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (adminUser) {
          router.push('/admin/dashboard');
        }
      }
    }
    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();

      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        toast.error('Authentication failed');
        setIsLoading(false);
        return;
      }

      // Check if user is admin
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('user_id', data.user.id)
        .single() as { data: { role: string; is_active: boolean } | null; error: unknown };

      if (adminError || !adminUser) {
        await supabase.auth.signOut();
        toast.error('Unauthorized: Admin access required');
        setIsLoading(false);
        return;
      }

      if (!adminUser.is_active) {
        await supabase.auth.signOut();
        toast.error('Your admin account has been deactivated');
        setIsLoading(false);
        return;
      }

      // Success - redirect to dashboard
      toast.success('Welcome back!');
      router.push('/admin/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  if (isCheckingSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (needsSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Admin Setup Required</CardTitle>
            <CardDescription>
              No admin accounts exist yet. Create the first administrator account to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push('/admin/setup')}
            >
              Begin Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-2 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-md">
            <Shield className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Admin Login
          </CardTitle>
          <CardDescription>
            Access the Happy Sourdough admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message === 'check-email' && (
            <Alert className="mb-4">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Please check your email and click the confirmation link before logging in.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@happysourdough.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
                className="border-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="border-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
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

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              &larr; Back to storefront
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
