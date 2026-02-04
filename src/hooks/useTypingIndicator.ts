import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useTypingIndicator(conversationId: string | null) {
  const { user } = useAuth();
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingUpdate = useRef<number>(0);

  // Subscribe to typing status changes
  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newRecord = payload.new as { user_id: string; is_typing: boolean } | null;
          if (newRecord && newRecord.user_id !== user.id) {
            setOtherUserTyping(newRecord.is_typing);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  // Clear typing when component unmounts or conversation changes
  useEffect(() => {
    return () => {
      if (conversationId && user) {
        supabase
          .from('typing_indicators')
          .upsert({
            conversation_id: conversationId,
            user_id: user.id,
            is_typing: false,
          })
          .then();
      }
    };
  }, [conversationId, user]);

  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!conversationId || !user) return;

      // Throttle updates to once per second
      const now = Date.now();
      if (isTyping && now - lastTypingUpdate.current < 1000) return;
      lastTypingUpdate.current = now;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      try {
        await supabase.from('typing_indicators').upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_typing: isTyping,
        });

        // Auto-clear typing after 3 seconds of no updates
        if (isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            supabase
              .from('typing_indicators')
              .upsert({
                conversation_id: conversationId,
                user_id: user.id,
                is_typing: false,
              })
              .then();
          }, 3000);
        }
      } catch (error) {
        console.error('Failed to update typing status:', error);
      }
    },
    [conversationId, user]
  );

  return { otherUserTyping, setTyping };
}
