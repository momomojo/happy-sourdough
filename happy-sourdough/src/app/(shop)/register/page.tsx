'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';

function RegisterContent() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';

  const passwordRequirements = [
    { test: password.length >= 8, label: 'At least 8 characters' },
    { test: /[A-Z]/.test(password), label: 'One uppercase letter' },
    { test: /[a-z]/.test(password), label: 'One lowercase letter' },
    { test: /[0-9]/.test(password), label: 'One number' },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.test);
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('Please meet all password requirements');
      return;
    }

    if (!doPasswordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`.trim(),
          },
        },
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      if (data.user && !data.session) {
        // Email confirmation required
        toast.success('Check your email for a confirmation link!');
        router.push('/login?message=check-email');
      } else {
        // Auto-confirmed (development mode or email confirmation disabled)
        toast.success('Account created successfully!');
        router.push(redirectTo);
        router.refresh();
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border-2 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-md">
            <span className="text-lg font-bold">HS</span>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription>
            Join Happy Sourdough for fresh artisan bread
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="given-name"
                  className="border-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="family-name"
                  className="border-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
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
                  placeholder="Create a password"
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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="text-muted-foreground w-full">
            Already have an account?{' '}
            <Link
              href={`/login${redirectTo !== '/account' ? `?redirect=${redirectTo}` : ''}`}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
