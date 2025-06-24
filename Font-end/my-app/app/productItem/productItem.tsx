"use client";
import { Image, Button } from "react-bootstrap";
import Link from "next/link";
import styles from "../styles/productList.module.css";
import { toast } from "react-toastify";

interface Product {
  id: string;
  _id?: string;
  category: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  time: string;
  description: string[];
  taste: Record<string, number>;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface ProductItemsProps {
  product: Product;
  layout?: "vertical" | "horizontal" | "default";
}

export default function ProductItem({
  product,
  layout = "vertical",
}: ProductItemsProps) {
  const addToCart = (product: Product) => {
    const cartData = localStorage.getItem("cart");
    const currentCart: CartItem[] = cartData ? JSON.parse(cartData) : [];

    const existingItem = currentCart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(currentCart));
    toast.success(`${product.name} đã được thêm vào giỏ hàng!`);
  };

  return (
    <div className={`${styles.productList} ${styles[layout]}`}>
      <Link href={`/productList/${product.id}`}>
        <Image
          src={product.image}
          className={styles.productImg}
          alt={product.name}
          fluid
        />
      </Link>

      <div>
        <p className={styles.productName}>{product.name}</p>
        <div className={styles.productBot}>
          <p className={styles.productPrice}>
            {product.price.toLocaleString()}đ
          </p>
          <Button
            className={styles.productButton}
            onClick={() => addToCart(product)}
          >
            Thêm
          </Button>
        </div>
      </div>
    </div>
  );
}
