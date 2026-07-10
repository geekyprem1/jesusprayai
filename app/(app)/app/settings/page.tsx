import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignOutButton } from "@/components/app/sign-out-button";
import { ReminderSettings } from "@/components/settings/reminder-settings";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="flex w-full max-w-lg flex-col gap-4 sm:gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Account, daily reminders, and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>
            {configured
              ? "You're signed in to your account."
              : "Sign in to sync your account across devices."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignOutButton />
        </CardContent>
      </Card>

      {configured ? (
        <ReminderSettings />
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Reminders</CardTitle>
            <CardDescription>
              Sign in to set up daily prayer reminders.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
