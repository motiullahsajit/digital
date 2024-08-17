"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useCart } from "@/hooks/use-cart";
import { Product } from "@/payload-types";

const AddToCartButton = ({ product }: { product: Product }) => {
  const { addItem, items } = useCart();
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    const alreadyInCart = items.some((item) => item.product.id === product.id);
    setIsAdded(alreadyInCart);
  }, [items, product.id]);

  useEffect(() => {
    if (isSuccess) {
      const timeout = setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isSuccess]);

  const handleAddToCart = () => {
    if (!isAdded) {
      addItem(product);
      setIsSuccess(true);
      setIsAdded(true);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      size="lg"
      className="w-full"
      disabled={isAdded}
    >
      {isAdded ? "Already Added" : isSuccess ? "Added!" : "Add to cart"}
    </Button>
  );
};

export default AddToCartButton;
