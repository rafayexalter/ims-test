import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { auth } from "~/lib/auth.server";
import { slugify } from "~/lib/helper";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const prisma = new PrismaClient();

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    throw redirect("/signin");
  }
  return {};
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    throw redirect("/signin");
  }
  const form = await request.formData();
  const name = form.get("name") as string;
  const description = form.get("description") as string;
  const quantity = Number(form.get("quantity"));
  const sku = form.get("sku") as string;
  const category = form.get("category") as string;
  const price = Number(form.get("price"));

  if (!name || !sku || !category || isNaN(quantity) || isNaN(price)) {
    return { error: "All fields except description are required." };
  }

  // Generate slug from name
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let count = 1;
  // Ensure uniqueness
  while (await prisma.item.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${count++}`;
  }

  try {
    await prisma.item.create({
      data: {
        name,
        description,
        quantity,
        sku,
        category,
        price,
        user_id: session.user.id,
        slug,
      },
    });
    return redirect("/inventory");
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { error: message };
  }
}

export default function NewInventory() {
  const actionData = useActionData<typeof action>();
  useLoaderData<typeof loader>(); // for session protection
  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader>
          <CardTitle>Add New Inventory Item</CardTitle>
        </CardHeader>
        <CardContent>
          {actionData?.error && (
            <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {actionData.error}
            </div>
          )}
          <Form method="post" className="flex flex-col gap-4">
            <div>
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="description">
                Description <span className="text-gray-400 text-xs">(optional)</span>
              </Label>
              <Textarea id="description" name="description" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="quantity">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input id="quantity" name="quantity" type="number" min="0" required />
              </div>
              <div className="flex-1">
                <Label htmlFor="price">
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input id="price" name="price" type="number" step="0.01" min="0" required />
              </div>
            </div>
            <div>
              <Label htmlFor="sku">
                SKU <span className="text-red-500">*</span>
              </Label>
              <Input id="sku" name="sku" required />
            </div>
            <div>
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Input id="category" name="category" required />
            </div>
            <CardFooter className="p-0 pt-4">
              <Button type="submit" className="w-full">Add Item</Button>
            </CardFooter>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 