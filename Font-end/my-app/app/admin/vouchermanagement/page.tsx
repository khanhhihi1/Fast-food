"use client";
import React, { useState, useEffect } from "react";
import {
    Container,
    Table,
    Button,
    Form,
} from "react-bootstrap";
import AdminSideBar from "@/app/component/adminSideBar";
import AdminNavbar from "@/app/component/adminNavbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

    const fetchVouchers = async () => {
        try {
            const res = await fetch("http://localhost:5000/voucher");
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

    const handleHideVoucher = async (id: string) => {
        if (!confirm("Bạn có chắc muốn ẩn voucher này?")) return;
        try {
            const res = await fetch(`http://localhost:5000/voucher/${id}/hide`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (data.status) {
                toast.success("Voucher ẩn thành công");
                fetchVouchers();
            } else {
                alert(data.message);
            }
        } catch (error) {
            toast.error("Lỗi khi ẩn voucher");
            console.error("Lỗi khi ẩn voucher:", error);
        }
    };

    const handleVoucherUpdated = (updatedVoucher: Voucher) => {
        setVouchers((prev) =>
            prev.map((v) => (v._id === updatedVoucher._id ? updatedVoucher : v))
        );
        setShowUpdateModal(false);
    };

    const handleVoucherAdded = (newVoucher: Voucher) => {
        setVouchers((prev) => [newVoucher, ...prev]);
        setShowAddModal(false);
    };

    const handleRestoreVoucher = async (id: string) => {
        if (!confirm("Bạn có chắc muốn khôi phục voucher này?")) return;
        try {
            const res = await fetch(`http://localhost:5000/voucher/${id}/restore`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (data.status) {
                toast.success("Voucher khôi phục thành công");
                fetchVouchers();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Lỗi khi khôi phục voucher:", error);
        }
    };

    const filteredVouchers = vouchers.filter((voucher) => {
        if (statusFilter === "active" && !voucher.isActive) return false;
        if (statusFilter === "inactive" && voucher.isActive) return false;

        if (searchTerm.trim() && !voucher.code.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }
        return true;
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
                                <Button style={{ fontWeight: "600" }} onClick={() => setShowAddModal(true)}>
                                    <FontAwesomeIcon icon={faPlus} /> Thêm Voucher
                                </Button>
                            </div>

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
            <VoucherFormModal
                showModal={showAddModal}
                setShowModal={setShowAddModal}
                onAdded={handleVoucherAdded}
            />

            {/* Modal cập nhật voucher */}
            {selectedVoucher && (
                <VoucherUpdateModal
                    showModal={showUpdateModal}
                    setShowModal={setShowUpdateModal}
                    voucher={selectedVoucher}
                    onUpdated={handleVoucherUpdated}
                />
            )}
        </div>
    );
}
