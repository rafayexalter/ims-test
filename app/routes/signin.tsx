import { authClient } from "~/lib/auth-client";

export default function SignIn() {
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/inventory", // Change as needed
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-16">
      <h2 className="text-xl font-semibold">Sign In</h2>
      <button
        onClick={handleGoogleSignIn}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Sign in with Google
      </button>
    </div>
  );
} 