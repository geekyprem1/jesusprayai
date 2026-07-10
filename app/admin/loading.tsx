import { LogoLoader } from "@/components/brand/logo-loader";

export default function AdminLoading() {
  return (
    <div className="flex min-h-[40dvh] items-center justify-center py-12">
      <LogoLoader size="md" label="Loading admin…" />
    </div>
  );
}
