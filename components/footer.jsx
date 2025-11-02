"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function Footer() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [hasData, setHasData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user has data
  useEffect(() => {
    const checkUserData = async () => {
      if (!isLoaded || !user) {
        setIsLoading(false);
        setHasData(false);
        return;
      }

      try {
        const response = await fetch("/api/check-user-data");
        if (response.ok) {
          const data = await response.json();
          setHasData(data.hasData);
        } else {
          setHasData(false);
        }
      } catch (error) {
        console.error("Error checking user data:", error);
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserData();
  }, [isLoaded, user]);

  const handleClearData = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/clear-data", {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to clear data");
      }

      toast.success("All your data has been cleared successfully");
      router.push("/onboarding");
    } catch (error) {
      console.error("Error clearing data:", error);
      toast.error(error.message || "Failed to clear data. Please try again.");
      setIsDeleting(false);
    }
  };

  // Don't show button if user is not logged in or doesn't have data
  if (!isLoaded || !user || !hasData) {
    return (
      <footer className="bg-muted/50 py-12">
        <div className="container mx-auto px-4 text-center text-gray-200">
          <p>Made with 💗 by Lalit</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-muted/50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-row items-center justify-center gap-8 text-gray-200 flex-wrap">
          <p className="text-center">Made with 💗 by Lalit</p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                Clear My Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. It will permanently delete all
                  your data from the database and restart onboarding.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearData}
                  disabled={isDeleting}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete All Data"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </footer>
  );
}
