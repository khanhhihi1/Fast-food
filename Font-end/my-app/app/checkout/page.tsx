"use client";
import React, { useEffect, useState } from "react";
import {
    Form,
    Button,
    Card,
    Image,
} from "react-bootstrap";
import "./checkout.css";
import { toast } from "react-toastify";

interface TempCartItem {
    productId: string;
    name: string;
    imageUrl: string;
    quantity: number;
    sizeName: string;
    price: number;
    taste: string[];
}

export default function Checkout() {
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        paymentMethod: "momo",
    });

    const [orderItems, setOrderItems] = useState<TempCartItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("tempOrder");
        if (saved) {
            try {
                setOrderItems(JSON.parse(saved));
            } catch {
                console.error("Lỗi khi đọc đơn hàng tạm");
            }
        }
    }, []);

    const total = orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const handleInputChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {

            const response = await fetch("http://localhost:5000/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // nếu bạn dùng token trong cookie
            
                body: JSON.stringify({
                    paymentMethod: formData.paymentMethod,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Đặt hàng thành công");
                localStorage.removeItem("tempOrder");
                setOrderItems([]);
                setFormData({
                    email: "",
                    firstName: "",
                    lastName: "",
                    address: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    paymentMethod: "momo",
                });
            } else {
                toast.error("Lỗi khi đặt hàng" + ":" + " " + data.message)
            }
        } catch (error) {
            alert("Có lỗi xảy ra.");
            console.error("Đặt hàng lỗi:", error);
        }
    };

    return (
        <div className="checkout-container">
            <div className="checkout-header">
                <h1>Thanh toán</h1>
            </div>

            <div className="checkout-content">
                <div className="checkout-form">
                    <Card className="p-4 mb-4">
                        <Form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <h2>Thông tin liên hệ</h2>
                                <Form.Group className="form-group">
                                    <Form.Label htmlFor="email">Địa chỉ Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="ban@example.com"
                                        required
                                    />
                                </Form.Group>
                            </div>

                            <div className="form-section">
                                <h2>Địa chỉ giao hàng</h2>
                                <div className="form-row">
                                    <Form.Group className="form-group">
                                        <Form.Label>Họ</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            placeholder="Nguyễn"
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group className="form-group">
                                        <Form.Label>Tên</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            placeholder="Văn A"
                                            required
                                        />
                                    </Form.Group>
                                </div>

                                <Form.Group className="form-group">
                                    <Form.Label>Địa chỉ</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="123 Đường ABC, Quận XYZ"
                                        required
                                    />
                                </Form.Group>

                                <div className="form-row">
                                    <Form.Group className="form-group">
                                        <Form.Label>Thành phố</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Hà Nội"
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="form-group">
                                        <Form.Label>Tỉnh/Thành</Form.Label>
                                        <Form.Select
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Chọn...</option>
                                            <option value="HN">Hà Nội</option>
                                            <option value="HCM">Hồ Chí Minh</option>
                                            <option value="DN">Đà Nẵng</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="form-group">
                                        <Form.Label>Mã bưu điện</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            placeholder="100000"
                                            required
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="form-section">
                                <h2>Phương thức thanh toán</h2>
                                <Form.Check
                                    type="radio"
                                    label="Thanh toán qua Momo"
                                    name="paymentMethod"
                                    value="momo"
                                    checked={formData.paymentMethod === "momo"}
                                    onChange={handleInputChange}
                                    className="mb-2"
                                />
                                <Form.Check
                                    type="radio"
                                    label="Thanh toán khi nhận hàng"
                                    name="paymentMethod"
                                    value="cod"
                                    checked={formData.paymentMethod === "cod"}
                                    onChange={handleInputChange}
                                    className="mb-4"
                                />
                            </div>

                            <Button type="submit" className="place-order-btn w-100" variant="dark">
                                Đặt hàng - {total.toLocaleString()}₫
                            </Button>
                        </Form>
                    </Card>
                </div>

                <div className="order-summary">
                    <Card className="p-3">
                        <h2>Tóm tắt đơn hàng</h2>
                        <div className="cart-items">
                            {orderItems.map((item, index) => (
                                <div key={index} className="cart-item">
                                    <div className="item-image">
                                        <Image
                                            src={item.imageUrl || "/default-image.png"}
                                            style={{ width: "100px", height: "80px", objectFit: "cover" }}
                                            alt={item.name}
                                        />
                                    </div>
                                    <div className="item-details">
                                        <h3>{item.name}</h3>
                                        <p>Số lượng: {item.quantity}</p>
                                        <p>Kích cỡ: {item.sizeName}</p>
                                        {item.taste?.length > 0 && (
                                            <p>Hương vị: {item.taste.join(", ")}</p>
                                        )}
                                    </div>
                                    <div className="item-price">
                                        {(item.price * item.quantity).toLocaleString()}₫
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="order-totals">
                            <div className="total-row">
                                <span>Tạm tính:</span>
                                <span>{total.toLocaleString()}₫</span>
                            </div>
                            <div className="total-row">
                                <span>Phí vận chuyển:</span>
                                <span>0₫</span>
                            </div>
                            <div className="total-row total-final">
                                <strong>Tổng cộng:</strong>
                                <strong>{total.toLocaleString()}₫</strong>
                            </div>
                        </div>

                        <div className="security-badges">
                            <div className="security-badge">🔒 Thanh toán an toàn</div>
                            <div className="security-badge">✅ Mã hóa SSL</div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
