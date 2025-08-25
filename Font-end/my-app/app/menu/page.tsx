"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Service from "../category/category";
import ProductList from "../productList/productList";
export default function Menu() {
  return (
    <>
      <Service />
      <ProductList category="Pizza" title="Pizza" layout="default" limit={6} />
      <ProductList
        category="Pizza"
        title="🔥Sản phẩm Hot"
        layout="default"
        limit={6}
      />
      <ProductList
        category="related"
        title="Thuc Ăn Kèm"
        layout="default"
        limit={6}
      />
    </>
  );
}
