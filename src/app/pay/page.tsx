"use client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useCart } from "@/hooks/use-cart";

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const PaymentForm = ({ searchParams }: PageProps) => {
  const orderId = searchParams.orderId;
  const router = useRouter();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    clearCart();

    setTimeout(() => {
      router.push(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${orderId}`
      );
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center my-36 px-4 sm:px-0">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Payment Details
        </h2>
        <form onSubmit={submitHandler} className="space-y-6">
          <div className="flex flex-col">
            <label
              htmlFor="cardName"
              className="text-sm font-medium text-gray-700"
            >
              Cardholder Name
            </label>
            <input
              type="text"
              id="cardName"
              placeholder="Jane Doe"
              required
              className="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="cardNumber"
              className="text-sm font-medium text-gray-700"
            >
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              required
              className="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap space-x-4">
            <div className="flex-1 min-w-[45%] flex flex-col">
              <label
                htmlFor="expiryDate"
                className="text-sm font-medium text-gray-700"
              >
                Expiry Date
              </label>
              <input
                type="text"
                id="expiryDate"
                placeholder="MM/YY"
                required
                className="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1 min-w-[45%] flex flex-col mt-4 sm:mt-0">
              <label
                htmlFor="cvc"
                className="text-sm font-medium text-gray-700"
              >
                CVC
              </label>
              <input
                type="text"
                id="cvc"
                placeholder="123"
                required
                className="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <Button disabled={isProcessing} className="w-full" size="lg">
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : null}
            {isProcessing ? "Processing..." : "Pay Now"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
