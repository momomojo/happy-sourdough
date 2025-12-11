import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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

  // Test Supabase connection
  let supabaseTest: { success: boolean; error?: string; productCount?: number } = { success: false };

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll() { return []; },
            setAll() {},
          },
        }
      );

      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug')
        .limit(5);

      if (error) {
        supabaseTest = { success: false, error: error.message };
      } else {
        supabaseTest = { success: true, productCount: data?.length || 0 };
      }
    } else {
      supabaseTest = { success: false, error: 'Missing environment variables' };
    }
  } catch (err) {
    supabaseTest = { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }

  return NextResponse.json({ ...envCheck, supabaseTest });
}
