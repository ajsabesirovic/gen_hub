import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, User, Bell, Palette } from 'lucide-react';
import ChangePassword from './ChangePassword';
import AccountSettings from './AccountSettings';
import PasswordResetRequest from './PasswordResetRequest';
import Preferences from './Preferences';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="text-left">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings, security, and preferences
          </p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="size-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="size-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="password-reset" className="flex items-center gap-2">
              <Shield className="size-4" />
              Reset Password
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Palette className="size-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <AccountSettings />
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <ChangePassword />
          </TabsContent>

          <TabsContent value="password-reset" className="space-y-4">
            <PasswordResetRequest />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Preferences />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
