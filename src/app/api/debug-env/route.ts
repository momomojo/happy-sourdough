import { NextResponse } from 'next/server';

export async function GET() {
  const envCheck = {
    NEXT_PUBLIC_SUPABASE_URL: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      startsWithHttps: process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') || false,
      length: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      startsWithEyJ: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ') || false,
      length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      startsWithEyJ: process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ') || false,
      length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    },
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
  };

  return NextResponse.json(envCheck);
}
