"use client";
import { Image, Button } from "react-bootstrap";
import Link from "next/link";
import styles from "../styles/productList.module.css";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faHeartBroken } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
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
  quantity: number; // Thêm field quantity để kiểm tra số lượng
}

interface ProductItemsProps {
  product: Product;
  layout?: "vertical" | "horizontal" | "default";
}

const renderPrice = (sizes?: Product["sizes"], quantity: number = 0) => {
  if (quantity === 0) {
    return <span style={{ color: "red", fontWeight: "bold" }}>Hết hàng</span>;
  }

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

export default function ProductItem({ product, layout = "vertical" }: ProductItemsProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const productId = product._id || product.id;
  const { refreshFavorite } = useCart();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch(`${API_URL}/favoriteProduct/favorites`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const data = await res.json();

        if (data.status && Array.isArray(data.result)) {
          const isFav = data.result.some((fav: Product) => fav._id === productId);
          setIsFavorite(isFav);
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra yêu thích:", err);
      }
    };

    fetchFavorites();
  }, [productId]);

  const toggleFavorite = async () => {
    try {
      const response = await fetch(`${API_URL}/favoriteProduct/favorites/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok) {
        setIsFavorite((prev) => !prev);
        await refreshFavorite();
        toast.success(result.message || "Cập nhật yêu thích thành công");
      } else {
        toast.error(result.message || "Lỗi cập nhật yêu thích");
      }
    } catch (error) {
      console.error("Lỗi yêu thích:", error);
      toast.error("Không kết nối được đến server");
    }
  };

  if (product.quantity === 0) {
    return null;
  }

  return (
    <div className={`${styles.productList} ${styles[layout]}`}>
      <Link href={`/productList/${productId}`}>
        <Image
          src={`${API_URL}/${product.image}`}
          className={styles.productImg}
          alt={product.name}
          fluid
        />
      </Link>

      <div>
        <p className={styles.productName}>{product.name}</p>
        <div className={styles.productBot}>
          <p className={styles.productPrice}>
            {renderPrice(product.sizes, product.quantity)}
          </p>
          <FontAwesomeIcon
            icon={isFavorite ? faHeart : faHeartBroken}
            style={{ color: isFavorite ? "red" : "#aaa", cursor: "pointer" }}
            onClick={toggleFavorite}
            title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
          />
        </div>
      </div>
    </div>
  );
}
