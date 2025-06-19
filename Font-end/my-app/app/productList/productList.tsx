"use client";
import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import Link from "next/link";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import styles from "../styles/productList.module.css";
import ProductItem from "../productItem/productItem";
interface Product {
  id: string;
  category: string;
  name: string;
  imageUrl: string;
  price: number;
  rating: number;
  time: string;
  description: string[];
  taste: string[];
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
    async function fetchProducts() {
      const res = await fetch(
        `https://be-friedking.onrender.com/products${
          category ? `?category=${category}` : ""
        }`
      );
      const data = await res.json();
      setProducts(data);
    }
    fetchProducts();
  }, [category]);
  return (
    <>
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
                className={`${styles.productTittle}  ${styles.h1Box} ${styles[layout]}`}
              >
                {title}
              </h1>
            </Link>
          </Row>
        )}
        <Row className="d-flex flex-wrap" style={{ gap: "10px" }}>
          {products.slice(0, limit ?? products.length).map((item) => (
            <ProductItem key={item.id} product={item} layout={layout} />
          ))}
        </Row>
      </Container>
    </>
  );
}
