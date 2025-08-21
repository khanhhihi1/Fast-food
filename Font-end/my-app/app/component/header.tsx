"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dropdown,
  Navbar,
  Nav,
  NavDropdown,
  Container,
  Image,
  Row,
  Col,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faClock,
  faSearch,
  faUser,
  faShoppingBag,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import debounce from "lodash/debounce";
import styles from "../styles/header.module.css";

interface Product {
  id: string;
  _id?: string;
  category: string;
  name: string;
  image: string;
  sizes?: {
    name: string;
    price: {
      original: number;
      discount?: number;
    };
  }[];
  rating?: number;
  time?: string;
  description?: string | string[];
  taste?: string[] | Record<string, number>;
}

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const renderPrice = (sizes?: Product["sizes"]) => {
    if (!sizes || sizes.length === 0) return "Không rõ";

    const firstSize = sizes[0];
    const { original, discount } = firstSize.price;

    if (discount) {
      return (
        <>
          <span
            style={{
              textDecoration: "line-through",
              color: "#888",
              marginRight: "8px",
            }}
          >
            {original.toLocaleString()}đ
          </span>
          <span style={{ color: "red", fontWeight: "bold" }}>
            {discount.toLocaleString()}đ
          </span>
        </>
      );
    } else {
      return `${original.toLocaleString()}đ`;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/users/profile", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.status) {
          setUser(data.result);
        } else {
          setUser(null);
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
        router.push("/login");
      } else {
        alert("Đăng xuất thất bại!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSearchResults = async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/products/search?keyword=${encodeURIComponent(
          keyword
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Lỗi tìm kiếm:", errorData.message || "Có lỗi xảy ra");
        return;
      }

      const data = await res.json();
      if (data.success) {
        setSearchResults(data.result);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Lỗi tìm kiếm:", err);
    }
  };

  const debouncedSearch = debounce((keyword: string) => {
    fetchSearchResults(keyword);
  }, 400);

  useEffect(() => {
    if (showSearch) {
      debouncedSearch(searchKeyword);
    } else {
      setSearchResults([]);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchKeyword, showSearch]);

  return (
    <>
      {/* Thanh thông tin */}
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
                    className="text-white p-0 border-0"
                    style={{ fontSize: "18px" }}
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
                    fontSize: "18px",
                    fontWeight: "600",
                  }}
                >
                  <FontAwesomeIcon icon={faUser} />
                </Link>
              )}

              {/* Tìm kiếm */}
              <div className="d-flex align-items-center position-relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="text-light"
                  style={{ fontSize: "18px", cursor: "pointer" }}
                  onClick={() => {
                    setShowSearch(!showSearch);
                    setSearchResults([]);
                    setSearchKeyword("");
                  }}
                />
                {showSearch && (
                  <input
                    type="text"
                    placeholder="Tìm sản phẩm..."
                    value={searchKeyword}
                    onChange={(e) => {
                      setSearchKeyword(e.target.value);
                      setShowSearch(true);
                    }}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      marginLeft: "10px",
                      fontSize: "14px",
                    }}
                  />
                )}

                {showSearch && searchResults.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "40px",
                      right: "0",
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      width: "320px",
                      maxHeight: "300px",
                      overflowY: "auto",
                      zIndex: 1000,
                      boxShadow: "0px 2px 10px rgba(0,0,0,0.2)",
                    }}
                  >
                    {searchResults.map((product: any) => (
                      <Link
                        key={product._id}
                        href={`/productList/${product._id}`}
                        className="d-flex align-items-center px-2 py-2 text-dark text-decoration-none border-bottom"
                        onClick={() => setShowSearch(false)}
                      >
                        <Image
                          src={product.image || "/no-image.png"}
                          alt={product.name}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            marginRight: "10px",
                          }}
                          rounded
                        />
                        <div>
                          <div style={{ fontWeight: "600" }}>
                            {product.name}
                          </div>
                          {renderPrice(product.sizes)}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/cart">
                <FontAwesomeIcon
                  icon={faShoppingBag}
                  className="text-light me-2"
                  style={{ fontSize: "18px" }}
                />
              </Link>
              <Link href="/favoriteProduct">
                <FontAwesomeIcon
                  icon={faHeart}
                  className="text-light me-2"
                  style={{ fontSize: "18px" }}
                />
              </Link>
            </Col>
          </Row>
        </Container>
      </Container>

      {/* Menu chính */}
      <Container fluid className={styles.box}>
        <Container
          style={{
            paddingLeft: "100px",
            paddingRight: "100px",
            height: "auto",
          }}
        >
          <Row>
            <Col
              xs={5}
              className="d-flex align-items-center justify-content-center"
              style={{ gap: "30px" }}
            >
              <Link href="/" className={styles.aLink}>
                TRANG CHỦ
              </Link>
              <Link href="/" className={styles.aLink}>
                GIỚI THIỆU
              </Link>
              <Link href="/menu" className={styles.aLink}>
                THỰC ĐƠN
              </Link>
            </Col>
            <Col
              xs={2}
              className="d-flex align-items-center justify-content-center"
            >
              <Image
                src="/logo.png"
                alt="Logo"
                style={{ width: "130px", height: "130px" }}
              />
            </Col>
            <Col
              xs={5}
              className="d-flex align-items-center justify-content-center"
              style={{ gap: "30px" }}
            >
              <Link href="/new" className={styles.aLink}>
                TIN TỨC
              </Link>
              <Link href="/" className={styles.aLink}>
                LIÊN HỆ
              </Link>
              <Link href="/" className={styles.aLink}>
                NHƯỢNG QUYỀN
              </Link>
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  );
}
