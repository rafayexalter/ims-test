import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { auth } from "~/lib/auth.server";
import { useCallback } from "react";
import { authClient } from "~/lib/auth-client";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  return { user: session?.user ?? null };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    await authClient.signOut();
    navigate("/signin");
  }, [navigate]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <header className="sticky top-0 z-30 w-full bg-white shadow-sm rounded-b-lg mb-8">
          <nav className="mx-auto max-w-4xl flex items-center justify-between py-3 px-4">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-2xl font-bold text-blue-700 tracking-tight hover:text-blue-900 transition">IMS</Link>
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition px-2 py-1 rounded-md">Home</Link>
              <Link to="/inventory" className="text-gray-700 hover:text-blue-600 transition px-2 py-1 rounded-md">Inventory</Link>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg focus:outline-none border border-blue-200 hover:ring-2 hover:ring-blue-200 transition">
                      {user.name ? user.name[0].toUpperCase() : <span>U</span>}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel className="flex flex-col gap-0.5">
                      <span className="font-semibold">{user.name ?? "User"}</span>
                      <span className="text-xs text-gray-500 truncate">{user.email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="secondary">
                  <Link to="/signin">Sign In</Link>
                </Button>
              )}
            </div>
          </nav>
        </header>
        <main>
          {children}
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
