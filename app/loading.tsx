import { LogoLoader } from "@/components/brand/logo-loader";

/** Shown during Next.js route segment loads / navigations. */
export default function RootLoading() {
  return (
    <div className="flex min-h-[min(70dvh,28rem)] w-full items-center justify-center px-4 py-16">
      <LogoLoader size="lg" showBrand label="Loading…" />
    </div>
  );
}
