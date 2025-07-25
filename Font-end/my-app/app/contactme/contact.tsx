"use client";
import React from "react";
import Link from "next/link";
import { Navbar, Nav, NavDropdown, Container, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
export default function ContactPage() {
  return (
    <Container fluid style={{ backgroundColor: "#c10a28" }}>
      <Container className="p-5">
        <Row>
          <Col xs={3}>
            <Image src="/vege.webp"></Image>
          </Col>
          <Col
            xs={6}
            style={{
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h1>Đăng ký nhận tin</h1>
            <p>
              Nhập email của bạn và nhận nhiều chương trình ưu đãi hấp dẫn từ
              cửa hàng
            </p>
            <InputGroup className="mb-3">
              <Form.Control placeholder="Nhập email nhận tin khuyến mãi" />
              <InputGroup.Text
                style={{
                  backgroundColor: "#f64563",
                  border: "#f64563",
                  color: "white",
                  textTransform: "uppercase",
                }}
              >
                Đăng Ký
              </InputGroup.Text>
            </InputGroup>
          </Col>
          <Col xs={3}>
            <Image src="/vege2.webp"></Image>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}
