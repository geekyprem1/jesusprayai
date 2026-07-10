import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "@/components/auth/auth-form";
import { signUp } from "@/app/auth/actions";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/security/safe-next";

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export const metadata = {
  title: "Sign up",
};

export default async function SignupPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-3 py-8 sm:px-4 sm:py-12">
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Fastest path: Continue with Google. Free to start.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!configured && (
            <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              Supabase keys not set yet. Add them to{" "}
              <code className="text-xs">.env.local</code> before signing up.
            </p>
          )}
          <AuthForm
            mode="signup"
            action={signUp}
            nextPath={safeNextPath(next, "/app")}
            oauthError={error ? decodeURIComponent(error) : null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
