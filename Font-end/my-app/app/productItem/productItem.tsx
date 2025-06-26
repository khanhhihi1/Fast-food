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
  sizes?: {
    name: string;
    price: {
      original: number;
      discount?: number;
    };
  }[];
  rating?: number;
  time?: string;
  description?: string | string[];
  taste?: string[] | Record<string, number>;
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
const renderPrice = (sizes?: Product["sizes"]) => {
  if (!sizes || sizes.length === 0) return "Không rõ";

  const firstSize = sizes[0];
  const { original, discount } = firstSize.price;

  if (discount) {
    return (
      <>
        <span style={{ textDecoration: "line-through", color: "#888", marginRight: "8px" }}>
          {original.toLocaleString()}đ
        </span>
        <span style={{ color: "red", fontWeight: "bold" }}>
          {discount.toLocaleString()}đ
        </span>
      </>
    );
  } else {
    return `${original.toLocaleString()}đ`;
  }
};

export default function ProductItem({
  product,
  layout = "vertical",
}: ProductItemsProps) {
  const addToCart = (product: Product) => {
  const cartData = localStorage.getItem("cart");
  const currentCart: CartItem[] = cartData ? JSON.parse(cartData) : [];

  const existingItem = currentCart.find((item) => item.id === product.id);

  // 👉 Lấy giá đầu tiên từ sizes
  const priceInfo = product.sizes?.[0]?.price;
  const finalPrice = priceInfo?.discount ?? priceInfo?.original ?? 0;

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    currentCart.push({
      id: product.id,
      name: product.name,
      price: finalPrice, 
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
            {renderPrice(product.sizes)}
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
