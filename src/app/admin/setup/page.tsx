'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, Eye, EyeOff, Loader2, Check, AlertCircle, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { setupFirstAdmin, isSetupAvailable } from './actions';

export default function AdminSetupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [setupKey, setSetupKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [setupStatus, setSetupStatus] = useState<{
    available: boolean;
    requiresKey: boolean;
    isDisabled: boolean;
  }>({
    available: false,
    requiresKey: false,
    isDisabled: false,
  });
  const router = useRouter();

  // Check if admin setup is available
  useEffect(() => {
    async function checkSetup() {
      const status = await isSetupAvailable();
      setSetupStatus(status);
      setIsChecking(false);
    }
    checkSetup();
  }, []);

  const passwordRequirements = [
    { test: password.length >= 8, label: 'At least 8 characters' },
    { test: /[A-Z]/.test(password), label: 'One uppercase letter' },
    { test: /[a-z]/.test(password), label: 'One lowercase letter' },
    { test: /[0-9]/.test(password), label: 'One number' },
    { test: /[^A-Za-z0-9]/.test(password), label: 'One special character' },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.test);
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('Please meet all password requirements');
      return;
    }

    if (!doPasswordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    if (setupStatus.requiresKey && !setupKey.trim()) {
      toast.error('Setup key is required');
      return;
    }

    setIsLoading(true);

    try {
      // Call server action to create admin
      const result = await setupFirstAdmin(
        email,
        password,
        fullName,
        setupStatus.requiresKey ? setupKey : undefined
      );

      if (!result.success) {
        toast.error(result.error || 'Failed to create admin account');
        setIsLoading(false);
        return;
      }

      toast.success('Admin account created successfully!');

      if (result.requiresEmailConfirmation) {
        toast.info('Please check your email to confirm your account');
        router.push('/admin/login?message=check-email');
      } else {
        // Need to sign in manually since we used server action
        router.push('/admin/login?message=setup-complete');
      }
    } catch (error) {
      console.error('Setup error:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show disabled message if setup is globally disabled
  if (setupStatus.isDisabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Setup Disabled</CardTitle>
            <CardDescription>
              Admin setup has been disabled by the system administrator. Please contact support for assistance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push('/admin/login')}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show already complete message if admins exist
  if (!setupStatus.available) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle>Setup Already Complete</CardTitle>
            <CardDescription>
              An admin account already exists. Please use the login page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push('/admin/login')}
            >
              Go to Login
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
            Admin Setup
          </CardTitle>
          <CardDescription>
            Create the first administrator account for Happy Sourdough
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This account will have full super admin privileges. Keep your credentials secure.
            </AlertDescription>
          </Alert>

          {setupStatus.requiresKey && (
            <Alert className="mb-4 border-orange-200 bg-orange-50">
              <Lock className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                A setup key is required. Contact your system administrator for the setup key.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSetup} className="space-y-4">
            {setupStatus.requiresKey && (
              <div className="space-y-2">
                <Label htmlFor="setupKey" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Setup Key
                </Label>
                <Input
                  id="setupKey"
                  type="password"
                  placeholder="Enter setup key"
                  value={setupKey}
                  onChange={(e) => setSetupKey(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="off"
                  className="border-2 border-orange-300 focus-visible:ring-orange-500"
                />
                <p className="text-xs text-muted-foreground">
                  Required for production setup. Contact your system administrator.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Admin User"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="name"
                className="border-2"
              />
            </div>
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
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
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
              {password.length > 0 && (
                <ul className="text-xs space-y-1 mt-2">
                  {passwordRequirements.map((req, index) => (
                    <li
                      key={index}
                      className={`flex items-center gap-1.5 ${
                        req.test ? 'text-green-600' : 'text-muted-foreground'
                      }`}
                    >
                      {req.test ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <span className="h-3 w-3 rounded-full border border-current" />
                      )}
                      {req.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="new-password"
                className={`border-2 ${
                  confirmPassword.length > 0
                    ? doPasswordsMatch
                      ? 'border-green-500 focus-visible:ring-green-500'
                      : 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
              />
              {confirmPassword.length > 0 && !doPasswordsMatch && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin Account...
                </>
              ) : (
                'Create Admin Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
