"use client";
import Service from "./category/category";
import ProductList from "./productList/productList";
import About from "./component/about";
import styles from "./styles/home.module.css";
import SalePage from "./component/sale";
import DiscountPage from "./discount/discount";
import Slide from "./component/main/slide";
import HotProducts from "./component/hotProduct";
import Blog from "./blog/blog";
export default function Home() {
  return (
    <>
      <Slide />
      <Service />
      <About />
      <HotProducts />
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
