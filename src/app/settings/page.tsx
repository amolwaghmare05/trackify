
'use client';

import { Settings } from 'lucide-react';
import { AppearanceCard } from '@/components/settings/appearance-card';
import { AccountCard } from '@/components/settings/account-card';

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
       <div className="mb-8 flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and application preferences.</p>
        </div>
      </div>

      <div className="space-y-8">
        <AppearanceCard />
        <AccountCard />
      </div>
    </div>
  );
}
