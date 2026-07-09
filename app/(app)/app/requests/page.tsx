import { RequestsWorkspace } from "@/components/requests/requests-workspace";

export const metadata = {
  title: "Prayer requests",
};

export default function RequestsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Prayer requests
        </h1>
        <p className="mt-1 text-muted-foreground">
          Track pending, ongoing, and answered prayers — with reflections.
        </p>
      </div>
      <RequestsWorkspace />
    </div>
  );
}
