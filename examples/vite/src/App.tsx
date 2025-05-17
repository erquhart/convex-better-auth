import SignIn from "./SignIn";
import SignUp from "./SignUp";
import { Dashboard } from "./components/Dashboard";
import { useEffect, useState } from "react";
import { useConvexAuth } from "convex/react";

export default function App() {
  const [showSignIn, setShowSignIn] = useState(true);
  const authState = useConvexAuth();

  useEffect(() => {
    console.log("Auth state changed:", authState);
  }, [authState]);

  if (authState.isLoading) {
    return <div>Loading...</div>;
  }
  if (authState.isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {showSignIn ? <SignIn /> : <SignUp />}
        <p className="text-center mt-4 text-sm text-neutral-600 dark:text-neutral-400">
          {showSignIn ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setShowSignIn(!showSignIn)}
            className="text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-200 underline"
          >
            {showSignIn ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
