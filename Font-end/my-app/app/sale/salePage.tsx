"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import styles from "../styles/home.module.css";
export default function SalePage() {
  return (
    <>
      <Container className="my-4">
        <Row>
          <Col className="d-flex justify-content-center p-3">
            <h1 style={{ color: "black", fontSize: "26px" }}>
              Các chương trình nổi bật
            </h1>
          </Col>
        </Row>
        <Row className="d-flex" style={{ gap: "10px" }}>
          <Col className={`${styles.boxDiscount}`}>
            <Image
              style={{ borderRadius: "10px" }}
              src="https://i.pinimg.com/736x/26/a8/23/26a823f9e692bbe4fae51354dd78f9cb.jpg"
            ></Image>
          </Col>
          <Col className={`${styles.boxDiscount}`}>
            <Image
              style={{ borderRadius: "10px" }}
              src="https://i.pinimg.com/474x/46/3b/f5/463bf5aff1a8bae4bd4a602eeddc51f6.jpg"
            ></Image>
          </Col>
          <Col className={`${styles.boxDiscount}`}>
            <Image
              style={{ borderRadius: "10px" }}
              src="https://i.pinimg.com/474x/de/72/e7/de72e70164b74b43564beab07c5f7992.jpg"
            ></Image>
          </Col>
          <Col className={`${styles.boxDiscount}`}>
            <Image
              style={{ borderRadius: "10px" }}
              src="https://i.pinimg.com/474x/3d/15/a1/3d15a1168ad9fcb5f3a8cce7490171e4.jpg"
            ></Image>
          </Col>
        </Row>
      </Container>
    </>
  );
}
