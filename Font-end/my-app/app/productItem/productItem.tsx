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
import { toast } from "react-toastify";
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
        imageUrl: product.imageUrl,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(currentCart));
    toast.success(`${product.name} đã được thêm vào giỏ hàng!`);
  };

  return (
    <>
      <div
        key={product.id}
        className={`${styles.productList} ${styles[layout]}`}
      >
        <Link href={`/productList/${product.id}`}>
          <Image
            src={product.imageUrl}
            className={`${styles.productImg} `}
            alt="banner"
          ></Image>
        </Link>
        <div>
          <div>
            <p className={`${styles.productName} `}>{product.name}</p>
            <p>{product.description}</p>
          </div>
          <div className={`${styles.productBot}`}>
            <p className={`${styles.productPrice} `}>{product.price}</p>
            <Button
              className={`${styles.productButton} `}
              onClick={() => addToCart(product)}
            >
              Thêm
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
