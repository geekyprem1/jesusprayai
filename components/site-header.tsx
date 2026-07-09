import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/app/sign-out-button";
import { SiteHeaderClient } from "@/components/site-header-client";

export async function SiteHeader() {
  let email: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      email = user?.email ?? null;
    } catch {
      email = null;
    }
  }

  return (
    <SiteHeaderClient email={email} signOutSlot={<SignOutButton />} />
  );
}
