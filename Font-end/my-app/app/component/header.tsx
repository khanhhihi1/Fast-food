"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dropdown } from "react-bootstrap";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faClock,
  faSearch,
  faUser,
  faShoppingBag,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/header.module.css";

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/users/profile", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.status) {
          setUser(data.result); // đã đăng nhập
        } else {
          setUser(null); // chưa đăng nhập
        }
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5000/users/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.status) {
        setUser(null);
        router.push("/login"); // chuyển hướng về trang login
      } else {
        alert("Đăng xuất thất bại!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Container fluid style={{ backgroundColor: "#c10a28" }} className="p-2">
        <Container>
          <Row className="d-flex align-items-center">
            <Col className="d-flex align-items-center" style={{ gap: "10px" }}>
              <span
                className="text-light"
                style={{ fontSize: "16px", fontWeight: "600" }}
              >
                <FontAwesomeIcon
                  icon={faPhone}
                  className="text-light me-2"
                  style={{ fontSize: "16px" }}
                />
                0931892826
              </span>
              <span
                className="text-light mx-2"
                style={{ fontSize: "16px", fontWeight: "600" }}
              >
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-light me-1"
                  style={{ fontSize: "16px" }}
                />
                Thứ 2 - Chủ nhật: 9:00 - 18:00
              </span>
            </Col>
            <Col
              className="d-flex justify-content-end align-items-center"
              style={{ gap: "10px" }}
            >
              {user ? (
                <Dropdown>
                  <Dropdown.Toggle
                    variant="link"
                    id="dropdown-user"
                    className="text-white p-0 border-0"
                    style={{ fontSize: "16px" }}
                  >
                    <FontAwesomeIcon icon={faUser} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                    <Dropdown.Item as={Link} href="/account">
                      Tài khoản
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleLogout}>
                      Đăng xuất
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Link
                  href="/login"
                  style={{
                    textDecoration: "none",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  <FontAwesomeIcon icon={faUser} />
                </Link>
              )}
              <FontAwesomeIcon
                icon={faSearch}
                className="text-light"
                style={{ fontSize: "16px" }}
              />
              <Link href="/cart">
                <FontAwesomeIcon
                  icon={faShoppingBag}
                  className="text-light me-2"
                  style={{ fontSize: "16px" }}
                />
              </Link>
            </Col>
          </Row>
        </Container>
      </Container>
      <Container fluid className={styles.box}>
        <Container
          style={{
            paddingLeft: "100px",
            paddingRight: "100px",
            height: "150px",
            paddingTop: "20px",
          }}
        >
          <Row>
            <Col
              xs={5}
              className="d-flex align-items-center justify-content-center"
              style={{ gap: "30px" }}
            >
              <Link href="/" className={`${styles.aLink}`}>
                TRANG CHỦ
              </Link>
              <Link href="/" className={`${styles.aLink}`}>
                GIỚI THIỆU
              </Link>
              <Link href="/menu" className={`${styles.aLink}`}>
                THỰC ĐƠN
              </Link>
            </Col>
            <Col
              xs={2}
              className="d-flex align-items-center justify-content-center"
            >
              <Image
                src="/Logo.png"
                alt="Logo"
                style={{ width: "130px", height: "130px" }}
              />
            </Col>
            <Col
              xs={5}
              className="d-flex align-items-center justify-content-center"
              style={{ gap: "30px" }}
            >
              <Link href="/" className={`${styles.aLink}`}>
                TIN TỨC
              </Link>
              <Link href="/" className={`${styles.aLink}`}>
                LIÊN HỆ
              </Link>
              <Link href="/" className={`${styles.aLink}`}>
                NHƯỢNG QUYỀN
              </Link>
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  );
}
