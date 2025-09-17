"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dropdown, Container, Image, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faClock,
  faSearch,
  faUser,
  faShoppingBag,
  faHeart,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import debounce from "lodash/debounce";
import styles from "../styles/header.module.css";
import { toast } from "react-toastify";

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

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export default function Header() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

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

  // Giả lập dữ liệu notifications
  useEffect(() => {
    setNotifications([
      {
        _id: "68ca23684b51cb23f816b81e",
        title: "Đặt hàng thành công 🎉",
        message: "Đơn hàng #68ca23684b51cb23f816b818 đã được tạo thành công.",
        type: "order",
        link: "/orders/68ca23684b51cb23f816b818",
        isRead: false,
        createdAt: "2025-09-17T02:56:40.087Z",
      },
      {
        _id: "68ca23f44b51cb23f816b820",
        title: "Khuyến mãi hot 🔥",
        message: "Giảm ngay 30% cho Pizza size L trong hôm nay!",
        type: "promo",
        link: "/category/pizza",
        isRead: false,
        createdAt: "2025-09-16T10:00:00.000Z",
      },
      {
        _id: "68ca24084b51cb23f816b821",
        title: "Cập nhật đơn hàng",
        message: "Đơn hàng #68c99e352274d52a0dead579 đã được giao thành công.",
        type: "order",
        link: "/orders/68c99e352274d52a0dead579",
        isRead: true,
        createdAt: "2025-09-15T08:30:00.000Z",
      },
    ]);
  }, []);

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
        toast.success("Đăng xuất thành công");
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
                <>
                  {/* User Dropdown */}
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

                  {/* Notifications */}
                  <Dropdown
                    show={showNotifications}
                    onToggle={() => setShowNotifications(!showNotifications)}
                  >
                    <Dropdown.Toggle
                      variant="link"
                      className="text-white p-0 border-0 position-relative"
                      style={{ fontSize: "18px", marginLeft: "10px" }}
                    >
                      <FontAwesomeIcon icon={faBell} />
                      {/* Đếm thông báo chưa đọc */}
                      {notifications.filter((n) => !n.isRead).length > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: "-5px",
                            right: "-5px",
                            background: "red",
                            color: "white",
                            borderRadius: "50%",
                            fontSize: "10px",
                            padding: "2px 5px",
                          }}
                        >
                          {notifications.filter((n) => !n.isRead).length}
                        </span>
                      )}
                    </Dropdown.Toggle>
                    <Dropdown.Menu
                      align="end"
                      style={{
                        minWidth: "320px",
                        maxHeight: "400px",
                        overflowY: "auto",
                      }}
                    >
                      {notifications.length > 0 ? (
                        notifications.map((noti) => (
                          <Dropdown.Item
                            key={noti._id}
                            as={Link}
                            href={noti.link}
                            className="d-flex flex-column"
                            style={{
                              backgroundColor: noti.isRead
                                ? "white"
                                : "#f8f9fa",
                              marginBottom: "2px",
                            }}
                            onClick={() => setShowNotifications(false)}
                          >
                            <strong>{noti.title}</strong>
                            <span style={{ fontSize: "14px" }}>
                              {noti.message}
                            </span>
                            <span style={{ fontSize: "12px", color: "gray" }}>
                              {new Date(noti.createdAt).toLocaleString("vi-VN")}
                            </span>
                          </Dropdown.Item>
                        ))
                      ) : (
                        <Dropdown.Item>Không có thông báo</Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </>
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
              <div
                className="d-flex align-items-center position-relative"
                style={{ marginLeft: "10px" }}
              >
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
                          src={`${API_URL}/${product.image}`}
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
              <Link href="/introduce" className={styles.aLink}>
                GIỚI THIỆU
              </Link>
              <Link href="/category/all" className={styles.aLink}>
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
              <Link href="/contact" className={styles.aLink}>
                LIÊN HỆ
              </Link>
              <Link href="/blogtext" className={styles.aLink}>
                BLOG
              </Link>
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  );
}
