import { useLoaderData, Link } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const prisma = new PrismaClient();

export async function loader() {
  const items = await prisma.item.findMany({
    orderBy: { id: "asc" },
    include: { user: true },
  });
  return { items };
}

export default function InventoryIndex() {
  const { items } = useLoaderData<typeof loader>();
  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Button asChild>
          <Link to="/inventory/new">Add New Item</Link>
        </Button>
      </div>
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {items.length === 0 ? (
            <div className="text-gray-500 text-center col-span-full">No items in inventory.</div>
          ) : (
            items.map((item) => (
              <Link
                key={item.id}
                to={`/inventory/${item.slug}`}
                className="group"
              >
                <Card className="max-w-md mx-auto flex flex-col h-full border border-gray-200 bg-white rounded-xl transition-all duration-150 group-hover:border-blue-400 group-hover:bg-blue-50 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-lg font-bold text-blue-900 group-hover:text-blue-700 transition">
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-400 font-normal">SKU: {item.sku}</span>
                    </div>
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
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
                    <span className="text-xs text-gray-400 pt-2">
                      Added by: {item.user?.name || item.user?.email || "Unknown"}
                    </span>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 