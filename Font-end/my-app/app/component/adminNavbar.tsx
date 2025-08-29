"use client";
import React, { useState } from "react";
import {
  Container,
  Navbar,
  Form,
  Button,
  Offcanvas,
  Dropdown,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarsStaggered,
  faBell,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import styles from "./stylesComponent/adminNavbar.module.css";

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
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const toggleSidebar = () => setCollapsed(!collapsed);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [user, setUser] = useState(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_URL}/users/logout`, {
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

  return (
    <Navbar className={styles.navbar}>
      <Container fluid className={styles.containerFluid}>
        <Button onClick={toggleSidebar} className={styles.toggleBtn}>
          <FontAwesomeIcon icon={faBarsStaggered} />
        </Button>

        <div className={styles.rightSection}>
          <span>
            <FontAwesomeIcon icon={faBell} className={styles.bellIcon} />
          </span>

          <Offcanvas show={show} onHide={handleClose} placement="end">
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
