import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, Link } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { auth } from "~/lib/auth.server";
import { slugify } from "~/lib/helper";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const prisma = new PrismaClient();

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    throw redirect("/signin");
  }
  const id = Number(params.id);
  if (isNaN(id)) throw redirect("/inventory");
  const item = await prisma.item.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!item) throw redirect("/inventory");
  if (item.user_id !== session.user.id) throw redirect(`/inventory/${item.slug}`);
  return { item };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    throw redirect("/signin");
  }
  const id = Number(params.id);
  if (isNaN(id)) return { error: "Invalid item id." };
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) return { error: "Item not found." };
  if (item.user_id !== session.user.id) return { error: "Not authorized." };

  const form = await request.formData();
  const intent = form.get("intent");
  if (intent === "delete") {
    try {
      await prisma.item.delete({ where: { id } });
      return redirect("/inventory");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      return { error: message };
    }
  }

  const name = form.get("name") as string;
  const description = form.get("description") as string;
  const quantity = Number(form.get("quantity"));
  const sku = form.get("sku") as string;
  const category = form.get("category") as string;
  const price = Number(form.get("price"));

  if (!name || !sku || !category || isNaN(quantity) || isNaN(price)) {
    return { error: "All fields except description are required." };
  }

  // If name changed, update slug
  let slug = item.slug;
  if (name !== item.name) {
    const baseSlug = slugify(name);
    slug = baseSlug;
    let count = 1;
    while (await prisma.item.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }
  }

  try {
    await prisma.item.update({
      where: { id },
      data: {
        name,
        description,
        quantity,
        sku,
        category,
        price,
        slug,
      },
    });
    return redirect(`/inventory/${slug}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { error: message };
  }
}

export default function EditInventory() {
  const { item } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader>
          <CardTitle>Edit Inventory Item</CardTitle>
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
              <Input id="name" name="name" required defaultValue={item.name} />
            </div>
            <div>
              <Label htmlFor="description">
                Description <span className="text-gray-400 text-xs">(optional)</span>
              </Label>
              <Textarea id="description" name="description" defaultValue={item.description || ""} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="quantity">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input id="quantity" name="quantity" type="number" min="0" required defaultValue={item.quantity} />
              </div>
              <div className="flex-1">
                <Label htmlFor="price">
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={item.price} />
              </div>
            </div>
            <div>
              <Label htmlFor="sku">
                SKU <span className="text-red-500">*</span>
              </Label>
              <Input id="sku" name="sku" required defaultValue={item.sku} />
            </div>
            <div>
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Input id="category" name="category" required defaultValue={item.category} />
            </div>
            <CardFooter className="p-0 pt-4 flex gap-2">
              <Button type="submit" className="w-full">Save Changes</Button>
              <Button asChild variant="outline" className="w-full">
                <Link to={`/inventory/${item.slug}`}>Cancel</Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" className="w-full">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>Delete Item</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this item? This action cannot be undone.
                  </AlertDialogDescription>
                  <div className="flex gap-2 justify-end mt-4">
                    <AlertDialogCancel asChild>
                      <Button variant="outline">Cancel</Button>
                    </AlertDialogCancel>
                    <Form method="post">
                      <input type="hidden" name="intent" value="delete" />
                      <AlertDialogAction asChild>
                        <Button type="submit" variant="destructive">Delete</Button>
                      </AlertDialogAction>
                    </Form>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 