import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button 
      className="text-gray-600 hover:text-gray-800" 
      onClick={() => {
        signOut();
        window.location.hash = ''; // Clear hash to go to homepage
        window.location.reload(); // Force reload to homepage
      }}
    >
      Sign Out
    </button>
  );
}
