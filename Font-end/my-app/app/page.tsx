"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Service from "./service/service";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import ProductList from "./productList/productList";
import About from "./about/page";
import styles from "./styles/home.module.css";
import SalePage from "./sale/salePage";
import DiscountPage from "./discount/discount";
import Slide from "./component/main/slide";
export default function Home() {
  return (
    <>
      <Slide />
      <Service />
      <About />
      <ProductList
        category="hot"
        title="🔥Sản phẩm Hot"
        layout="horizontal"
        limit={2}
      />
      <SalePage />
      <DiscountPage />
      <ProductList category="related" title="Thuc An Kem" />
    </>
  );
}
