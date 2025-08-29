"use client";
import React, { useState, useEffect } from "react";
import { Container, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "../styles/comment.module.css"; 
import AdminSideBar from "@/app/component/adminSideBar";
import AdminNavbar from "@/app/component/adminNavbar";

interface Comment {
    _id: string;
    userId: { name: string };
    orderId?: { _id: string };
    productId?: { name: string; image?: string };
    comment: string;
    rating: number;
    createdAt: string;
}

export default function CartManagementPage() {
    const [collapsed, setCollapsed] = useState(false);
    const [filterType, setFilterType] = useState<string>("all"); // all | high-low | low-high
    const [activeTab, setActiveTab] = useState<"all" | "order" | "product">("all");
    const [comments, setComments] = useState<Comment[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const fetchComments = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/comment/all`);
            const data = await res.json();
            if (data.status) {
                setComments(data.result);
            } else {
                setError(data.message || "Lỗi khi tải bình luận");
            }
        } catch (err) {
            setError("Lỗi kết nối đến máy chủ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    // Chia dữ liệu
    const orderComments = comments.filter(c => c.orderId && !c.productId);
    const productComments = comments.filter(c => c.productId);

    // Sắp xếp
    const sortComments = (list: Comment[]) => {
        if (filterType === "high-low") return [...list].sort((a, b) => b.rating - a.rating);
        if (filterType === "low-high") return [...list].sort((a, b) => a.rating - b.rating);
        return list;
    };

    // Lọc tìm kiếm
    const searchFilter = (list: Comment[]) => {
        return list.filter(c => c.userId?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    };

    const sortedOrderComments = searchFilter(sortComments(orderComments));
    const sortedProductComments = searchFilter(sortComments(productComments));

     return (
    <div className="d-flex dark-mode">
      <AdminSideBar />
      <Container
        fluid
        className={` ${styles.content} ${collapsed ? "collapsed-content" : ""}`}
        style={{ minHeight: "100vh" }}
      >
        <AdminNavbar />
        <div className={styles.cartAdmin}>
          <div className={styles.adminContainer}>
            <header className={styles.adminHeader}>
              <h1 className="text-center">🛒 Quản lý đánh giá</h1>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Tổng đánh giá</span>
                  <span className={styles.statValue}>{comments.length}</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Đánh giá cao (≥ 4★)</span>
                  <span className={styles.statValue}>{comments.filter((c) => c.rating >= 4).length}</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Đánh giá thấp (≤ 2★)</span>
                  <span className={styles.statValue}>{comments.filter((c) => c.rating <= 2).length}</span>
                </div>
              </div>
            </header>

            {/* Bộ lọc sắp xếp */}
            <div className={styles.filters}>
              <button
                className={`${styles.filterBtn} ${filterType === "all" ? styles.active : ""}`}
                onClick={() => setFilterType("all")}
              >
                Tất cả
              </button>
              <button
                className={`${styles.filterBtn} ${filterType === "high-low" ? styles.active : ""}`}
                onClick={() => setFilterType("high-low")}
              >
                Cao - thấp
              </button>
              <button
                className={`${styles.filterBtn} ${filterType === "low-high" ? styles.active : ""}`}
                onClick={() => setFilterType("low-high")}
              >
                Thấp - cao
              </button>
            </div>

            {/* Bộ lọc theo loại bình luận */}
            <div className={styles.filters} style={{ marginTop: "10px" }}>
              <button
                className={`${styles.filterBtn} ${activeTab === "all" ? styles.active : ""}`}
                onClick={() => setActiveTab("all")}
              >
                Tất cả
              </button>
              <button
                className={`${styles.filterBtn} ${activeTab === "order" ? styles.active : ""}`}
                onClick={() => setActiveTab("order")}
              >
                Bình luận Đơn hàng
              </button>
              <button
                className={`${styles.filterBtn} ${activeTab === "product" ? styles.active : ""}`}
                onClick={() => setActiveTab("product")}
              >
                Bình luận Sản phẩm
              </button>

              <Form.Control
                type="text"
                placeholder="🔍 Tìm theo tên khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  maxWidth: "250px",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
            </div>

            {/* Hiển thị dữ liệu */}
            {activeTab === "all" && (
              <>
                <h2 className={`${styles.titleItem} text-center`}>📦 Bình luận theo Đơn hàng</h2>
                <div className={styles.ordersTableWrapper}>
                  <div className={styles.ordersTable}>
                    <div className={styles.tableHeader}>
                      <div>Khách hàng</div>
                      <div>Đơn hàng</div>
                      <div>Đánh giá</div>
                      <div>Bình luận</div>
                      <div>Thời gian</div>
                    </div>
                    <div className={styles.tableBody}>
                      {loading ? (
                        <div className={styles.loading}>Đang tải...</div>
                      ) : error ? (
                        <div className={styles.error}>{error}</div>
                      ) : sortedOrderComments.length > 0 ? (
                        sortedOrderComments.map((c) => (
                          <div key={c._id} className={styles.tableRow}>
                            <div className={styles.tableCell}>{c.userId?.name}</div>
                            <div className={styles.tableCell}>{c.orderId?._id}</div>
                            <div className={styles.tableCell}>{c.rating} ★</div>
                            <div className={styles.tableCell}>{c.comment}</div>
                            <div className={styles.tableCell}>
                              {new Date(c.createdAt).toLocaleString("vi-VN")}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={styles.noData}>Không có bình luận đơn hàng</div>
                      )}
                    </div>
                  </div>
                </div>

                <h2 className={`${styles.titleItem1} text-center`}>🛒 Bình luận theo Sản phẩm</h2>
                <div className={styles.ordersTableWrapper}>
                  <div className={styles.ordersTable}>
                    <div className={styles.tableHeader}>
                      <div>Khách hàng</div>
                      <div>Sản phẩm</div>
                      <div>Đánh giá</div>
                      <div>Bình luận</div>
                      <div>Thời gian</div>
                    </div>
                    <div className={styles.tableBody}>
                      {loading ? (
                        <div className={styles.loading}>Đang tải...</div>
                      ) : error ? (
                        <div className={styles.error}>{error}</div>
                      ) : sortedProductComments.length > 0 ? (
                        sortedProductComments.map((c) => (
                          <div key={c._id} className={styles.tableRow}>
                            <div className={styles.tableCell}>{c.userId?.name}</div>
                            <div className={styles.tableCell}>{c.productId?.name || "Không có"}</div>
                            <div className={styles.tableCell}>{c.rating} ★</div>
                            <div className={styles.tableCell}>{c.comment}</div>
                            <div className={styles.tableCell}>
                              {new Date(c.createdAt).toLocaleString("vi-VN")}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={styles.noData}>Không có bình luận sản phẩm</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "order" && (
              <>
                <h2  className={`${styles.titleItem} text-center`}>📦 Bình luận theo Đơn hàng</h2>
                <div className={styles.ordersTableWrapper}>
                  <div className={styles.ordersTable}>
                    <div className={styles.tableHeader}>
                      <div>Khách hàng</div>
                      <div>Đơn hàng</div>
                      <div>Đánh giá</div>
                      <div>Bình luận</div>
                      <div>Thời gian</div>
                    </div>
                    <div className={styles.tableBody}>
                      {sortedOrderComments.length > 0 ? (
                        sortedOrderComments.map((c) => (
                          <div key={c._id} className={styles.tableRow}>
                            <div className={styles.tableCell}>{c.userId?.name}</div>
                            <div className={styles.tableCell}>{c.orderId?._id}</div>
                            <div className={styles.tableCell}>{c.rating} ★</div>
                            <div className={styles.tableCell}>{c.comment}</div>
                            <div className={styles.tableCell}>
                              {new Date(c.createdAt).toLocaleString("vi-VN")}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={styles.noData}>Không có bình luận đơn hàng</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "product" && (
              <>
                <h2  className={`${styles.titleItem} text-center`}>🛒 Bình luận theo Sản phẩm</h2>
                <div className={styles.ordersTableWrapper}>
                  <div className={styles.ordersTable}>
                    <div className={styles.tableHeader}>
                      <div>Khách hàng</div>
                      <div>Sản phẩm</div>
                      <div>Đánh giá</div>
                      <div>Bình luận</div>
                      <div>Thời gian</div>
                    </div>
                    <div className={styles.tableBody}>
                      {sortedProductComments.length > 0 ? (
                        sortedProductComments.map((c) => (
                          <div key={c._id} className={styles.tableRow}>
                            <div className={styles.tableCell}>{c.userId?.name}</div>
                            <div className={styles.tableCell}>{c.productId?.name || "Không có"}</div>
                            <div className={styles.tableCell}>{c.rating} ★</div>
                            <div className={styles.tableCell}>{c.comment}</div>
                            <div className={styles.tableCell}>
                              {new Date(c.createdAt).toLocaleString("vi-VN")}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={styles.noData}>Không có bình luận sản phẩm</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
