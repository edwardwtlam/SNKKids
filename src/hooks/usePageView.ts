import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Hook to track page views in the page_views table.
 * Call this once in App.tsx to track all navigation.
 */
export function usePageView() {
  const location = useLocation();

  useEffect(() => {
    // Record page view (fire and forget, no await)
    supabase
      .from('page_views')
      .insert({ page: location.pathname })
      .then(() => {
        // Silent success
      })
      .catch(() => {
        // Silent failure - don't break the app if tracking fails
      });
  }, [location.pathname]);
}
