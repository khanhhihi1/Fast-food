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
 const addToCart = async (product: Product) => {
  try {
    const firstSize = product.sizes?.[0];

    if (!firstSize || !firstSize.price?.original) {
      toast.error("Sản phẩm không có thông tin giá.");
      return;
    }

    const body = {
      productId: product._id || product.id,
      sizeName: firstSize.name ?? "default",
      quantity: 1,
      price: firstSize.price,
    };

    const response = await fetch("http://localhost:5000/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // nếu bạn dùng token trong cookie
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (response.ok) {
      toast.success(`${product.name} đã được thêm vào giỏ hàng.`);
    } else {
      toast.error(result.message || "Thêm vào giỏ hàng thất bại.");
    }
  } catch (error) {
    toast.error("Lỗi kết nối đến máy chủ.");
    console.error("Thêm giỏ hàng lỗi:", error);
  }
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
