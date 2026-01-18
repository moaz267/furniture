import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // استدعاء الدالة التي قمت بإنشائها في الـ SQL (has_role)
        const { data, error: rpcError } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });

        if (rpcError) {
          console.error('Error checking role:', rpcError);
          setIsAdmin(false);
        } else {
          setIsAdmin(data); // ستكون true لو هو أدمن
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, []);

  return { isAdmin, loading };
};