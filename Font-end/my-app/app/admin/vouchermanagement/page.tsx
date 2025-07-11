"use client";
import "./voucher.css";
import "../admin.css";
import React, { useState, useEffect } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Table,
    Button,
    Form,
} from "react-bootstrap";
import AdminSideBar from "@/app/component/adminSideBar";
import AdminNavbar from "@/app/component/adminNavbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
    expiresAt: string;
    isActive: boolean;
}

export default function VoucherPages() {
    const [collapsed, setCollapsed] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

    // Fetch voucher list
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

    // Handle hide voucher
    const handleHideVoucher = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:5000/voucher/${id}/hide`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (data.status) {
                toast.success("Voucher ẩn thành công")
                fetchVouchers();
            } else {
                alert(data.message);
            }
        } catch (error) {
            toast.error("Lỗi khi ẩn voucher")
            console.error("Lỗi khi ẩn voucher:", error);
        }
    };

    // Handle restore voucher
    const handleRestoreVoucher = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:5000/voucher/${id}/restore`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (data.status) {
                toast.success("Voucher khôi phục thành công")
                fetchVouchers();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Lỗi khi khôi phục voucher:", error);
        }
    };

    const filteredVouchers = vouchers.filter((voucher) => {
        if (statusFilter === "all") return true;
        return (voucher.isActive ? "active" : "inactive") === statusFilter;
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
                                <Button style={{ fontWeight: "600" }} onClick={() => setShowAddModal(true)}>
                                    <FontAwesomeIcon icon={faPlus} /> Thêm Voucher
                                </Button>
                            </div>

                            <Table className="voucher-table text-center" striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Mã</th>
                                        <th>Giảm giá</th>
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
            <VoucherFormModal
                showModal={showAddModal}
                setShowModal={setShowAddModal}
            />
            {selectedVoucher && (
                <VoucherUpdateModal
                    showModal={showUpdateModal}
                    setShowModal={setShowUpdateModal}
                    voucher={selectedVoucher}
                />
            )}
        </div>

    );
}
