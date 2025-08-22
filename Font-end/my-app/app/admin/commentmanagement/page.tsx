"use client";
import React, { useState, useEffect } from "react";
import { Container, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./comment.css";
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
            <Container fluid className={`content w-100 container-content ${collapsed ? "collapsed-content" : ""}`} style={{ minHeight: "100vh" }}>
                <AdminNavbar />
                <div className="cart-admin">
                    <div className="admin-container">
                        <header className="admin-header">
                            <h1>🛒 Quản lý đánh giá</h1>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <span className="stat-label">Tổng đánh giá</span>
                                    <span className="stat-value">{comments.length}</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Đánh giá cao (≥ 4★)</span>
                                    <span className="stat-value">{comments.filter(c => c.rating >= 4).length}</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Đánh giá thấp (≤ 2★)</span>
                                    <span className="stat-value">{comments.filter(c => c.rating <= 2).length}</span>
                                </div>
                            </div>
                        </header>

                        {/* Bộ lọc sắp xếp */}
                        <div className="filters">
                            <button
                                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                                onClick={() => setFilterType('all')}
                            >
                                Tất cả
                            </button>
                            <button
                                className={`filter-btn ${filterType === 'high-low' ? 'active' : ''}`}
                                onClick={() => setFilterType('high-low')}
                            >
                                Cao - thấp
                            </button>
                            <button
                                className={`filter-btn ${filterType === 'low-high' ? 'active' : ''}`}
                                onClick={() => setFilterType('low-high')}
                            >
                                Thấp - cao
                            </button>
                        </div>

                        {/* Bộ lọc theo loại bình luận */}
                        <div className="filters" style={{ marginTop: "10px" }}>
                            <button
                                className={`filter-btn ${activeTab === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveTab('all')}
                            >
                                Tất cả
                            </button>
                            <button
                                className={`filter-btn ${activeTab === 'order' ? 'active' : ''}`}
                                onClick={() => setActiveTab('order')}
                            >
                                Bình luận Đơn hàng
                            </button>
                            <button
                                className={`filter-btn ${activeTab === 'product' ? 'active' : ''}`}
                                onClick={() => setActiveTab('product')}
                            >
                                Bình luận Sản phẩm
                            </button>

                            <Form.Control
                                type="text"
                                placeholder="🔍 Tìm theo tên khách hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ maxWidth: "250px", background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
                            />
                        </div>

                        {/* Hiển thị dữ liệu */}
                        {activeTab === "all" && (
                            <>
                                <h2>📦 Bình luận theo Đơn hàng</h2>
                                <div className="orders-table-wrapper">
                                    <div className="orders-table">
                                        <div className="table-header">
                                            <div className="header-cell">Khách hàng</div>
                                            <div className="header-cell">Đơn hàng</div>
                                            <div className="header-cell">Đánh giá</div>
                                            <div className="header-cell">Bình luận</div>
                                            <div className="header-cell">Thời gian</div>
                                        </div>
                                        <div className="table-body">
                                            {loading ? (
                                                <div className="loading">Đang tải...</div>
                                            ) : error ? (
                                                <div className="error">{error}</div>
                                            ) : sortedOrderComments.length > 0 ? (
                                                sortedOrderComments.map((c) => (
                                                    <div key={c._id} className="table-row">
                                                        <div className="table-cell">{c.userId?.name}</div>
                                                        <div className="table-cell">{c.orderId?._id}</div>
                                                        <div className="table-cell">{c.rating} ★</div>
                                                        <div className="table-cell">{c.comment}</div>
                                                        <div className="table-cell">{new Date(c.createdAt).toLocaleString("vi-VN")}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="no-data">Không có bình luận đơn hàng</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <h2>🛒 Bình luận theo Sản phẩm</h2>
                                <div className="orders-table-wrapper">
                                    <div className="orders-table">
                                        <div className="table-header">
                                            <div className="header-cell">Khách hàng</div>
                                            <div className="header-cell">Sản phẩm</div>
                                            <div className="header-cell">Đánh giá</div>
                                            <div className="header-cell">Bình luận</div>
                                            <div className="header-cell">Thời gian</div>
                                        </div>
                                        <div className="table-body">
                                            {loading ? (
                                                <div className="loading">Đang tải...</div>
                                            ) : error ? (
                                                <div className="error">{error}</div>
                                            ) : sortedProductComments.length > 0 ? (
                                                sortedProductComments.map((c) => (
                                                    <div key={c._id} className="table-row">
                                                        <div className="table-cell">{c.userId?.name}</div>
                                                        <div className="table-cell">{c.productId?.name || "Không có"}</div>
                                                        <div className="table-cell">{c.rating} ★</div>
                                                        <div className="table-cell">{c.comment}</div>
                                                        <div className="table-cell">{new Date(c.createdAt).toLocaleString("vi-VN")}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="no-data">Không có bình luận sản phẩm</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "order" && (
                            <>
                                <h2>📦 Bình luận theo Đơn hàng</h2>
                                <div className="orders-table-wrapper">
                                    <div className="orders-table">
                                        <div className="table-header">
                                            <div className="header-cell">Khách hàng</div>
                                            <div className="header-cell">Đơn hàng</div>
                                            <div className="header-cell">Đánh giá</div>
                                            <div className="header-cell">Bình luận</div>
                                            <div className="header-cell">Thời gian</div>
                                        </div>
                                        <div className="table-body">
                                            {sortedOrderComments.length > 0 ? (
                                                sortedOrderComments.map((c) => (
                                                    <div key={c._id} className="table-row">
                                                        <div className="table-cell">{c.userId?.name}</div>
                                                        <div className="table-cell">{c.orderId?._id}</div>
                                                        <div className="table-cell">{c.rating} ★</div>
                                                        <div className="table-cell">{c.comment}</div>
                                                        <div className="table-cell">{new Date(c.createdAt).toLocaleString("vi-VN")}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="no-data">Không có bình luận đơn hàng</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "product" && (
                            <>
                                <h2>🛒 Bình luận theo Sản phẩm</h2>
                                <div className="orders-table-wrapper">
                                    <div className="orders-table">
                                        <div className="table-header">
                                            <div className="header-cell">Khách hàng</div>
                                            <div className="header-cell">Sản phẩm</div>
                                            <div className="header-cell">Đánh giá</div>
                                            <div className="header-cell">Bình luận</div>
                                            <div className="header-cell">Thời gian</div>
                                        </div>
                                        <div className="table-body">
                                            {sortedProductComments.length > 0 ? (
                                                sortedProductComments.map((c) => (
                                                    <div key={c._id} className="table-row">
                                                        <div className="table-cell">{c.userId?.name}</div>
                                                        <div className="table-cell">{c.productId?.name || "Không có"}</div>
                                                        <div className="table-cell">{c.rating} ★</div>
                                                        <div className="table-cell">{c.comment}</div>
                                                        <div className="table-cell">{new Date(c.createdAt).toLocaleString("vi-VN")}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="no-data">Không có bình luận sản phẩm</div>
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
