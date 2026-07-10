import { LogoLoader } from "@/components/brand/logo-loader";

/** App shell route transitions (journal, bible, settings, …). */
export default function AppLoading() {
  return (
    <div className="flex min-h-[min(60dvh,22rem)] w-full items-center justify-center px-3 py-12">
      <LogoLoader size="md" showBrand label="Opening…" />
    </div>
  );
}
