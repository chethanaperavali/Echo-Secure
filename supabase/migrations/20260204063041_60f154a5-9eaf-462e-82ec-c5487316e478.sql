-- Create a security definer function to check if user is participant in a conversation
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE conversation_id = _conversation_id
      AND user_id = _user_id
  )
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can delete participants of their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON public.messages;

-- Recreate policies using the security definer function

-- conversation_participants policies
CREATE POLICY "Users can view participants of their conversations" 
ON public.conversation_participants 
FOR SELECT 
USING (public.is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "Users can delete participants of their conversations" 
ON public.conversation_participants 
FOR DELETE 
USING (public.is_conversation_participant(conversation_id, auth.uid()));

-- conversations policies
CREATE POLICY "Users can view their conversations" 
ON public.conversations 
FOR SELECT 
USING (public.is_conversation_participant(id, auth.uid()));

CREATE POLICY "Users can delete their conversations" 
ON public.conversations 
FOR DELETE 
USING (public.is_conversation_participant(id, auth.uid()));

-- messages policies
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages 
FOR SELECT 
USING (public.is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "Users can send messages to their conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (sender_id = auth.uid() AND public.is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "Users can delete messages in their conversations" 
ON public.messages 
FOR DELETE 
USING (public.is_conversation_participant(conversation_id, auth.uid()));