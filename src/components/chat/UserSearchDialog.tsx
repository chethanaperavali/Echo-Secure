import { useUserSearch } from '@/hooks/useUserSearch';
import { useConversations } from '@/hooks/useConversations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2, Shield, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversationId: string) => void;
}

export function UserSearchDialog({
  open,
  onOpenChange,
  onConversationCreated,
}: UserSearchDialogProps) {
  const { searchTerm, setSearchTerm, results, isSearching, clearSearch } = useUserSearch();
  const { createConversation } = useConversations();
  const { toast } = useToast();

  const handleSelectUser = async (username: string) => {
    try {
      const result = await createConversation.mutateAsync(username);
      clearSearch();
      onOpenChange(false);
      onConversationCreated(result.id);
      toast({
        title: 'Conversation created',
        description: 'End-to-end encryption is now active.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to create conversation',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      onOpenChange(value);
      if (!value) clearSearch();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            New Secure Conversation
          </DialogTitle>
          <DialogDescription>
            Search for a user by username or display name.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Results */}
          <ScrollArea className="h-[300px]">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : searchTerm.length < 2 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Type at least 2 characters to search</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((result) => (
                  <button
                    key={result.user_id}
                    onClick={() => handleSelectUser(result.username)}
                    disabled={createConversation.isPending}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={result.avatar_url || undefined} />
                      <AvatarFallback className="gradient-secure text-primary-foreground">
                        {result.display_name?.[0] || result.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {result.display_name || result.username}
                        </span>
                        <Shield className="w-3 h-3 text-primary flex-shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        @{result.username}
                      </p>
                    </div>
                    {createConversation.isPending && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
