'use client';

import { useState } from 'react';
import type { User } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User as UserIcon, Save, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserInformationCardProps {
  user: User;
  onUpdateName: (newName: string) => Promise<void>;
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
};

export function UserInformationCard({ user, onUpdateName }: UserInformationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const { toast } = useToast();

  const handleSave = async () => {
    if (displayName.trim() === '') {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Name cannot be empty.',
        });
        return;
    }
    await onUpdateName(displayName);
    setIsEditing(false);
    toast({
        title: 'Success!',
        description: 'Your name has been updated.',
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <UserIcon className="h-6 w-6 text-primary" />
            <div>
                <CardTitle className="font-headline">User Information</CardTitle>
                <CardDescription>Your personal account details.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
                <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                <AvatarFallback className="text-3xl">{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
        </div>

        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        readOnly={!isEditing}
                        className="flex-grow"
                    />
                    {isEditing ? (
                        <Button onClick={handleSave} size="icon">
                            <Save className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={() => setIsEditing(true)} variant="outline" size="icon">
                            <Pencil className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email || ''} readOnly className="bg-muted/50" />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
