// lib/supabase/server.ts
// TODO: Install @supabase/auth-helpers-nextjs if Supabase integration is needed
// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerClient = () => {
  // TODO: Uncomment and implement when Supabase package is installed
  // return createServerComponentClient({
  //   cookies,
  // })
  throw new Error('Supabase client not configured. Please install @supabase/auth-helpers-nextjs package.')
}