"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
  Navbar,
  Form,
  Button,
  Offcanvas,
  Dropdown,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBarsStaggered, faBell } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import styles from "./stylesComponent/adminNavbar.module.css";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return true;
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", newMode ? "dark" : "light");
        document.body.classList.toggle("dark-mode", newMode);
      }
      return newMode;
    });
  };

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.classList.toggle("dark-mode", isDarkMode);
    }
  }, [isDarkMode]);

  return { isDarkMode, toggleDarkMode };
};

export default function AdminNavbar() {
  const [show, setShow] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const toggleSidebar = () => setCollapsed(!collapsed);

  // Lấy danh sách thông báo cho admin
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/notifications/admin`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setNotifications(data.result);
        }
      } catch (err) {
        console.error("Lỗi lấy thông báo admin:", err);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <Navbar className={styles.navbar}>
      <Container fluid className={styles.containerFluid}>
        {/* Nút toggle sidebar */}
        <Button onClick={toggleSidebar} className={styles.toggleBtn}>
          <FontAwesomeIcon icon={faBarsStaggered} />
        </Button>

        <div className={styles.rightSection}>
          {/* Notifications */}
          <Dropdown
            show={showNotifications}
            onToggle={() => setShowNotifications(!showNotifications)}
          >
            <Dropdown.Toggle
              variant="link"
              className="p-0 border-0 position-relative"
              style={{
                fontSize: "18px",
                marginLeft: "10px",
                background: "transparent",
              }}
            >
              <FontAwesomeIcon icon={faBell} className={styles.bellIcon} />
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
                    href={noti.link}
                    className="d-flex flex-column"
                    style={{
                      backgroundColor: noti.isRead ? "white" : "#f8f9fa",
                      marginBottom: "2px",
                    }}
                    onClick={() => setShowNotifications(false)}
                  >
                    <strong>{noti.title}</strong>
                    <span style={{ fontSize: "14px" }}>{noti.message}</span>
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

          {/* Offcanvas cấu hình */}
          <Offcanvas show={show} onHide={() => setShow(false)} placement="end">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Cấu hình trang web</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>
                  {isDarkMode
                    ? "Trạng thái: Light Mode"
                    : "Trạng thái: Dark Mode"}
                </span>
                <Form.Check
                  type="switch"
                  id="dark-mode-switch"
                  label=""
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                />
              </div>
            </Offcanvas.Body>
          </Offcanvas>
        </div>
      </Container>
    </Navbar>
  );
}
