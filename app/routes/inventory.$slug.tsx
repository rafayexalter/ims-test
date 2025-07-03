import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { auth } from "~/lib/auth.server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const prisma = new PrismaClient();

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    throw redirect("/signin");
  }
  const slug = params.slug as string;
  const item = await prisma.item.findUnique({
    where: { slug },
    include: { user: true },
  });
  if (!item) {
    throw redirect("/inventory");
  }
  return { item, isAuthor: item.user_id === session.user.id };
}

export default function InventoryDetail() {
  const { item, isAuthor } = useLoaderData<typeof loader>();
  return (
    <div className="max-w-lg mx-auto mt-12">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-blue-900">{item.name}</h1>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700">
            {item.category}
          </span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
            Qty: {item.quantity}
          </span>
          <span className="text-xl font-bold text-blue-700">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col gap-2 mb-6">
          <div className="text-xs text-gray-400">SKU: {item.sku}</div>
          <div className="text-xs text-gray-400">
            Added by: {item.user?.name || item.user?.email || "Unknown"}
          </div>
          <div className="text-xs text-gray-400">
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button asChild variant="outline">
            <Link to="/inventory">Back</Link>
          </Button>
          {isAuthor && (
            <Button asChild>
              <Link to={`/inventory/${item.id}/edit`}>Edit</Link>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
} 