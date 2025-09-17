// Front-end code (updated DashboardPage component)

"use client";

import { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Table,
    Image,
    InputGroup,
    Pagination,
} from "react-bootstrap";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import styles from "../styles/statistics.module.css";
import AdminSideBar from "@/app/component/adminSideBar";
import AdminNavbar from "@/app/component/adminNavbar";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler);

interface OrderItem {
    productId: string;
    name: string;
    image?: string;
    sizeName: string;
    taste: string[];
    quantity: number;
    price: {
        original: number;
        discount?: number;
    };
    finalPrice: number;
}

interface Order {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    items: OrderItem[];
    total: number;
    discount: number;
    voucherCode?: string;
    shippingInfo: {
        name: string;
        phone: string;
        address: string;
    };
    shippingFee: number;
    tax: number;
    paymentMethod: string;
    isPaid: boolean;
    status: number;
    createdAt: string;
}

interface TopProduct {
    name: string;
    revenue: number;
    sold: number;
    orderCount: number;
    image: string;
}

interface TopCustomer {
    name: string;
    spent: number;
    orders: number;
    image: string;
}

interface TopVoucher {
    code: string;
    uses: number;
    savings: number;
}

interface RevenueChart {
    labels: string[];
    data: number[];
}

interface Stats {
    totalRevenue: number;
    revenueChange: string;
    newUsers: number;
    newUsersChange: string;
    cancelledOrders: number;
    cancelledChange: string;
    vouchersUsed: number;
    vouchersChange: string;
    revenueChart: RevenueChart;
    topProducts: TopProduct[];
    topProductsTotal: number;
    slowProducts: TopProduct[];
    slowProductsTotal: number;
    topCustomers: TopCustomer[];
    topVouchers: TopVoucher[];
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({
        totalRevenue: 0,
        revenueChange: "+0%",
        newUsers: 0,
        newUsersChange: "+0%",
        cancelledOrders: 0,
        cancelledChange: "+0%",
        vouchersUsed: 0,
        vouchersChange: "+0%",
        revenueChart: {
            labels: ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"],
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        topProducts: [],
        topProductsTotal: 0,
        slowProducts: [],
        slowProductsTotal: 0,
        topCustomers: [],
        topVouchers: [],
    });
    const [period, setPeriod] = useState("month");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [topPage, setTopPage] = useState(1);
    const [slowPage, setSlowPage] = useState(1);
    const limit = 10; // Số lượng sản phẩm mỗi trang
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        let url = `${API_URL}/statistics/dashboard?period=${period}&topPage=${topPage}&topLimit=${limit}&slowPage=${slowPage}&slowLimit=${limit}`;
        if (period === "custom") {
            if (!startDate || !endDate) return;
            url += `&startDate=${startDate}&endDate=${endDate}`;
        }
        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error("API error: " + res.status);
                return res.json();
            })
            .then((data) => setStats(data))
            .catch((err) => console.error("Error fetching stats:", err));
    }, [period, startDate, endDate, topPage, slowPage]);

    const revenueData = {
        labels: stats.revenueChart.labels,
        datasets: [
            {
                label: "Doanh thu",
                data: stats.revenueChart.data,
                fill: true,
                borderColor: "rgba(59,130,246,1)",
                backgroundColor: "rgba(59,130,246,0.05)",
                tension: 0.4,
                pointBackgroundColor: "rgba(59,130,246,1)",
                pointRadius: 4,
            },
        ],
    };

    const revenueOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#1F2937",
                titleFont: { size: 14, weight: "bold" as const },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: (context: any) =>
                        `₫${(context.parsed.y ?? 0).toLocaleString()}`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (val: any) => `₫${(val ?? 0).toLocaleString()}`,
                },
            },
        },
    };

    // Hàm render phân trang
    const renderPagination = (currentPage: number, total: number, setPage: (page: number) => void) => {
        const totalPages = Math.ceil(total / limit);
        let items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => setPage(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }
        return (
            <Pagination className="justify-content-center mt-3">
                <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                />
                {items}
                <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(currentPage + 1)}
                />
            </Pagination>
        );
    };

    return (
        <div className="d-flex">
            <AdminSideBar />

            <Container fluid className={`${styles.content} container-content`}>
                <AdminNavbar />
                <h2 className={styles["page-title"]}>Thống kê</h2>

                {/* Bộ lọc */}
                <Card className="mb-4 shadow-sm">
                    <Card.Body className="d-flex flex-wrap justify-content-between align-items-center">
                        <h5 className="fw-bold">Bộ lọc thống kê</h5>
                        <Form.Select
                            className="w-auto"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                        >
                            <option value="day">Hôm nay</option>
                            <option value="week">Tuần này</option>
                            <option value="month">Tháng này</option>
                            <option value="year">Năm nay</option>
                            <option value="custom">Tùy chọn</option>
                        </Form.Select>
                        {period === "custom" && (
                            <InputGroup className="mt-2 w-auto">
                                <Form.Control
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <Form.Control
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </InputGroup>
                        )}
                    </Card.Body>
                </Card>

                {/* Thẻ tổng quan */} {/* Giữ nguyên phần này */}

                <Row className="mb-4 g-4">
                    <Col md={6} lg={3}>
                        <Card className={`${styles.cardHover} shadow-sm`}>
                            <Card.Body>
                                <p className="text-muted">Tổng doanh thu</p>
                                <h3 className="fw-bold">
                                    ₫{(stats.totalRevenue ?? 0).toLocaleString()}
                                </h3>
                                <p
                                    className={
                                        stats.revenueChange.startsWith("+")
                                            ? "text-success"
                                            : "text-danger"
                                    }
                                >
                                    {stats.revenueChange} so với kỳ trước
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3}>
                        <Card className={`${styles.cardHover} shadow-sm`}>
                            <Card.Body>
                                <p className="text-muted">Người dùng mới</p>
                                <h3 className="fw-bold">
                                    {(stats.newUsers ?? 0).toLocaleString()}
                                </h3>
                                <p
                                    className={
                                        stats.newUsersChange.startsWith("+")
                                            ? "text-success"
                                            : "text-danger"
                                    }
                                >
                                    {stats.newUsersChange} so với kỳ trước
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3}>
                        <Card className={`${styles.cardHover} shadow-sm`}>
                            <Card.Body>
                                <p className="text-muted">Đơn bị hủy</p>
                                <h3 className="fw-bold">
                                    {(stats.cancelledOrders ?? 0).toLocaleString()}
                                </h3>
                                <p
                                    className={
                                        stats.cancelledChange.startsWith("+")
                                            ? "text-success"
                                            : "text-danger"
                                    }
                                >
                                    {stats.cancelledChange} so với kỳ trước
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3}>
                        <Card className={`${styles.cardHover} shadow-sm`}>
                            <Card.Body>
                                <p className="text-muted">Voucher đã dùng</p>
                                <h3 className="fw-bold">
                                    {(stats.vouchersUsed ?? 0).toLocaleString()}
                                </h3>
                                <p
                                    className={
                                        stats.vouchersChange.startsWith("+")
                                            ? "text-success"
                                            : "text-danger"
                                    }
                                >
                                    {stats.vouchersChange} so với kỳ trước
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Biểu đồ doanh thu */} {/* Giữ nguyên phần này */}

                <Card className={`mb-4 shadow-sm ${styles.cardHover}`}>
                    <Card.Body style={{ height: "300px" }}>
                        <div className="d-flex justify-content-between mb-3">
                            <h5 className="fw-bold">Tổng quan doanh thu</h5>
                            <Button size="sm" variant="outline-primary">
                                Xuất dữ liệu
                            </Button>
                        </div>
                        <Line data={revenueData} options={revenueOptions} />
                    </Card.Body>
                </Card>

                {/* Sản phẩm bán chạy & chậm - cập nhật với orderCount và phân trang */}
                <Row className="mb-4 g-4 mt-3">
                    <Col lg={6}>
                        <Card className={`${styles.cardHover} shadow-sm`}>
                            <Card.Body>
                                <h5 className="fw-bold mb-3">Sản phẩm bán chạy</h5>
                                <Table hover>
                                    <thead>
                                        <tr>
                                            <th>Hình ảnh</th>
                                            <th>Tên sản phẩm</th>
                                            <th className="text-end">Doanh thu / Đã bán / Lượt đơn</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.topProducts.map((product, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <Image src={`${API_URL}/${product.image}`} rounded width={50} />
                                                </td>
                                                <td>{product.name}</td>
                                                <td className="text-end">
                                                    ₫{(product.revenue ?? 0).toLocaleString()} (
                                                    {product.sold ?? 0} đã bán / {product.orderCount ?? 0} lượt đơn)
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                {renderPagination(topPage, stats.topProductsTotal, setTopPage)}
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={6}>
                        <Card className={`${styles.cardHover} shadow-sm`}>
                            <Card.Body>
                                <h5 className="fw-bold mb-3">Sản phẩm bán chậm</h5>
                                <Table hover>
                                    <thead>
                                        <tr>
                                            <th>Hình ảnh</th>
                                            <th>Tên sản phẩm</th>
                                            <th className="text-end">Doanh thu / Đã bán / Lượt đơn</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.slowProducts.map((product, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <Image src={`${API_URL}/${product.image}`} rounded width={50} />
                                                </td>
                                                <td>{product.name}</td>
                                                <td className="text-end">
                                                    ₫{(product.revenue ?? 0).toLocaleString()} (
                                                    {product.sold ?? 0} đã bán / {product.orderCount ?? 0} lượt đơn)
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                {renderPagination(slowPage, stats.slowProductsTotal, setSlowPage)}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Khách hàng & Voucher */} {/* Giữ nguyên phần này */}

                <Row className="mb-4 g-4">
                    <Col lg={6}>
                        <Card className={`${styles.cardHover} shadow-sm`}>
                            <Card.Body>
                                <h5 className="fw-bold mb-3">Khách hàng hàng đầu</h5>
                                <Table hover>
                                    <tbody>
                                        {stats.topCustomers.map((customer, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <Image
                                                        src={customer.image}
                                                        roundedCircle
                                                        width={50}
                                                    />
                                                </td>
                                                <td>{customer.name}</td>
                                                <td className="text-end">
                                                    ₫{(customer.spent ?? 0).toLocaleString()} (
                                                    {customer.orders ?? 0} đơn)
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={6}>
                        <Card className={`${styles.cardHover} shadow-sm`}>
                            <Card.Body>
                                <h5 className="fw-bold mb-3">Voucher nổi bật</h5>
                                <Table hover>
                                    <tbody>
                                        {stats.topVouchers.map((voucher, index) => (
                                            <tr key={index}>
                                                <td>{voucher.code}</td>
                                                <td>{voucher.uses ?? 0} lượt dùng</td>
                                                <td className="text-end">
                                                    ₫{(voucher.savings ?? 0).toLocaleString()} tiết kiệm
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}