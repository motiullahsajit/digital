import { z } from "zod";
import nodemailer from "nodemailer";
import { privateProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { getPayloadClient } from "../get-payload";
import { Product } from "@/payload-types";
import { ReceiptEmailHtml } from "../components/emails/ReceiptEmail";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

export const paymentRouter = router({
  createSession: privateProcedure
    .input(z.object({ productIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      let { productIds } = input;

      if (productIds.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const payload = await getPayloadClient();

      const { docs: products } = await payload.find({
        collection: "products",
        where: {
          id: {
            in: productIds,
          },
        },
      });

      const filteredProducts = products.filter((prod) => Boolean(prod.priceId));

      try {
        const order = await payload.create({
          collection: "orders",
          data: {
            _isPaid: true,
            products: filteredProducts.map((prod) => prod.id.toString()) as (
              | string
              | Product
            )[],

            user: user.id,
          },
        });

        const mailOptions = {
          from: "Digital",
          to: user.email,
          subject: "Thanks for your order! This is your receipt.",
          html: ReceiptEmailHtml({
            date: new Date(),
            email: user.email,
            orderId: order.id as string,
            products: order.products as Product[],
          }),
        };

        await transporter.sendMail(mailOptions);

        const generatedUrl = `/pay?orderId=${order.id}`;

        return { url: generatedUrl };
      } catch (err) {
        console.error("Error during order creation or URL generation:", err);
        return { url: null };
      }
    }),
  pollOrderStatus: privateProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      const { orderId } = input;

      const payload = await getPayloadClient();

      const { docs: orders } = await payload.find({
        collection: "orders",
        where: {
          id: {
            equals: orderId,
          },
        },
      });

      if (!orders.length) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [order] = orders;

      return { isPaid: order._isPaid };
    }),
});
