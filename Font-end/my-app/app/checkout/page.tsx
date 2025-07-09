"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Form,
  Alert,
} from "react-bootstrap";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface CartItem {
  id: string;
  name: string;
  imageUrl: string;
  quantity: number;
  sizeName: string;
  price: number;
  taste?: string[];
}

interface Voucher {
  _id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  expiresAt: string;
  isActive: boolean;
}

export default function Checkout() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalAfterDiscount, setTotalAfterDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const router = useRouter();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const fetchCart = () => {
    const temp = localStorage.getItem("tempOrder");
    if (!temp) return;
    const data = JSON.parse(temp);
    setCartItems(data.items || []);
    setTotalAfterDiscount(data.total || 0);
    if (data.voucherCode) {
      setSelectedCode(data.voucherCode);
    }
  };

  const fetchVouchers = async () => {
    try {
      const res = await fetch("http://localhost:5000/voucher", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.status) setVouchers(data.result);
    } catch (err) {
      console.error(err);
    }
  };

  const applyVoucher = async () => {
    if (!selectedCode) return;

    const selected = vouchers.find((v) => v.code === selectedCode);
    if (!selected) {
      toast.warning("Voucher không tồn tại");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/voucher/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: selected.code,
          orderTotal: total,
        }),
      });

      const data = await res.json();
      if (data.status) {
        setAppliedVoucher(selected);
        setDiscountAmount(data.result.discountAmount);
        setTotalAfterDiscount(data.result.finalTotal);
        toast.success("Áp dụng voucher thành công!");
      } else {
        toast.warning(data.message || "Voucher không hợp lệ");
      }
    } catch (err) {
      toast.error("Lỗi khi áp dụng voucher");
    }
  };

  const handleCancelVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setTotalAfterDiscount(total);
    setSelectedCode("");
  };

  const handleOrder = () => {
    toast.success("Đặt hàng thành công!");
    localStorage.removeItem("tempOrder");

    // Gửi dữ liệu sang backend tại đây nếu cần
    console.log("Phương thức thanh toán:", paymentMethod);

    router.push("/");
  };

  useEffect(() => {
    fetchCart();
    fetchVouchers();
  }, []);

  useEffect(() => {
    if (vouchers.length > 0 && selectedCode) {
      applyVoucher();
    }
  }, [vouchers, selectedCode]);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow p-4">
            <h4 className="mb-4">Thông tin đơn hàng</h4>
            {cartItems.length === 0 ? (
              <Alert variant="warning">
                Không có sản phẩm nào trong đơn hàng
              </Alert>
            ) : (
              <ul>
                {cartItems.map((item) => (
                  <li key={item.id}>
                    {item.name} ({item.sizeName}) - {item.quantity} x{" "}
                    {item.price.toLocaleString()} ₫
                  </li>
                ))}
              </ul>
            )}

            <hr />

            {appliedVoucher ? (
              <Button
                variant="outline-danger"
                className="w-100 mb-3"
                onClick={handleCancelVoucher}
              >
                Hủy mã giảm giá ({appliedVoucher.code})
              </Button>
            ) : (
              <>
                <Form.Label className="mt-2">Chọn mã giảm giá</Form.Label>
                <Form.Select
                  value={selectedCode}
                  onChange={(e) => setSelectedCode(e.target.value)}
                >
                  <option value="">-- Chọn voucher --</option>
                  {vouchers.map((voucher) => (
                    <option key={voucher._id} value={voucher.code}>
                      {voucher.code} - {voucher.description}
                    </option>
                  ))}
                </Form.Select>
              </>
            )}

            <hr />

            <div className="order-summary mt-3">
              <div className="total-row d-flex justify-content-between">
                <span>Tạm tính:</span>
                <span>{total.toLocaleString()} ₫</span>
              </div>

              {discountAmount > 0 && (
                <div className="total-row d-flex justify-content-between text-success">
                  <span>Khuyến mãi:</span>
                  <span>-{discountAmount.toLocaleString()} ₫</span>
                </div>
              )}

              <div className="total-row d-flex justify-content-between">
                <span>Phí vận chuyển:</span>
                <span>0 ₫</span>
              </div>

              <hr />

              <div className="total-row total-final d-flex justify-content-between">
                <strong>Tổng cộng:</strong>
                <strong>{totalAfterDiscount.toLocaleString()} ₫</strong>
              </div>
            </div>

            <Form.Group className="mt-4">
              <Form.Label>Phương thức thanh toán</Form.Label>
              <div>
                <Form.Check
                  className="cursor-pointer"
                  type="radio"
                  label="Thanh toán khi nhận hàng (COD)"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <Form.Check
                  className="cursor-pointer"
                  type="radio"
                  label="Momo"
                  name="paymentMethod"
                  value="momo"
                  checked={paymentMethod === "momo"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <Form.Check
                  className="cursor-pointer"
                  type="radio"
                  label="VNPay"
                  name="paymentMethod"
                  value="vnpay"
                  checked={paymentMethod === "vnpay"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
              </div>
            </Form.Group>

            <Button className="mt-4 w-100" onClick={handleOrder}>
              Xác nhận đặt hàng
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
