
'use client';

import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User as UserIcon, Save, Pencil, X } from 'lucide-react';
import { LevelAvatar } from './level-avatar';

interface UserInformationCardProps {
  user: User;
  onUpdateName: (newName: string) => Promise<void>;
  level: number;
}

export function UserInformationCard({ user, onUpdateName, level }: UserInformationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || '');
  
  useEffect(() => {
    setDisplayName(user.displayName || '');
  }, [user.displayName]);

  const handleSave = async () => {
    if (displayName.trim() !== '' && displayName.trim() !== user.displayName) {
        await onUpdateName(displayName.trim());
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setDisplayName(user.displayName || '');
    setIsEditing(false);
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
            <LevelAvatar level={level} className="h-24 w-24" />
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
                        <>
                           <Button onClick={handleSave} size="icon">
                                <Save className="h-4 w-4" />
                            </Button>
                             <Button onClick={handleCancel} variant="outline" size="icon">
                                <X className="h-4 w-4" />
                            </Button>
                        </>
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
