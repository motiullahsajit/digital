import { getServerSideUser } from "@/lib/payload-utils";
import Image from "next/image";
import { cookies } from "next/headers";
import { getPayloadClient } from "@/get-payload";
import { notFound, redirect } from "next/navigation";
import { Product, ProductFile, User } from "@/payload-types";
import { PRODUCT_CATEGORIES } from "@/config";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import PaymentStatus from "@/components/PaymentStatus";

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const ThankYouPage = async ({ searchParams }: PageProps) => {
  const orderId = searchParams.orderId;
  const nextCookies = cookies();

  const { user } = await getServerSideUser(nextCookies);
  const payload = await getPayloadClient();

  const { docs: orders } = await payload.find({
    collection: "orders",
    depth: 2,
    where: {
      id: {
        equals: orderId,
      },
    },
  });

  const [order]: any = orders;

  if (!order) return notFound();

  const orderUserId =
    typeof order.user === "string" ? order.user : order.user.id;

  if (orderUserId !== user?.id) {
    return redirect(`/sign-in?origin=thank-you?orderId=${order.id}`);
  }

  const products = order.products as Product[];

  const orderTotal = products.reduce((total, product) => {
    return total + product.price;
  }, 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="lg:col-start-2">
        <p className="text-sm font-medium text-blue-600">Order successful</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
          Thanks for ordering
        </h1>
        {order._isPaid ? (
          <p className="mt-2 text-base text-muted-foreground">
            Your order was processed and your assets are available to download
            below. We&apos;ve sent your receipt and order details to{" "}
            {typeof order.user !== "string" ? (
              <span className="font-medium text-gray-900">
                {order.user.email}
              </span>
            ) : null}
            .
          </p>
        ) : (
          <p className="mt-2 text-base text-muted-foreground">
            We appreciate your order, and we&apos;re currently processing it. So
            hang tight and we&apos;ll send you confirmation very soon!
          </p>
        )}

        <div className="mt-8 sm:mt-12 md:mt-16 lg:mt-24 text-sm font-medium">
          <div className="text-muted-foreground">Order nr.</div>
          <div className="mt-1 text-gray-900 text-lg">{order.id}</div>

          <ul className="mt-6 divide-y divide-gray-200 border-t border-gray-200 text-sm font-medium text-muted-foreground">
            {(order.products as Product[]).map((product) => {
              const label = PRODUCT_CATEGORIES.find(
                ({ value }) => value === product.category
              )?.label;

              const downloadUrl = (product.product_files as ProductFile)
                .url as string;

              const { image } = product.images[0];

              return (
                <li
                  key={product.id}
                  className="flex flex-col md:flex-row md:space-x-6 py-6"
                >
                  <div className="relative h-24 w-full md:w-24">
                    {typeof image !== "string" && image.url ? (
                      <Image
                        fill
                        src={image.url}
                        alt={`${product.name} image`}
                        className="rounded-md bg-gray-100 object-cover object-center"
                      />
                    ) : null}
                  </div>

                  <div className="flex-auto flex flex-col justify-between mt-4 md:mt-0">
                    <div className="space-y-1">
                      <h3 className="text-gray-900 text-lg md:text-xl">
                        {product.name}
                      </h3>

                      <p className="my-1 text-sm">Category: {label}</p>
                    </div>

                    {order._isPaid ? (
                      <a
                        href={downloadUrl}
                        download={product.name}
                        className="text-blue-600 hover:underline underline-offset-2"
                      >
                        Download asset
                      </a>
                    ) : null}
                  </div>

                  <p className="flex-none font-medium text-gray-900 mt-2 md:mt-0">
                    {formatPrice(product.price)}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-muted-foreground">
            <div className="flex justify-between">
              <p>Subtotal</p>
              <p className="text-gray-900">{formatPrice(orderTotal)}</p>
            </div>

            <div className="flex justify-between">
              <p>Transaction Fee</p>
              <p className="text-gray-900">{formatPrice(1)}</p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
              <p className="text-base">Total</p>
              <p className="text-base">{formatPrice(orderTotal + 1)}</p>
            </div>
          </div>

          <PaymentStatus
            isPaid={order._isPaid as boolean}
            orderEmail={(order.user as User).email}
            orderId={order.id as string}
          />

          <div className="mt-8 border-t border-gray-200 py-6 text-right">
            <Link
              href="/products"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Continue shopping &rarr;
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ThankYouPage;
