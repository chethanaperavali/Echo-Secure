import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

interface SearchResult {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function useUserSearch() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const query = useQuery({
    queryKey: ['user-search', debouncedSearch],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!debouncedSearch.trim() || debouncedSearch.length < 2) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .or(`username.ilike.%${debouncedSearch}%,display_name.ilike.%${debouncedSearch}%`)
        .neq('user_id', user?.id || '')
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && debouncedSearch.length >= 2,
  });

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    results: query.data || [],
    isSearching: query.isFetching,
    clearSearch,
  };
}
