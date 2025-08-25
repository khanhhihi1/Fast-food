"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
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
=======
import { Dropdown } from "react-bootstrap";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faClock,
  faSearch,
  faUser,
  faShoppingBag,
<<<<<<< HEAD
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
=======
} from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/header.module.css";

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/users/profile", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.status) {
<<<<<<< HEAD
          setUser(data.result);
        } else {
          setUser(null);
=======
          setUser(data.result); // đã đăng nhập
        } else {
          setUser(null); // chưa đăng nhập
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
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
<<<<<<< HEAD
        router.push("/login");
=======
        router.push("/login"); // chuyển hướng về trang login
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
      } else {
        alert("Đăng xuất thất bại!");
      }
    } catch (err) {
      console.error(err);
    }
  };

<<<<<<< HEAD
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
=======
  return (
    <>
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
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
<<<<<<< HEAD
                    className="text-white p-0 border-0"
                    style={{ fontSize: "18px" }}
=======
                    id="dropdown-user"
                    className="text-white p-0 border-0"
                    style={{ fontSize: "16px" }}
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
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
<<<<<<< HEAD
                    fontSize: "18px",
=======
                    fontSize: "16px",
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
                    fontWeight: "600",
                  }}
                >
                  <FontAwesomeIcon icon={faUser} />
                </Link>
              )}
<<<<<<< HEAD

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
                    className={styles.searchInput}
                  />
                )}

                {showSearch && searchResults.length > 0 && (
                  <div className={styles.searchResults}>
                    {searchResults.map((product: any) => (
                      <Link
                        key={product._id}
                        href={`/productList/${product._id}`}
                        className={styles.searchItem}
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
                          <div style={{ fontWeight: "600" }}>{product.name}</div>
                          {renderPrice(product.sizes)}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

=======
              <FontAwesomeIcon
                icon={faSearch}
                className="text-light"
                style={{ fontSize: "16px" }}
              />
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
              <Link href="/cart">
                <FontAwesomeIcon
                  icon={faShoppingBag}
                  className="text-light me-2"
<<<<<<< HEAD
                  style={{ fontSize: "18px" }}
                />
              </Link>
              <Link href="/favoriteProduct">
                <FontAwesomeIcon
                  icon={faHeart}
                  className="text-light me-2"
                  style={{ fontSize: "18px" }}
=======
                  style={{ fontSize: "16px" }}
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
                />
              </Link>
            </Col>
          </Row>
        </Container>
      </Container>
<<<<<<< HEAD

      {/* Menu chính */}
=======
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
      <Container fluid className={styles.box}>
        <Container
          style={{
            paddingLeft: "100px",
            paddingRight: "100px",
<<<<<<< HEAD
            height: "auto",
=======
            height: "150px",
            paddingTop: "20px",
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
          }}
        >
          <Row>
            <Col
              xs={5}
              className="d-flex align-items-center justify-content-center"
              style={{ gap: "30px" }}
            >
<<<<<<< HEAD
              <Link href="/" className={styles.aLink}>
                TRANG CHỦ
              </Link>
              <Link href="/introduce" className={styles.aLink}>
                GIỚI THIỆU
              </Link>
              <Link href="/category/all" className={styles.aLink}>
=======
              <Link href="/" className={`${styles.aLink}`}>
                TRANG CHỦ
              </Link>
              <Link href="/" className={`${styles.aLink}`}>
                GIỚI THIỆU
              </Link>
              <Link href="/menu" className={`${styles.aLink}`}>
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
                THỰC ĐƠN
              </Link>
            </Col>
            <Col
              xs={2}
              className="d-flex align-items-center justify-content-center"
            >
              <Image
<<<<<<< HEAD
                src="/logo.png"
=======
                src="/Logo.png"
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
                alt="Logo"
                style={{ width: "130px", height: "130px" }}
              />
            </Col>
            <Col
              xs={5}
              className="d-flex align-items-center justify-content-center"
              style={{ gap: "30px" }}
            >
<<<<<<< HEAD
              <Link href="/new" className={styles.aLink}>
                TIN TỨC
              </Link>
              <Link href="/contact" className={styles.aLink}>
                LIÊN HỆ
              </Link>
              <Link href="/blogtext" className={styles.aLink}>
                BLOG
=======
              <Link href="/" className={`${styles.aLink}`}>
                TIN TỨC
              </Link>
              <Link href="/" className={`${styles.aLink}`}>
                LIÊN HỆ
              </Link>
              <Link href="/" className={`${styles.aLink}`}>
                NHƯỢNG QUYỀN
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
              </Link>
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  );
}
