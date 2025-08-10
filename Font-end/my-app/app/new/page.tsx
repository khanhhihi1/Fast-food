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
import Breadcrumb from "react-bootstrap/Breadcrumb";
export default function NewsPage() {
  return (
    <>
      <Breadcrumb
        className="m-0"
        style={{
          backgroundColor: "#ddd",
          padding: "10px 110px",
        }}
      >
        <Breadcrumb.Item
          href="/"
          className="breadCrumbItem"
          style={{ margin: "0px" }}
        >
          Trang chủ
        </Breadcrumb.Item>
        <Breadcrumb.Item href="" className="breadCrumbItem">
          Tin tức
        </Breadcrumb.Item>
      </Breadcrumb>
      <Container className="my-5">
        <Row>
          <Col xs={8} style={{ padding: "0" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <div
                style={{
                  width: "48%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <Image src="https://bizweb.dktcdn.net/100/510/571/articles/cach-lam-pizza-xot-mayonnaise-4.jpg?v=1709024419360"></Image>
                <h1 style={{ fontSize: "20px", margin: "0" }}>
                  Cách làm pizza xốt Mayonnaise thơm béo ngon ngất ngây
                </h1>
                <span style={{ color: "red" }}>27/02/2024</span>
                <p>
                  Các món pizza xốt Mayonnaise luôn góp mặt vào menu “vàng” của
                  chuỗi cửa hàng Dola trên toàn quốc. Hôm nay, hãy cùng khám phá
                  xem điều gì đã tạo nên...
                </p>
              </div>
              <div
                style={{
                  width: "48%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <Image src="https://bizweb.dktcdn.net/100/510/571/articles/cach-lam-pizza-xot-mayonnaise-4.jpg?v=1709024419360"></Image>
                <h1 style={{ fontSize: "20px", margin: "0" }}>
                  Cách làm pizza xốt Mayonnaise thơm béo ngon ngất ngây
                </h1>
                <span style={{ color: "red" }}>27/02/2024</span>
                <p>
                  Các món pizza xốt Mayonnaise luôn góp mặt vào menu “vàng” của
                  chuỗi cửa hàng Dola trên toàn quốc. Hôm nay, hãy cùng khám phá
                  xem điều gì đã tạo nên...
                </p>
              </div>
              <div
                style={{
                  width: "48%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <Image src="https://bizweb.dktcdn.net/100/510/571/articles/cach-lam-pizza-xot-mayonnaise-4.jpg?v=1709024419360"></Image>
                <h1 style={{ fontSize: "20px", margin: "0" }}>
                  Cách làm pizza xốt Mayonnaise thơm béo ngon ngất ngây
                </h1>
                <span style={{ color: "red" }}>27/02/2024</span>
                <p>
                  Các món pizza xốt Mayonnaise luôn góp mặt vào menu “vàng” của
                  chuỗi cửa hàng Dola trên toàn quốc. Hôm nay, hãy cùng khám phá
                  xem điều gì đã tạo nên...
                </p>
              </div>
            </div>
          </Col>
          <Col xs={4} style={{ padding: "0" }}>
            <div style={{ backgroundColor: "#c10a28", borderRadius: "5px" }}>
              <h1
                style={{
                  color: "white",
                  fontSize: "22px",
                  margin: "0",
                  padding: "10px",
                }}
              >
                Danh mục tin tức
              </h1>
            </div>
            <ul style={{ margin: "0", padding: "0" }}>
              <li style={{ fontSize: "18px", padding: "10px" }}>Trang chủ</li>
              <li style={{ fontSize: "18px", padding: "10px" }}>Trang chủ</li>
              <li style={{ fontSize: "18px", padding: "10px" }}>Trang chủ</li>
              <li style={{ fontSize: "18px", padding: "10px" }}>Trang chủ</li>
              <li style={{ fontSize: "18px", padding: "10px" }}>Trang chủ</li>
            </ul>

            <div
              style={{ backgroundColor: "#c10a28", borderRadius: "5px" }}
              className="mt-2"
            >
              <h1
                style={{
                  color: "white",
                  fontSize: "22px",
                  margin: "0",
                  padding: "10px",
                }}
              >
                Tin tức nổi bật
              </h1>
            </div>
            <ul style={{ margin: "0", padding: "0" }}>
              <li style={{ padding: "10px 0px" }}>
                <div style={{ display: "flex", gap: "5px" }}>
                  <div style={{ width: "35%" }}>
                    <Image src="https://bizweb.dktcdn.net/100/510/571/articles/tiet-lo-tinh-cach-qua-cach-an-pizza-0.jpg?v=1709024054670"></Image>
                  </div>
                  <div style={{ width: "65%" }}>
                    <p style={{ fontSize: "18px", padding: "10px" }}>
                      {" "}
                      Đế bánh pizza mua ở đâu đảm bảo chất lượng?{" "}
                    </p>
                  </div>
                </div>
              </li>
              <li style={{ padding: "10px 0px" }}>
                <div style={{ display: "flex", gap: "5px" }}>
                  <div style={{ width: "35%" }}>
                    <Image src="https://bizweb.dktcdn.net/100/510/571/articles/tiet-lo-tinh-cach-qua-cach-an-pizza-0.jpg?v=1709024054670"></Image>
                  </div>
                  <div style={{ width: "65%" }}>
                    <p style={{ fontSize: "18px", padding: "10px" }}>
                      {" "}
                      Đế bánh pizza mua ở đâu đảm bảo chất lượng?{" "}
                    </p>
                  </div>
                </div>
              </li>
              <li style={{ padding: "10px 0px" }}>
                <div style={{ display: "flex", gap: "5px" }}>
                  <div style={{ width: "35%" }}>
                    <Image src="https://bizweb.dktcdn.net/100/510/571/articles/tiet-lo-tinh-cach-qua-cach-an-pizza-0.jpg?v=1709024054670"></Image>
                  </div>
                  <div style={{ width: "65%" }}>
                    <p style={{ fontSize: "18px", padding: "10px" }}>
                      {" "}
                      Đế bánh pizza mua ở đâu đảm bảo chất lượng?{" "}
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </>
  );
}
