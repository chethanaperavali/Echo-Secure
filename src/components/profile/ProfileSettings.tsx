import { useState, useRef } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Camera, Loader2, Save, User, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSettings({ open, onOpenChange }: ProfileSettingsProps) {
  const { user } = useAuth();
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync state when profile loads
  useState(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 2MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await uploadAvatar.mutateAsync(file);
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been changed.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updateProfile.mutateAsync({ display_name: displayName });
      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved.',
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Settings
          </DialogTitle>
          <DialogDescription>
            Update your display name and profile picture.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="gradient-secure text-primary-foreground text-2xl">
                  {profile?.display_name?.[0] || profile?.username?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadAvatar.isPending ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
              Click to change your avatar
            </p>
          </div>

          {/* Username (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={profile?.username || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Username cannot be changed
            </p>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex-1 gradient-secure"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
