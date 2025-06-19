"use client";
import { useState, useEffect } from "react";
import React from "react";
import Link from "next/link";
import { Navbar, Nav, NavDropdown, Container, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import {
  faPhone,
  faSearch,
  faUser,
  faShoppingBag,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

interface Category {
  id: string;
  name: string;
}
const Footer = () => {
  const [menu, setMenu] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchMenu() {
      const res = await fetch("https://be-friedking.onrender.com/category");
      const data = await res.json();
      setMenu(data);
    }
    fetchMenu();
  }, []);

  if (!menu) return <div>Loading...</div>;
  return (
    <>
      <Container className="d-flex p-3 ">
        <Col xs={3} className="d-flex align-items-center">
          <FontAwesomeIcon
            icon={faEnvelope}
            className="text-dark me-2"
            style={{ fontSize: "20px" }}
          />
          <h1 style={{ fontSize: "18px", margin: "0" }}> Đăng kí nhận tin</h1>
        </Col>
        <Col xs={5} className=" d-flex align-items-center">
          <Form.Control
            placeholder="Nhập email của bạn"
            aria-label="Nhập email của bạn"
            aria-describedby="basic-addon2"
            className="no-focus-style"
          />
          <Button
            style={{
              width: "108px",
              height: "40px",
              borderRadius: "0",
              fontSize: "13px",
              backgroundColor: "#e00000",
              border: "none",
            }}
          >
            ĐĂNG KÍ
          </Button>
        </Col>
        <Col xs={4} className="d-flex align-items-center ms-3">
          <FontAwesomeIcon
            icon={faPhone}
            className="text-dark me-2"
            style={{ fontSize: "16px" }}
          />
          <span style={{ fontSize: "16px", margin: "0", color: "#252a2b" }}>
            Đặt hàng/ Hỗ trợ:
          </span>
          <Link
            href="/contact"
            style={{ color: "red", textDecoration: "none" }}
            className="ms-1"
          >
            19009480
          </Link>
        </Col>
      </Container>
      <Container fluid className="bg-dark p-5 ">
        <Container className="d-flex text-white  flex-column">
          <Row>
            <Col style={{ width: "20%" }}>
              <h1 style={{ fontSize: "18px" }}>Danh Mục Món Ăn</h1>
              {menu.map((item) => (
                <Row key={item.id}>
                  <Link
                    href=""
                    style={{
                      fontSize: "16px",
                      color: "#ababab",
                      textDecoration: "none",
                    }}
                  >
                    {item.name}
                  </Link>
                </Row>
              ))}
            </Col>
            <Col style={{ width: "20%" }}>
              <h1 style={{ fontSize: "18px" }}>Về KFC</h1>
              {menu.map((item) => (
                <Row key={item.id}>
                  <Link
                    href=""
                    style={{
                      fontSize: "16px",
                      color: "#ababab",
                      textDecoration: "none",
                    }}
                  >
                    {item.name}
                  </Link>
                </Row>
              ))}
            </Col>
            <Col style={{ width: "20%" }}>
              <h1 style={{ fontSize: "18px" }}>Liên hệ KFC</h1>
              {menu.map((item) => (
                <Row key={item.id}>
                  <Link
                    href=""
                    style={{
                      fontSize: "16px",
                      color: "#ababab",
                      textDecoration: "none",
                    }}
                  >
                    {item.name}
                  </Link>
                </Row>
              ))}
            </Col>
            <Col style={{ width: "20%" }}>
              <h1 style={{ fontSize: "18px" }}>Chính sách</h1>
              {menu.map((item) => (
                <Row key={item.id}>
                  <Link
                    href=""
                    style={{
                      fontSize: "16px",
                      color: "#ababab",
                      textDecoration: "none",
                    }}
                  >
                    {item.name}
                  </Link>
                </Row>
              ))}
            </Col>
            <Col style={{ width: "20%" }}>
              <h1 style={{ fontSize: "18px" }}>Download App</h1>
              {menu.map((item) => (
                <Row key={item.id}>
                  <Link
                    href=""
                    style={{
                      fontSize: "16px",
                      color: "#ababab",
                      textDecoration: "none",
                    }}
                  >
                    {item.name}
                  </Link>
                </Row>
              ))}
            </Col>
          </Row>
          <Row className="mt-5 gx-0 mb-2">
            <Col></Col>
            <Col
              lg={6}
              className="d-flex align-items-center justify-content-center"
              style={{ fontSize: "14px", color: "#ababab" }}
            >
              Copyright © 2023 KFC Vietnam
            </Col>
            <Col
              lg={3}
              className="d-flex align-items-center justify-content-end"
              style={{ gap: "10px" }}
            >
              <Link href="https://facebook.com" className="text-light me-2">
                <FontAwesomeIcon
                  icon={faFacebook}
                  style={{ fontSize: "25px" }}
                />
              </Link>
              <Link href="https://twitter.com" className="text-light me-2">
                <FontAwesomeIcon
                  icon={faTwitter}
                  style={{ fontSize: "25px" }}
                />
              </Link>
              <Link href="https://instagram.com" className="text-light me-2">
                <FontAwesomeIcon
                  icon={faInstagram}
                  style={{ fontSize: "25px" }}
                />
              </Link>
              <Link href="https://youtube.com" className="text-light">
                <FontAwesomeIcon
                  icon={faYoutube}
                  style={{ fontSize: "25px" }}
                />
              </Link>
            </Col>
          </Row>
        </Container>
        <Container className="mt-4">
          <Row>
            <Col className="text-light">
              <h1 style={{ fontSize: "26px", color: "#ABABAB" }}>
                CÔNG TY LIÊN DOANH TNHH KFC VIỆT NAM
              </h1>
              <p style={{ fontSize: "15px", color: "#ababab" }}>
                Số 292 Bà Triệu, P. Lê Đại Hành, Q. Hai Bà Trưng, TP. Hà Nội.
                Điện thoại: (028) 38489828 Email: lienhe@kfcvietnam.com.vn Mã số
                thuế: 0100773885 Ngày cấp: 29/10/1998 - Nơi cấp: Cục Thuế Thành
                Phố Hà Nội
              </p>
            </Col>
            <Col className="d-flex align-items-center justify-content-center">
              <Image src="https://kfcvn-static.cognizantorderserv.com/images/email/logo_footer.png"></Image>
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  );
};
export default Footer;
