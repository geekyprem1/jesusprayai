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

export const metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-3 py-8 sm:px-4 sm:py-12">
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Free to start. Journal prayers and grow your walk with God.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!configured && (
            <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              Supabase keys not set yet. Add them to{" "}
              <code className="text-xs">.env.local</code> before signing up.
            </p>
          )}
          <AuthForm mode="signup" action={signUp} />
        </CardContent>
      </Card>
    </div>
  );
}
