
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
       <div className="mb-8 flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account and application settings.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Under Construction</CardTitle>
            <CardDescription>This page is currently under development. Please check back later!</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Settings and preferences will be available here in a future update.</p>
        </CardContent>
      </Card>
    </div>
  );
}
