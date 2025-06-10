"use client";
import React, { useState } from "react";
import { Navbar, Nav, Container, Button, Offcanvas } from "react-bootstrap";
import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
export default function Header() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Navbar expand="lg" bg="dark" data-bs-theme="dark" style={{ opacity: 0.95 }}>
        <Container>
          <Navbar.Brand href="/">
            <img src="/logo.png" alt="Logo" height="40" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarNav" onClick={handleShow} />
          <Navbar.Collapse id="navbarNav">
            <Nav className="ms-auto">
              <Link className="nav-link text-white" href="/">Trang chủ</Link>
              <Link className="nav-link text-white" href="/">Giới thiệu</Link>
              <Link className="nav-link text-white" href="/contact">Hỗ trợ</Link>
              <Link className="nav-link text-white" href="/cart"><FaShoppingCart size={20} color="white" /></Link>
              <Link className="nav-link text-white" href="/login"> <FaUserCircle size={20} color="white" /></Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="container-fluid p-0">
        <img src="/slideshow_2.webp" className="img-fluid w-100 vh-100" alt="Slideshow" />
      </div>

      <Navbar expand="lg" bg="secondary" variant="dark">
        <Container>
          <Navbar.Brand href="/">Food Menu</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarNav2" />
          <Navbar.Collapse id="navbarNav2">
            <Nav className="ms-auto">
              <Link className="nav-link" href="/product">Combo Fried King</Link>
              <Link className="nav-link" href="/product-item">Thức ăn kèm</Link>
              <Link className="nav-link" href="#">Category 3</Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-4">
        <div className="row">
          {[
            { icon: "fas fa-motorcycle", title: "NHIỀU ƯU ĐÃI HẤP DẪN", text: "Hotline: 19009480" },
            { icon: "fas fa-drumstick-bite", title: "Shop đỉnh cao", text: "Đỉnh cao của thời đại" },
            { icon: "fas fa-mobile-alt", title: "ĐẶT HÀNG TRỰC TUYẾN", text: "Thanh toán Online" },
            { icon: "fas fa-phone-volume", title: "HỖ TRỢ NHANH CHÓNG", text: "Từ 9:00 đến 21:00 tất cả các ngày" }
          ].map((info, index) => (
            <div key={index} className="col-md-3 col-sm-6">
              <div className="info-box border rounded p-3 text-center">
                <i className={info.icon + " fa-2x"}></i>
                <h5 className="mt-2">{info.title}</h5>
                <p>{info.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
