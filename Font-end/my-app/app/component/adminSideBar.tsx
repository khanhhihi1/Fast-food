"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faBarsProgress,
  faCartShopping,
  faTicket,
  faCircleUser,
  faChartSimple,
  faComments,
  faChevronUp,
  faChevronDown,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { usePathname } from "next/navigation"; // 👈 import hook này
import { motion, AnimatePresence } from "framer-motion";
import styles from "./stylesComponent/adminSidebar.module.css";

export default function AdminSideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openProductMenu, setOpenProductMenu] = useState(false);
  const pathname = usePathname(); // 👈 lấy URL hiện tại

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <h3 className={styles.logo}>
        <img src="/logo.png" alt="Logo" className={styles.logoImg} />
      </h3>
      <div className={styles.navbar}>
        <div className={styles.navItem}>
          {/* Dashboard */}
          <div
            className={`${styles.navLink} ${
              pathname === "/admin" ? styles.active : ""
            }`}
          >
            <FontAwesomeIcon icon={faHouse} className={styles.icon} />
            <Link href="/admin" className={styles.linkText}>
              Dashboard
            </Link>
          </div>

          {/* Quản lý sản phẩm */}
          <div
            className={`${styles.navLink} ${styles.dropdown}`}
            onClick={() => setOpenProductMenu(!openProductMenu)}
          >
            <div className={styles.dropdownLabel}>
              <FontAwesomeIcon icon={faBarsProgress} className={styles.icon} />
              <span>Quản lý sản phẩm</span>
            </div>
            <FontAwesomeIcon
              icon={openProductMenu ? faChevronUp : faChevronDown}
              className={styles.icon}
            />
          </div>

          <AnimatePresence>
            {openProductMenu && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={styles.submenu}
              >
                <Link
                  href="/admin/productActive"
                  className={`${styles.subLink} ${
                    pathname === "/admin/productActive" ? styles.active : ""
                  }`}
                >
                  Sản phẩm đang bán
                </Link>
                <Link
                  href="/admin/productCategory"
                  className={`${styles.subLink} ${
                    pathname === "/admin/productCategory" ? styles.active : ""
                  }`}
                >
                  Danh mục sản phẩm
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quản lý đơn hàng */}
          <div
            className={`${styles.navLink} ${
              pathname === "/admin/order" ? styles.active : ""
            }`}
          >
            <FontAwesomeIcon icon={faCartShopping} className={styles.icon} />
            <Link href="/admin/order" className={styles.linkText}>
              Quản lý đơn hàng
            </Link>
          </div>

          {/* Quản lý voucher */}
          <div
            className={`${styles.navLink} ${
              pathname === "/admin/vouchermanagement" ? styles.active : ""
            }`}
          >
            <FontAwesomeIcon icon={faTicket} className={styles.icon} />
            <Link href="/admin/vouchermanagement" className={styles.linkText}>
              Quản lý voucher
            </Link>
          </div>

          {/* Quản lý người dùng */}
          <div
            className={`${styles.navLink} ${
              pathname === "/admin/user" ? styles.active : ""
            }`}
          >
            <FontAwesomeIcon icon={faCircleUser} className={styles.icon} />
            <Link href="/admin/user" className={styles.linkText}>
              Quản lý người dùng
            </Link>
          </div>

          {/* Thống kê */}
          <div
            className={`${styles.navLink} ${
              pathname === "/admin/statistics" ? styles.active : ""
            }`}
          >
            <FontAwesomeIcon icon={faChartSimple} className={styles.icon} />
            <Link href="/admin/statistics" className={styles.linkText}>
              Thống kê
            </Link>
          </div>

          {/* Đánh giá */}
          <div
            className={`${styles.navLink} ${
              pathname === "/admin/commentmanagement" ? styles.active : ""
            }`}
          >
            <FontAwesomeIcon icon={faComments} className={styles.icon} />
            <Link href="/admin/commentmanagement" className={styles.linkText}>
              Đánh giá
            </Link>
          </div>

          {/* Đăng xuất */}
          <div className={styles.navLink}>
            <FontAwesomeIcon icon={faRightFromBracket} className={styles.icon} />
            <Link href="#" className={styles.linkText}>
              Đăng xuất
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
