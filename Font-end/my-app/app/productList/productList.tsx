"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import styles from "../styles/productList.module.css";
import ProductItem from "../productItem/productItem";

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

interface ProductListProps {
  category?: string;
  title?: string;
  layout?: "vertical" | "horizontal" | "default";
  limit?: number;
}

export default function ProductList({
  category,
  title,
  layout = "vertical",
  limit,
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchProducts() {
      try {
        const endpoint =
          category === "hot"
            ? "http://localhost:5000/products/hot"
            : `http://localhost:5000/products${category ? `?category=${category}` : ""}`;

        const res = await fetch(endpoint, { signal });
        const data = await res.json();
        const productList = data.result || data;

        setProducts(productList);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Lỗi khi fetch sản phẩm:", error);
        }
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, [category]);

  return (
    <Container
      className="d-flex flex-column"
      style={{ paddingLeft: "15px", paddingRight: "15px" }}
    >
      {title && (
        <Row className="mt-3 mb-1 p-1">
          <Link
            href="/"
            style={{ textDecoration: "none" }}
            className={`${styles.h1Container} ${styles[layout]}`}
          >
            <h1
              className={`${styles.productTittle} ${styles.h1Box} ${styles[layout]}`}
            >
              {title}
            </h1>
          </Link>
        </Row>
      )}

      <Row className="d-flex flex-wrap" style={{ gap: "10px" }}>
        {products.slice(0, limit ?? products.length).map((item) => (
          <ProductItem
            key={item._id}
            product={{ ...item, id: item._id }}
            layout={layout}
          />
        ))}
      </Row>
    </Container>
  );
}
