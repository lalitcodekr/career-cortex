import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-gray-200">
      <h1 className="text-8xl font-bold text-metallic animate-metallic mb-4">
        404
      </h1>
      <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-gray-400 mb-8">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been
        moved.
      </p>
      <a href="/">
        <Button>Return Home</Button>
      </a>
    </div>
  );
}
