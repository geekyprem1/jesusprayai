import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "@/components/auth/auth-form";
import { signIn } from "@/app/auth/actions";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/security/safe-next";

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export const metadata = {
  title: "Log in",
};

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-3 py-8 sm:px-4 sm:py-12">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Continue with Google in one tap — or use email.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!configured && (
            <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              Supabase keys not set yet. UI works; auth will activate after you
              add keys to <code className="text-xs">.env.local</code>.
            </p>
          )}
          <AuthForm
            mode="login"
            action={signIn}
            nextPath={safeNextPath(next, "/app")}
            oauthError={error ? decodeURIComponent(error) : null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
