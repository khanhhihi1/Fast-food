"use client";

import {
  FaShippingFast,
  FaRegEdit,
  FaTags,
  FaTrashAlt,
  FaMoneyCheckAlt,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Card,
  Row,
  Col,
  Image,
  Table,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { toast } from "react-toastify";

interface CartItem {
  id: string;
  productId: string;
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
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shippingInfo, setShippingInfo] = useState<{
    name: string;
    phone: string;
    address: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Tính tổng tiền trước giảm giá
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Lấy thông tin đơn hàng tạm thời
  const fetchTempOrder = async () => {
    try {
      const res = await fetch("http://localhost:5000/temp-order", {
        credentials: "include",
      });
      const data = await res.json();
      if (!data.status) throw new Error("Không thể tải đơn hàng");

      const { items, total, voucherData, shippingInfo } = data.result;
      setCartItems(items || []);
      setTotalAfterDiscount(total);
      setShippingInfo(shippingInfo);
      if (voucherData) {
        setAppliedVoucher(voucherData);
        setSelectedCode(voucherData.code);
        setDiscountAmount(
          items.reduce(
            (sum: number, item: CartItem) => sum + item.price * item.quantity,
            0
          ) - total
        );
      }
    } catch {
      setError("Không thể tải đơn hàng tạm thời. Vui lòng thử lại.");
      router.push("/cart");
    } finally {
      setIsLoading(false);
    }
  };

  // Lấy danh sách voucher
  const fetchVouchers = async () => {
    try {
      const res = await fetch("http://localhost:5000/voucher", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.status) {
        const now = new Date();
        const validVouchers = (data.result || []).filter((v: Voucher) => {
          const notExpired = !v.expiresAt || new Date(v.expiresAt) > now;
          const active = v.isActive !== false;
          const enoughOrder = totalPrice >= v.minOrderValue;
          return notExpired && active && enoughOrder;
        });
        setVouchers(validVouchers);
      } else {
        toast.error(data.message || "Không thể tải danh sách voucher");
      }
    } catch {
      toast.error("Không thể tải danh sách voucher");
    }
  };

  // Áp dụng voucher
  const applyVoucher = async (voucherParam?: Voucher) => {
    const voucher = voucherParam || vouchers.find((v) => v.code === selectedCode);
    if (!voucher) {
      toast.warning("Vui lòng chọn voucher hợp lệ", { toastId: "voucher-warning" });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/voucher/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: voucher.code,
          orderTotal: total,
        }),
      });

      const data = await res.json();
      if (data.status) {
        setAppliedVoucher(voucher);
        setDiscountAmount(data.result.discountAmount);
        setTotalAfterDiscount(data.result.finalTotal);

        toast.success(`Áp dụng voucher ${voucher.code} thành công!`, {
          toastId: `apply-${voucher.code}`, // ✅ Toast ID duy nhất cho từng voucher
        });

        await fetch("http://localhost:5000/temp-order/update-voucher", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            voucherCode: voucher.code,
            voucherData: voucher,
            total: data.result.finalTotal,
          }),
        });
      } else {
        toast.warning(data.message || "Voucher không hợp lệ", {
          toastId: "voucher-invalid",
        });
        handleCancelVoucher();
      }
    } catch (error) {
      console.error("Lỗi khi áp dụng voucher:", error);
      toast.error("Lỗi khi áp dụng voucher", { toastId: "voucher-error" });
      handleCancelVoucher();
    }
  };


  // Hủy voucher
  const handleCancelVoucher = async () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setTotalAfterDiscount(total);
    setSelectedCode("");
    localStorage.removeItem("selectedVoucher");

    try {
      await fetch("http://localhost:5000/temp-order/update-voucher", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          voucherCode: null,
          voucherData: null,
          total,
        }),
      });
      toast.success("Đã hủy voucher", { toastId: "voucher-cancel" });
    } catch {
      toast.error("Không thể hủy voucher trong đơn hàng tạm thời", {
        toastId: "voucher-cancel-error",
      });
    }
  };


  // Cập nhật phương thức thanh toán
  const updatePaymentMethod = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/temp-order/update-payment",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ paymentMethod }),
        }
      );
      if (!res.ok) {
        throw new Error("Không thể cập nhật phương thức thanh toán");
      }
    } catch {
      toast.error("Không thể cập nhật phương thức thanh toán");
    }
  };

  // Xử lý đặt hàng
  const handleOrder = async () => {
    if (cartItems.length === 0) {
      toast.warning("Không có sản phẩm nào để đặt hàng");
      return;
    }

    if (!shippingInfo) {
      toast.warning("Vui lòng nhập thông tin giao hàng");
      router.push("/shippingInfo");
      return;
    }

    try {
      await updatePaymentMethod();

      const orderRes = await fetch("http://localhost:5000/orders/from-temp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paymentMethod }),
      });

      const orderData = await orderRes.json();
      console.log("orderRes data:", orderData);

      if (!orderRes.ok || !orderData.status) {
        toast.error(orderData.message || "Đặt hàng thất bại");
        return;
      }

      const createdOrder = orderData.result.order;
      if (!createdOrder || !createdOrder._id) {
        toast.error("Dữ liệu đơn hàng không hợp lệ");
        return;
      }

      // Nếu COD → xử lý như cũ
      if (paymentMethod === "cod") {
        await fetch("http://localhost:5000/cart/clear", {
          method: "DELETE",
          credentials: "include",
        });

        await fetch("http://localhost:5000/temp-order", {
          method: "DELETE",
          credentials: "include",
        });

        localStorage.removeItem("selectedVoucher");
        localStorage.removeItem("shippingInfo");

        setCartItems([]);
        setAppliedVoucher(null);
        setSelectedCode("");
        setShippingInfo(null);
        setDiscountAmount(0);
        setTotalAfterDiscount(0);

        toast.success("Đặt hàng thành công!");
        router.push("/cart");
      }

      // Nếu MoMo → redirect sang trang thanh toán MoMo
      if (paymentMethod === "momo") {
        const momoRes = await fetch("http://localhost:5000/payment/momo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ orderId: createdOrder._id }),
        });

        const momoText = await momoRes.text();
        console.log("MoMo response text:", momoText);

        let momoData;
        try {
          momoData = JSON.parse(momoText);
        } catch (err) {
          toast.error("Phản hồi không hợp lệ từ server MoMo");
          return;
        }

        if (momoData.status && momoData.payUrl) {
          window.location.href = momoData.payUrl;
        } else {
          toast.error("Không thể tạo thanh toán MoMo");
        }
      }
    } catch (error) {
      console.error("Lỗi khi xử lý đơn hàng:", error);
      toast.error("Có lỗi xảy ra khi xử lý đơn hàng");
    }
  };

  // Tải dữ liệu khi component mount
  useEffect(() => {
    fetchTempOrder();
    fetchVouchers();

    const shipping = localStorage.getItem("shippingInfo");
    if (shipping) setShippingInfo(JSON.parse(shipping));
    else {
      toast.warning("Bạn chưa nhập thông tin giao hàng");
      router.push("/shippingInfo");
    }
  }, []);

  // Áp dụng voucher tự động khi có selectedCode
  useEffect(() => {
    if (vouchers.length > 0 && selectedCode && !appliedVoucher) {
      const found = vouchers.find((v) => v.code === selectedCode);
      if (found) {
        applyVoucher(found);
      }
    }
  }, [vouchers, selectedCode]);

  return (
    <Container className="py-4">
      <h3 className="text-center mb-4">Thanh toán</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {isLoading ? (
        <Alert variant="info">Đang tải đơn hàng...</Alert>
      ) : cartItems.length === 0 ? (
        <Alert variant="warning">Giỏ hàng của bạn đang trống.</Alert>
      ) : (
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="shadow-sm p-4 mb-4">
              <h5 className="mb-3">
                <FaShippingFast className="me-2" /> Thông tin giao hàng
              </h5>
              <p>
                <strong>Họ tên:</strong> {shippingInfo?.name}
              </p>
              <p>
                <strong>SĐT:</strong> {shippingInfo?.phone}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {shippingInfo?.address}
              </p>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => router.push("/shippingInfo")}
              >
                <FaRegEdit className="me-1" /> Sửa
              </Button>
            </Card>

            <Card className="shadow-sm p-4 mb-4">
              <h5 className="mb-3">
                <FaTags className="me-2" /> Thông tin sản phẩm
              </h5>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên</th>
                    <th>Size</th>
                    <th>Số lượng</th>
                    <th>Giá</th>
                    <th>Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.productId + item.sizeName}>
                      <td>
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={50}
                          height={50}
                          style={{ objectFit: "cover" }}
                          rounded
                        />
                      </td>
                      <td>{item.name}</td>
                      <td>{item.sizeName}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price.toLocaleString()} ₫</td>
                      <td>{(item.price * item.quantity).toLocaleString()} ₫</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {appliedVoucher ? (
                <Alert
                  variant="success"
                  className="d-flex justify-content-between align-items-center mt-3"
                >
                  <span>
                    Voucher đã áp dụng: <strong>{appliedVoucher.code}</strong>{" "}
                    <br />
                    Giảm: {discountAmount.toLocaleString()} ₫
                  </span>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleCancelVoucher}
                  >
                    <FaTrashAlt className="me-1" /> Hủy
                  </Button>
                </Alert>
              ) : (
                <Form.Group className="mt-3">
                  <Form.Label>Chọn mã giảm giá</Form.Label>
                  <Form.Select
                    value={selectedCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setSelectedCode(code);
                      const found = vouchers.find((v) => v.code === code);
                      if (found) applyVoucher(found);
                      else handleCancelVoucher();
                    }}
                  >
                    <option value="">-- Chọn voucher --</option>
                    {vouchers.map((voucher) => (
                      <option key={voucher._id} value={voucher.code}>
                        {voucher.code} - {voucher.description}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
            </Card>

            <Card className="shadow-sm p-4">
              <h5 className="mb-3">
                <FaMoneyCheckAlt className="me-2" /> Phương thức thanh toán
              </h5>
              <Form.Check
                type="radio"
                label="Thanh toán khi nhận hàng (COD)"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="Momo"
                name="paymentMethod"
                value="momo"
                checked={paymentMethod === "momo"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="VNPay"
                name="paymentMethod"
                value="vnpay"
                checked={paymentMethod === "vnpay"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />

              <hr />
              <div className="d-flex justify-content-between">
                <span>Tạm tính:</span>
                <strong>{total.toLocaleString()} ₫</strong>
              </div>
              {discountAmount > 0 && (
                <div className="d-flex justify-content-between text-success">
                  <span>Giảm giá:</span>
                  <strong>-{discountAmount.toLocaleString()} ₫</strong>
                </div>
              )}
              <div className="d-flex justify-content-between">
                <span>Phí vận chuyển:</span>
                <span>0 ₫</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fs-5">
                <strong>Tổng cộng:</strong>
                <strong>{totalAfterDiscount.toLocaleString()} ₫</strong>
              </div>
              <Button className="mt-4 w-100" onClick={handleOrder}>
                Xác nhận đặt hàng
              </Button>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}
