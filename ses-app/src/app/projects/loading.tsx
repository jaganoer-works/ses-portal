import { CardSkeleton } from "@/components/ui/Loading";

export default function Loading() {
  return (
    <main className="min-h-screen bg-base py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <header className="mb-8">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-100 rounded animate-pulse w-48"></div>
        </header>

        <CardSkeleton count={6} />
      </div>
    </main>
  );
} 