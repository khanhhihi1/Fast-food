"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import ProductList from "../productList/productList";
import styles from "../styles/home.module.css";
export default function DiscountPage() {
  return (
    <>
      <Container fluid className={`d-flex  ${styles.discountContainer}`}>
        <Container>
          <Row className="mt-5">
            <Col xs={6}>
              <p className="text-warning">Món ăn</p>
              <h1 className="text-light">Đang được giảm giá</h1>
              <p className="text-light">
                Chúng tôi thường xuyên cập nhật những chương trình khuyến mãi để
                quý thực khách có thể trãi nghiệm tất cả món ăn của chúng tôi.
              </p>
              <p className="text-light">
                Chương trình đã kết thúc, hẹn gặp lại trong thời gian sớm nhất!
              </p>
            </Col>
            <Col xs={6}>
              <Image src="https://bizweb.dktcdn.net/100/510/571/themes/941527/assets/flash_sale.png?1727255430829"></Image>
            </Col>
            <Col xs={12} className={`p-3 mt-2 ${styles.discountProduct}`}>
              <ProductList category="related" limit={5} />
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  );
}
