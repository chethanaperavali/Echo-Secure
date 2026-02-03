-- Allow users to delete conversations they're part of
CREATE POLICY "Users can delete their conversations" 
ON public.conversations 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM conversation_participants
  WHERE conversation_participants.conversation_id = conversations.id 
  AND conversation_participants.user_id = auth.uid()
));

-- Allow cascade delete of participants when conversation is deleted
CREATE POLICY "Users can delete participants of their conversations" 
ON public.conversation_participants 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM conversation_participants cp
  WHERE cp.conversation_id = conversation_participants.conversation_id 
  AND cp.user_id = auth.uid()
));

-- Allow cascade delete of messages when conversation is deleted
CREATE POLICY "Users can delete messages in their conversations" 
ON public.messages 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM conversation_participants
  WHERE conversation_participants.conversation_id = messages.conversation_id 
  AND conversation_participants.user_id = auth.uid()
));