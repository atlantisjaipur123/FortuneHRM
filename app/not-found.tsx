import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-sm text-muted-foreground">The page you are looking for does not exist.</p>
        <Link href="/" className="px-4 py-2 rounded bg-primary text-primary-foreground inline-block">
          Go home
        </Link>
      </div>
    </div>
  );
}


