'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type Role = 'admin' | 'staff' | 'manager' | 'super-admin';

export function useRole() {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // In a real app, you would fetch the role from a profiles table
        // For this demo, we'll simulate a role based on the user metadata or a specific field
        setRole('super-admin'); 
      }
      setLoading(false);
    }
    getRole();
  }, []);

  const isAdmin = role === 'admin' || role === 'super-admin';
  const isSuperAdmin = role === 'super-admin';
  const isManager = role === 'manager' || isAdmin;

  return { role, isAdmin, isSuperAdmin, isManager, loading };
}
