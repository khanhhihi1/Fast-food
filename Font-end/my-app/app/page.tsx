"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Service from "./category/category";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import ProductList from "./productList/productList";
import About from "./about/about";
import styles from "./styles/home.module.css";
import SalePage from "./sale/sale";
import DiscountPage from "./discount/discount";
import Slide from "./component/main/slide";
import HotProduct from "./component/hotProduct";
import Blog from "./blog/blog";
export default function Home() {
  return (
    <>
      <Slide />
      <Service />
      <About />
      <HotProduct />
      {/* <ProductList
        category="hot"
        title="🔥Sản phẩm Hot"
        layout="horizontal"
        limit={4}
      /> */}
      <SalePage />
      <DiscountPage />
      <Blog />
    </>
  );
}
