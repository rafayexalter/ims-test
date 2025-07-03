import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { auth } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  return { user: session?.user ?? null };
}

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold">Inventory Management System</h1>
        <p className="text-lg">Welcome! Use the link below to manage your inventory.</p>
        <Link
          to="/inventory"
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Go to Inventory
        </Link>
        {!user && (
          <Link
            to="/signin"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}

