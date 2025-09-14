'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function AppearanceCard() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize the look and feel of the application to your preference.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          defaultValue={theme}
          onValueChange={setTheme}
          className="grid max-w-md grid-cols-1 gap-8 pt-2 md:grid-cols-3"
        >
          <div>
            <Label className="cursor-pointer">
              <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                  <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                    <div className="h-2 w-10/12 rounded-lg bg-slate-300" />
                    <div className="h-2 w-full rounded-lg bg-slate-300" />
                  </div>
                  <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                    <div className="h-4 w-4 rounded-full bg-slate-300" />
                    <div className="h-2 w-full rounded-lg bg-slate-300" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-2 pt-4">
                <p className="text-sm font-normal text-muted-foreground">Light</p>
                <RadioGroupItem value="light" className="peer" />
              </div>
            </Label>
          </div>
          <div>
            <Label className="cursor-pointer">
              <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                  <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                    <div className="h-2 w-10/12 rounded-lg bg-slate-400" />
                    <div className="h-2 w-full rounded-lg bg-slate-400" />
                  </div>
                  <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                    <div className="h-4 w-4 rounded-full bg-slate-400" />
                    <div className="h-2 w-full rounded-lg bg-slate-400" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-2 pt-4">
                <p className="text-sm font-normal text-muted-foreground">Dark</p>
                <RadioGroupItem value="dark" className="peer" />
              </div>
            </Label>
          </div>
          <div>
            <Label className="cursor-pointer">
              <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                  <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                    <div className="h-2 w-10/12 rounded-lg bg-slate-300" />
                    <div className="h-2 w-full rounded-lg bg-slate-300" />
                  </div>
                  <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                    <div className="h-4 w-4 rounded-full bg-slate-400" />
                    <div className="h-2 w-full rounded-lg bg-slate-400" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-2 pt-4">
                <p className="text-sm font-normal text-muted-foreground">System</p>
                <RadioGroupItem value="system" className="peer" />
              </div>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
