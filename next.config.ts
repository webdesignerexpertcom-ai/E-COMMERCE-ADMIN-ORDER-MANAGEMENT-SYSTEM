import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

// Debug log for Vercel builds
if (process.env.NODE_ENV === 'production') {
  const criticalVars = ['MONGODB_URI', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  criticalVars.forEach(v => {
    if (!process.env[v]) {
      console.warn(`⚠️ WARNING: Essential environment variable ${v} is missing during the build process!`);
    }
  });
}

export default nextConfig;
