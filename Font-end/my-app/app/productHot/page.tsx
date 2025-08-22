"use client";
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import styles from "../styles/HotProduct.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faHeartBroken } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import Link from "next/link";

interface Product {
  _id: string;
  id?: string;
  category: string;
  name: string;
  image: string;
  quantity: number;
  taste?: string[];
  sizes?: {
    name: string;
    price: {
      original: number;
      discount?: number;
    };
  }[];
  description: string;
  view: number;
}

const HotProducts = () => {
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  // Fetch sản phẩm nổi bật
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    async function fetchProducts() {
      try {
        const res = await fetch(`${API_URL}/products/hot`, {
          signal,
        });
        const data = await res.json();

        const productList = Array.isArray(data)
          ? data
          : Array.isArray(data.result)
            ? data.result
            : Array.isArray(data.data)
              ? data.data
              : [];

        setHotProducts(productList);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Lỗi khi fetch sản phẩm:", error);
        }
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, []);

  // Fetch danh sách sản phẩm yêu thích từ server
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch(
          `${API_URL}/favoriteProduct/favorites`,
          {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        const data = await res.json();

        if (data.status && Array.isArray(data.result)) {
          const map: Record<string, boolean> = {};
          data.result.forEach((fav: Product) => {
            map[fav._id] = true;
          });
          setFavoriteMap(map);
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra yêu thích:", err);
      }
    };

    fetchFavorites();
  }, []);

  // Toggle yêu thích theo từng sản phẩm
  const toggleFavorite = async (productId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/favoriteProduct/favorites/${productId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const result = await response.json();

      if (response.ok) {
        setFavoriteMap((prev) => ({
          ...prev,
          [productId]: !prev[productId],
        }));
        toast.success(result.message || "Cập nhật yêu thích thành công");
      } else {
        toast.error(result.message || "Lỗi cập nhật yêu thích");
      }
    } catch (error) {
      console.error("Lỗi yêu thích:", error);
      toast.error("Không kết nối được đến server");
    }
  };

  return (
    <Container className="py-5">
      <h2
        className={`text-center mb-4 ${styles.sectionTitle} ${styles.sectionTitle1}`}
      >
        SẢN PHẨM NỔI BẬT 🔥
      </h2>

      <Row>
        {hotProducts.map((product) => {
          const hasSizes = product.sizes && product.sizes.length > 0;
          const priceInfo = hasSizes ? product.sizes![0].price : null;
          const displayPrice = priceInfo
            ? priceInfo.discount ?? priceInfo.original
            : "Liên hệ";

          const isFavorite = favoriteMap[product._id] || false;

          return (
            <Col key={product._id} md={3} sm={6} className="mb-4">
              <Card className={`h-100 ${styles.productCard}`}>
                <Link href={`/productList/${product._id}`}>
                  <div className={styles.imageContainer}>
                    <Card.Img
                      variant="top"
                      src={product.image}
                      alt={product.name}
                      className={styles.productImage}
                    />
                    <div className={styles.hotBadge}>HOT</div>
                  </div>
                </Link>

                <Card.Body className={styles.cardBody}>
                  <Card.Title className={styles.productTitle}>
                    {product.name}
                  </Card.Title>
                  <Card.Text className={styles.productDesc}>
                    {product.description}
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className={styles.productPrice}>
                      {typeof displayPrice === "number"
                        ? displayPrice.toLocaleString("vi-VN") + "₫"
                        : displayPrice}
                    </span>

                    <FontAwesomeIcon
                      icon={isFavorite ? faHeart : faHeartBroken}
                      style={{
                        color: isFavorite ? "red" : "#aaa",
                        cursor: "pointer",
                      }}
                      onClick={() => toggleFavorite(product._id)}
                      title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default HotProducts;
