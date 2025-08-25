"use client";
<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import {
    Container,
=======
import "./voucher.css";
import "../admin.css";
import React, { useState, useEffect } from "react";
import {
    Container,
    Row,
    Col,
    Card,
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
    Table,
    Button,
    Form,
} from "react-bootstrap";
import AdminSideBar from "@/app/component/adminSideBar";
import AdminNavbar from "@/app/component/adminNavbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
<<<<<<< HEAD
import { faEyeSlash, faPenToSquare, faPlus, faRotate, faSearch } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import VoucherFormModal from "@/app/component/createVoucherModal";
import VoucherUpdateModal from "@/app/component/updateVoucherModal";
import styles from "../styles/product.module.css";
import { Voucher } from "@/app/type/voucher";
export default function VoucherPages() {
    const [collapsed, setCollapsed] = useState(false);
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
    const [searchTerm, setSearchTerm] = useState("");
=======
import { faEyeSlash, faPenToSquare, faPlus } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import VoucherFormModal from "@/app/component/createVoucherModal";
import VoucherUpdateModal from "@/app/component/updateVoucherModal";

interface Voucher {
    _id: string;
    code: string;
    description: string;
    discountValue: number;
    discountType: string;
    minOrderValue: number;
    maxDiscount: number;
    expiresAt: string;
    isActive: boolean;
}

export default function VoucherPages() {
    const [collapsed, setCollapsed] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
<<<<<<< HEAD
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const fetchVouchers = async () => {
        try {
            const res = await fetch(`${API_URL}/voucher`);
=======

    // Fetch voucher list
    const fetchVouchers = async () => {
        try {
            const res = await fetch("http://localhost:5000/voucher");
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
            const data = await res.json();
            if (data.status) {
                setVouchers(data.result);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Lỗi khi fetch vouchers:", error);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

<<<<<<< HEAD
    const handleHideVoucher = async (id: string) => {
        if (!confirm("Bạn có chắc muốn ẩn voucher này?")) return;
        try {
            const res = await fetch(`${API_URL}/voucher/${id}/hide`, {
=======
    // Handle hide voucher
    const handleHideVoucher = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:5000/voucher/${id}/hide`, {
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (data.status) {
<<<<<<< HEAD
                toast.success("Voucher ẩn thành công");
=======
                toast.success("Voucher ẩn thành công")
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
                fetchVouchers();
            } else {
                alert(data.message);
            }
        } catch (error) {
<<<<<<< HEAD
            toast.error("Lỗi khi ẩn voucher");
            console.error("Lỗi khi ẩn voucher:", error);
        }
    };

=======
            toast.error("Lỗi khi ẩn voucher")
            console.error("Lỗi khi ẩn voucher:", error);
        }
    };
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
    const handleVoucherUpdated = (updatedVoucher: Voucher) => {
        setVouchers((prev) =>
            prev.map((v) => (v._id === updatedVoucher._id ? updatedVoucher : v))
        );
        setShowUpdateModal(false);
    };
<<<<<<< HEAD

=======
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
    const handleVoucherAdded = (newVoucher: Voucher) => {
        setVouchers((prev) => [newVoucher, ...prev]);
        setShowAddModal(false);
    };
<<<<<<< HEAD

    const handleRestoreVoucher = async (id: string) => {
        if (!confirm("Bạn có chắc muốn khôi phục voucher này?")) return;
        try {
            const res = await fetch(`${API_URL}/voucher/${id}/restore`, {
=======
    // Handle restore voucher
    const handleRestoreVoucher = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:5000/voucher/${id}/restore`, {
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (data.status) {
<<<<<<< HEAD
                toast.success("Voucher khôi phục thành công");
=======
                toast.success("Voucher khôi phục thành công")
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
                fetchVouchers();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Lỗi khi khôi phục voucher:", error);
        }
    };

    const filteredVouchers = vouchers.filter((voucher) => {
<<<<<<< HEAD
        if (statusFilter === "active" && !voucher.isActive) return false;
        if (statusFilter === "inactive" && voucher.isActive) return false;

        if (searchTerm.trim() && !voucher.code.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }
        return true;
=======
        if (statusFilter === "all") return true;
        return (voucher.isActive ? "active" : "inactive") === statusFilter;
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="d-flex dark-mode">
            <AdminSideBar />
<<<<<<< HEAD
            <Container fluid className={`content w-100 container-content ${collapsed ? "collapsed-content" : ""}`} style={{ minHeight: "100vh" }}>
                <AdminNavbar />
                <div className={styles["admin-product-container"]}>
                    <h2>🎫 Quản lý Voucher</h2>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Tổng số voucher</span>
                            <span className={styles.statValue}>{vouchers.length}</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Đang hoạt động</span>
                            <span className={styles.statValue}>{vouchers.filter(v => v.isActive).length}</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Không hoạt động</span>
                            <span className={styles.statValue}>{vouchers.filter(v => !v.isActive).length}</span>
                        </div>
                    </div>
                    <div className={styles["adminHeader"] + " mb-4 d-flex"}>
                        <div className={styles.meNu}>
                            <div className={styles.filters}>
                                <button
                                    className={`${styles.filterBtn} ${statusFilter === "all" ? styles.active : ""}`}
                                    onClick={() => setStatusFilter("all")}
                                >
                                    Tất cả
                                </button>
                                <button
                                    className={`${styles.filterBtn} ${statusFilter === "active" ? styles.active : ""}`}
                                    onClick={() => setStatusFilter("active")}
                                >
                                    Đang hoạt động
                                </button>
                                <button
                                    className={`${styles.filterBtn} ${statusFilter === "inactive" ? styles.active : ""}`}
                                    onClick={() => setStatusFilter("inactive")}
                                >
                                    Ngưng hoạt động
                                </button>
=======
            <Container
                fluid
                className={`content w-100 container-content ${collapsed ? "collapsed-content" : ""
                    }`}
            >
                <AdminNavbar />
                <div className="voucher-container">
                    <div className="voucher-wrapper">
                        <div className="voucher-header">
                            <h1 className="voucher-title">🎫 Quản lý Voucher</h1>
                            <p className="voucher-subtitle">
                                Quản lý và theo dõi các mã khuyến mãi, mã giảm giá
                            </p>
                        </div>

                        <div className="voucher-stats">
                            <div className="voucher-stat-card">
                                <div className="stat-header">
                                    <div>
                                        <div className="stat-label">Tổng số voucher</div>
                                        <div className="stat-value">{vouchers.length}</div>
                                    </div>
                                    <div className="stat-icon">📊</div>
                                </div>
                            </div>

                            <div className="voucher-stat-card">
                                <div className="stat-header">
                                    <div>
                                        <div className="stat-label">Đang hoạt động</div>
                                        <div className="stat-value green">
                                            {vouchers.filter(v => v.isActive).length}
                                        </div>
                                    </div>
                                    <div className="stat-icon green-bg">✅</div>
                                </div>
                            </div>

                            <div className="voucher-stat-card">
                                <div className="stat-header">
                                    <div>
                                        <div className="stat-label">Không hoạt động</div>
                                        <div className="stat-value gray">
                                            {vouchers.filter(v => !v.isActive).length}
                                        </div>
                                    </div>
                                    <div className="stat-icon gray-bg">⏸️</div>
                                </div>
                            </div>
                        </div>

                        <div className="voucher-table-card">
                            <div className="table-header">
                                <h2 className="table-title">🔍 Danh sách voucher</h2>
                                <div className="filter-section">
                                    <span className="filter-label">Lọc theo trạng thái:</span>
                                    <select
                                        className="filter-select"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">Tất cả</option>
                                        <option value="active">Đang hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                    </select>
                                </div>
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
                                <Button style={{ fontWeight: "600" }} onClick={() => setShowAddModal(true)}>
                                    <FontAwesomeIcon icon={faPlus} /> Thêm Voucher
                                </Button>
                            </div>

<<<<<<< HEAD
                            <Form className={styles.fromInput} onSubmit={(e) => e.preventDefault()}>
                                <div className="input-group">
                                    <input
                                        className="form-control search-input"
                                        type="search"
                                        placeholder="Tìm kiếm theo mã..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <button className="btn search-button" type="submit">
                                        <FontAwesomeIcon icon={faSearch} />
                                    </button>
                                </div>
                            </Form>
                        </div>
                    </div>
                    <Table striped bordered hover className={styles.table}>
                        <thead>
                            <tr className="text-center">
                                <th>Mã</th>
                                <th>Giảm giá</th>
                                <th>Giá trị đơn hàng tối thiểu</th>
                                <th>Giảm giá tối đa</th>
                                <th>Mô tả</th>
                                <th>Hết hạn</th>
                                <th>Trạng thái</th>
                                <th>Chức năng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVouchers.map((voucher) => (
                                <tr key={voucher._id} className="text-center">
                                    <td><span >{voucher.code}</span></td>
                                    <td>
                                        💰{" "}
                                        {voucher.discountType === "percentage"
                                            ? `${voucher.discountValue}%`
                                            : `${voucher.discountValue.toLocaleString()}₫`}
                                    </td>
                                    <td>{voucher.minOrderValue.toLocaleString()}đ</td>
                                    <td>{voucher.maxDiscount.toLocaleString()}đ</td>
                                    <td>{voucher.description}</td>
                                    <td>{formatDate(voucher.expiresAt)}</td>
                                    <td>
                                        <span
                                            className={`${styles["status-badge"]} ${voucher.isActive ? styles.active : styles.inactive
                                                }`}
                                        >
                                            {voucher.isActive ? "Đang hoạt động" : "Không hoạt động"}
                                        </span>
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-warning"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => {
                                                setSelectedVoucher(voucher);
                                                setShowUpdateModal(true);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPenToSquare} />
                                        </Button>
                                        {voucher.isActive ? (
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleHideVoucher(voucher._id)}
                                            >
                                                <FontAwesomeIcon icon={faEyeSlash} />
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                onClick={() => handleRestoreVoucher(voucher._id)}
                                            >
                                                <FontAwesomeIcon icon={faRotate} />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {filteredVouchers.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">🎫</div>
                            <p>Không tìm thấy voucher phù hợp.</p>
                        </div>
                    )}

                </div>
            </Container>

            {/* Modal thêm voucher */}
=======
                            <Table className="voucher-table text-center" striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Mã</th>
                                        <th>Giảm giá</th>
                                        <th>Giá trị đơn hàng tối thiểu</th>
                                        <th>Giảm giá tối đa</th>
                                        <th>Mô tả</th>
                                        <th>Hết hạn</th>
                                        <th>Trạng thái</th>
                                        <th>Chức năng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredVouchers.map((voucher) => (
                                        <tr key={voucher._id}>
                                            <td><span className="voucher-code">{voucher.code}</span></td>
                                            <td>
                                                💰{" "}
                                                {voucher.discountType === "percentage"
                                                    ? `${voucher.discountValue}%`
                                                    : `${voucher.discountValue.toLocaleString()}₫`}
                                            </td>
                                            <td>{voucher.minOrderValue.toLocaleString()}đ</td>
                                            <td>{voucher.maxDiscount.toLocaleString()}đ</td>
                                            <td>{voucher.description}</td>
                                            <td>{formatDate(voucher.expiresAt)}</td>
                                            <td>
                                                <span
                                                    className={`status-badge ${voucher.isActive ? "active" : "inactive"
                                                        }`}
                                                >
                                                    {voucher.isActive ? "Đang hoạt động" : "Không hoạt động"}
                                                </span>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => {
                                                        setSelectedVoucher(voucher);
                                                        setShowUpdateModal(true);
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faPenToSquare} />
                                                </Button>

                                                {voucher.isActive ? (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleHideVoucher(voucher._id)}
                                                    >
                                                        <FontAwesomeIcon icon={faEyeSlash} />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => handleRestoreVoucher(voucher._id)}
                                                    >
                                                        🔄
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            {filteredVouchers.length === 0 && (
                                <div className="empty-state">
                                    <div className="empty-icon">🎫</div>
                                    <p>Không tìm thấy voucher phù hợp với bộ lọc đã chọn.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Container>
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
            <VoucherFormModal
                showModal={showAddModal}
                setShowModal={setShowAddModal}
                onAdded={handleVoucherAdded}
            />
<<<<<<< HEAD

            {/* Modal cập nhật voucher */}
=======
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
            {selectedVoucher && (
                <VoucherUpdateModal
                    showModal={showUpdateModal}
                    setShowModal={setShowUpdateModal}
                    voucher={selectedVoucher}
                    onUpdated={handleVoucherUpdated}
                />
            )}
        </div>
<<<<<<< HEAD
=======

>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
    );
}
