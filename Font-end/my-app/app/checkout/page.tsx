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
  ListGroup,
  Badge,
  Modal,
} from "react-bootstrap";
import { toast } from "react-toastify";
import styles from '../styles/introduce.module.css';

// Danh sách quận huyện TP.HCM
const hcmDistricts: string[] = [
  "Quận 1",
  "Quận 3",
  "Quận 5",
  "Quận 7",
  "Quận 8",
  "Quận 10",
  "Bình Thạnh",
  "Gò Vấp",
  "Tân Bình",
  "Tân Phú",
  "Thủ Đức",
  "Hóc Môn",
  "Củ Chi",
  "Bình Chánh",
];

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
  maxDiscount?: number;
  expiresAt: string;
  isActive?: boolean;
}

interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
}

interface User {
  _id: string;
  name: string;
  phone: string;
  addresses: ShippingInfo[]; // 👈 Thay đổi thành mảng addresses
}

export default function Checkout() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalAfterDiscount, setTotalAfterDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Thông tin giao hàng
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null); // 👈 Index địa chỉ được chọn
  const [showNewAddressModal, setShowNewAddressModal] = useState(false); // 👈 Modal cho thêm địa chỉ mới

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Hàm kiểm tra định dạng số điện thoại
  const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  // Hàm xử lý thay đổi số điện thoại
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPhone(value);
    }
  };

  // 👈 Hàm parse address từ user để fill form (giả sử format: "detail, district, TP.HCM")
  const parseAddress = (fullAddress: string) => {
    if (!fullAddress) return { detail: "", district: "" };
    const parts = fullAddress.split(",").map((s) => s.trim());
    return {
      detail: parts[0] || "",
      district: parts[1] || ""
    };
  };

  // 👈 Fetch user profile để lấy thông tin mặc định
  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.status && data.result) {
        setUser(data.result);
        // 👈 Preload địa chỉ mặc định nếu có
        const defaultAddress = data.result.addresses?.find((addr: ShippingInfo) => addr.isDefault);
        if (defaultAddress) {
          setName(defaultAddress.name || data.result.name || "");
          setPhone(defaultAddress.phone || data.result.phone || "");
          const parsed = parseAddress(defaultAddress.address);
          setDetailAddress(parsed.detail);
          setDistrict(parsed.district);
          setSelectedAddressIndex(data.result.addresses.indexOf(defaultAddress));
        } else {
          setName(data.result.name || "");
          setPhone(data.result.phone || "");
        }
      }
    } catch (err) {
      console.error("Lỗi fetch user profile:", err);
    }
  };

  // Hàm xóa giỏ hàng và reset trạng thái
  const clearCart = async () => {
    try {
      await fetch(`${API_URL}/cart/clear`, {
        method: "DELETE",
        credentials: "include",
      });

      await fetch(`${API_URL}/temp-order`, {
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
    } catch (error) {
      console.error("Lỗi khi xóa giỏ hàng:", error);
      toast.error("Lỗi khi xóa giỏ hàng", {
        toastId: "clearCartError",
      });
    }
  };

  // Lấy thông tin đơn hàng tạm thời
  const fetchTempOrder = async () => {
    try {
      const res = await fetch(`${API_URL}/temp-order`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!data.status) throw new Error("Không thể tải đơn hàng");

      const {
        items,
        total,
        voucherData,
        shippingInfo: savedShipping,
      } = data.result;
      setCartItems(items || []);
      setTotalAfterDiscount(total);

      if (savedShipping) {
        setShippingInfo(savedShipping);
        setName(savedShipping.name || "");
        setPhone(savedShipping.phone || "");

        const addressParts =
          savedShipping.address?.split(",").map((s: string) => s.trim()) || [];
        if (addressParts.length >= 2) {
          setDetailAddress(addressParts[0] || "");
          setDistrict(addressParts[1] || "");
        }
        return;
      }
    } catch {
      setError("Không thể tải đơn hàng tạm thời. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Lấy danh sách voucher
  const fetchVouchers = async () => {
    try {
      const res = await fetch(`${API_URL}/voucher`, {
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
      }
    } catch {
      // Không hiển thị lỗi cho voucher
    }
  };

  // Cập nhật thông tin giao hàng
  const updateShippingInfo = async () => {
    if (!name || !phone || !district || !detailAddress) {
      toast.warning("Vui lòng điền đầy đủ thông tin giao hàng", {
        toastId: "shippingInfoWarning",
      });
      return false;
    }

    if (!isValidPhoneNumber(phone)) {
      toast.error("Số điện thoại phải bắt đầu bằng 0 và chỉ chứa 10 chữ số", {
        toastId: "phoneInvalidError",
      });
      return false;
    }

    const fullAddress = `${detailAddress}, ${district}, TP.HCM`;
    const shippingData = { name, phone, address: fullAddress };

    try {
      const res = await fetch(`${API_URL}/temp-order/update-shipping`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(shippingData),
      });

      const data = await res.json();
      if (data.status) {
        setShippingInfo(shippingData);
        localStorage.setItem("shippingInfo", JSON.stringify(shippingData));
        await fetchTempOrder();

        return true;
      } else {
        toast.error(data.message || "Cập nhật địa chỉ giao hàng thất bại", {
          toastId: "updateShippingError",
        });
        return false;
      }
    } catch {
      toast.error("Lỗi khi cập nhật thông tin giao hàng", {
        toastId: "updateShippingError",
      });
      return false;
    }
  };

  // 👈 Hàm chọn địa chỉ từ list
  const handleSelectAddress = (index: number) => {
    const selected = user?.addresses[index];
    if (selected) {
      setSelectedAddressIndex(index);
      setName(selected.name || "");
      setPhone(selected.phone || "");
      const parsed = parseAddress(selected.address);
      setDetailAddress(parsed.detail);
      setDistrict(parsed.district);
    }
  };

  // 👈 Hàm thêm địa chỉ mới và lưu vào user
  const handleAddNewAddress = async () => {
    if (!name || !phone || !district || !detailAddress) {
      toast.warning("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }

    const newAddress = {
      name,
      phone,
      address: `${detailAddress}, ${district}, TP.HCM`
    };

    try {
      const res = await fetch(`${API_URL}/users/update/${user?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ addAddress: newAddress }),
      });

      const data = await res.json();
      if (data.status) {
        setUser(data.result);
        toast.success("Thêm địa chỉ mới thành công!");
        setShowNewAddressModal(false);
        // Chọn địa chỉ mới
        const newIndex = data.result.addresses.length - 1;
        handleSelectAddress(newIndex);
        await updateShippingInfo();
      } else {
        toast.error(data.message || "Thêm địa chỉ thất bại");
      }
    } catch (err) {
      toast.error("Lỗi khi thêm địa chỉ");
    }
  };

  // Áp dụng voucher
  const applyVoucher = async (
    voucherParam?: Voucher,
    showToast: boolean = true
  ) => {
    const voucher =
      voucherParam || vouchers.find((v) => v.code === selectedCode);
    if (!voucher) {
      if (showToast) {
        toast.warning("Vui lòng chọn voucher hợp lệ", {
          toastId: "voucher-warning",
        });
      }
      return;
    }

    try {
      const res = await fetch(`${API_URL}/voucher/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: voucher.code,
          orderTotal: totalPrice,
        }),
      });

      const data = await res.json();
      if (data.status) {
        setAppliedVoucher(voucher);
        setDiscountAmount(data.result.discountAmount);
        setTotalAfterDiscount(data.result.finalTotal);

        if (showToast) {
          toast.success(`Áp dụng voucher ${voucher.code} thành công!`, {
            toastId: `apply-${voucher.code}`,
            autoClose: 5000,
          });
        }

        await fetch(`${API_URL}/temp-order/update-voucher`, {
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
        if (showToast) {
          toast.warning(data.message || "Voucher không hợp lệ", {
            toastId: "voucher-invalid",
            autoClose: 5000,
          });
        }
        handleCancelVoucher();
      }
    } catch (error) {
      console.error("Lỗi khi áp dụng voucher:", error);
      if (showToast) {
        toast.error("Lỗi khi áp dụng voucher", {
          toastId: "voucher-error",
          autoClose: 5000,
        });
      }
      handleCancelVoucher();
    }
  };

  // Hủy voucher
  const handleCancelVoucher = async () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setTotalAfterDiscount(totalPrice);
    setSelectedCode("");
    localStorage.removeItem("selectedVoucher");

    try {
      await fetch(`${API_URL}/temp-order/update-voucher`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          voucherCode: null,
          voucherData: null,
          total: totalPrice,
        }),
      });
    } catch {
      // Không hiển thị lỗi
    }
  };

  // Xử lý voucher change
  const handleVoucherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    toast.dismiss();
    setSelectedCode(code);
    const found = vouchers.find((v) => v.code === code);

    if (found) {
      setTimeout(() => {
        applyVoucher(found, true);
      }, 200);
    } else {
      handleCancelVoucher();
    }
  };

  // Cập nhật phương thức thanh toán
  const updatePaymentMethod = async () => {
    try {
      const res = await fetch(`${API_URL}/temp-order/update-payment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paymentMethod }),
      });
      if (!res.ok) {
        throw new Error("Không thể cập nhật phương thức thanh toán");
      }
    } catch {
      toast.error("Không thể cập nhật phương thức thanh toán", {
        toastId: "updatePaymentError",
      });
    }
  };

  // Xử lý đặt hàng
  const handleOrder = async () => {
    if (cartItems.length === 0) {
      toast.warning("Không có sản phẩm nào để đặt hàng", {
        toastId: "emptyCartWarning",
      });
      return;
    }

    // Kiểm tra và cập nhật thông tin giao hàng trước
    const shippingUpdated = await updateShippingInfo();
    if (!shippingUpdated) return;

    try {
      await updatePaymentMethod();

      const orderRes = await fetch(`${API_URL}/orders/from-temp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paymentMethod }),
      });

      const orderData = await orderRes.json();
      console.log("orderRes data:", orderData);

      if (!orderRes.ok || !orderData.status) {
        toast.error(orderData.message || "Đặt hàng thất bại", {
          toastId: "orderFailureError",
        });
        return;
      }

      const createdOrder = orderData.result.order;
      if (!createdOrder || !createdOrder._id) {
        toast.error("Dữ liệu đơn hàng không hợp lệ", {
          toastId: "invalidOrderError",
        });
        return;
      }

      // Xử lý COD
      if (paymentMethod === "cod") {
        await clearCart();
        toast.success("Đặt hàng thành công!", {
          toastId: "orderSuccess",
        });
        router.push("/cart?success=true");
      }

      // Xử lý MoMo
      if (paymentMethod === "momo") {
        const momoRes = await fetch(`${API_URL}/payment/momo`, {
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
          toast.error("Phản hồi không hợp lệ từ server MoMo", {
            toastId: "momoResponseError",
          });
          return;
        }

        if (momoData.status && momoData.payUrl) {
          window.location.href = momoData.payUrl;
        } else {
          toast.error("Không thể tạo thanh toán MoMo", {
            toastId: "momoPaymentError",
          });
        }
      }

      // Xử lý VNPay
      if (paymentMethod === "vnpay") {
        const vnpayRes = await fetch(`${API_URL}/payment/vnpay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ orderId: createdOrder._id }),
        });

        const vnpayData = await vnpayRes.json();
        console.log("VNPay response:", vnpayData);

        if (vnpayData.status && vnpayData.paymentUrl) {
          window.location.href = vnpayData.paymentUrl;
        } else {
          toast.error("Không thể tạo thanh toán VNPay", {
            toastId: "vnpayPaymentError",
          });
        }
      }

      // Xử lý Stripe
      if (paymentMethod === "stripe") {
        const stripeRes = await fetch(`${API_URL}/payment/stripe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ orderId: createdOrder._id }),
        });

        const stripeData = await stripeRes.json();
        console.log("Stripe response:", stripeData);

        if (stripeData.status && stripeData.checkoutUrl) {
          await clearCart();
          toast.success("Đang chuyển hướng đến thanh toán Stripe...", {
            toastId: "stripeRedirectSuccess",
          });
          window.location.href = stripeData.checkoutUrl;
        } else {
          toast.error("Không thể tạo thanh toán Stripe", {
            toastId: "stripePaymentError",
          });
        }
      }
    } catch (error) {
      console.error("Lỗi khi xử lý đơn hàng:", error);
      toast.error("Có lỗi xảy ra khi xử lý đơn hàng", {
        toastId: "orderProcessingError",
      });
    }
  };

  // Load dữ liệu ban đầu
  useEffect(() => {
    fetchUserProfile(); // 👈 Fetch user profile trước
    fetchTempOrder();
    fetchVouchers();

    const savedShipping = localStorage.getItem("shippingInfo");
    if (savedShipping) {
      const parsed = JSON.parse(savedShipping);
      setName(parsed.name || "");
      setPhone(parsed.phone || "");

      const addressParts =
        parsed.address?.split(",").map((s: string) => s.trim()) || [];
      if (addressParts.length >= 2) {
        setDetailAddress(addressParts[0] || "");
        setDistrict(addressParts[1] || "");
      }
    }
  }, []);

  // 👈 Sau khi fetch user, nếu không có shippingInfo, set từ user
  useEffect(() => {
    if (user && !shippingInfo) { // Chỉ set nếu chưa có shippingInfo
      const defaultAddress = user.addresses?.find((addr: ShippingInfo) => addr.isDefault);
      if (defaultAddress) {
        setName(defaultAddress.name || "");
        setPhone(defaultAddress.phone || "");
        const parsed = parseAddress(defaultAddress.address);
        setDetailAddress(parsed.detail);
        setDistrict(parsed.district);
      }
    }
  }, [user, shippingInfo]);

  // Áp dụng voucher tự động khi có selectedCode
  useEffect(() => {
    if (vouchers.length > 0 && selectedCode && !appliedVoucher) {
      const found = vouchers.find((v) => v.code === selectedCode);
      if (found) {
        applyVoucher(found, false);
      }
    }
  }, [vouchers, selectedCode]);

  // Cập nhật vouchers khi totalPrice thay đổi
  useEffect(() => {
    if (!isLoading) {
      fetchVouchers();
    }
  }, [totalPrice, isLoading]);

  return (
    <Container className="py-4">
      <h3 className="text-center mb-4">Thanh toán</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {isLoading ? (
        <Alert variant="info">Đang tải đơn hàng...</Alert>
      ) : cartItems.length === 0 ? (
        <Alert variant="warning">Giỏ hàng của bạn đang trống.</Alert>
      ) : (
        <Row>
          {/* Bên trái - Thông tin thanh toán */}
          <Col md={8}>
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
                          src={`${API_URL}/${item.imageUrl}`}
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
            </Card>

            {/* Voucher Section */}
            <Card className="shadow-sm p-4 mb-4">
              <h5 className="mb-3">Mã giảm giá</h5>
              {appliedVoucher ? (
                <Alert variant="success">
                  <span>
                    Voucher đã áp dụng: <strong>{appliedVoucher.code}</strong>
                    <br />
                    Giảm: {discountAmount.toLocaleString()} ₫
                  </span>
                </Alert>
              ) : (
                <Form.Group>
                  <Form.Label>Chọn mã giảm giá</Form.Label>
                  <Form.Select
                    value={selectedCode}
                    onChange={handleVoucherChange}
                  >
                    <option value="">-- Chọn voucher --</option>
                    {vouchers.map((voucher) => (
                      <option key={voucher._id} value={voucher.code}>
                        {voucher.code} - {voucher.description} -{" "}
                        {voucher.discountType === "fixed"
                          ? `${voucher.discountValue.toLocaleString()} ₫`
                          : `Giảm tối đa: ${voucher.maxDiscount?.toLocaleString() || 0
                          } ₫`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
            </Card>

            {/* Payment Method */}
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
                className="mb-2"
              />

              <Form.Check
                type="radio"
                label="Stripe (Thẻ tín dụng/ghi nợ)"
                name="paymentMethod"
                value="stripe"
                checked={paymentMethod === "stripe"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            </Card>
          </Col>

          {/* Bên phải - Thông tin giao hàng */}
          <Col md={4}>
            <Card className="shadow-sm p-4 mb-4">
              <h5 className="mb-3">
                <FaShippingFast className="me-2" /> Thông tin giao hàng
              </h5>
              {user?.addresses && user.addresses.length > 0 ? (
                <>
                  <ListGroup className="mb-3">
                    {user.addresses.map((addr, index) => (
                      <ListGroup.Item
                        key={index}
                        action
                        active={selectedAddressIndex === index}
                        onClick={() => handleSelectAddress(index)}
                      >
                        {addr.name} - {addr.phone}<br />
                        {addr.address} {addr.isDefault && <Badge bg="primary">Mặc định</Badge>}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                  <Button
                    variant="outline-primary"
                    className="mb-3 w-100"
                    onClick={() => {
                      setShowNewAddressModal(true);
                      setSelectedAddressIndex(null);
                      setName(  "");
                      setPhone(  "");
                      setDetailAddress("");
                      setDistrict("");
                    }}
                  >
                    Thêm địa chỉ mới
                  </Button>
                </>
              ) : (
                <Alert variant="info">Chưa có địa chỉ nào. Hãy thêm mới.</Alert>
              )}

              {selectedAddressIndex !== null && (
                <Button onClick={updateShippingInfo} className="mt-3 w-100">
                  Sử dụng địa chỉ này
                </Button>
              )}
            </Card>

            {/* Tổng đơn hàng */}
            <Card className="shadow-sm p-4">
              <h5 className="mb-3">Tổng đơn hàng</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Tạm tính:</span>
                <strong>{totalPrice.toLocaleString()} ₫</strong>
              </div>
              {discountAmount > 0 && (
                <div className="d-flex justify-content-between text-success mb-2">
                  <span>Giảm giá:</span>
                  <strong>-{discountAmount.toLocaleString()} ₫</strong>
                </div>
              )}
              <div className="d-flex justify-content-between mb-2">
                <span>Phí vận chuyển:</span>
                <span>0 ₫</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fs-5 mb-3">
                <strong>Tổng cộng:</strong>
                <strong>
                  {(totalAfterDiscount > 0
                    ? totalAfterDiscount
                    : totalPrice
                  ).toLocaleString()}{" "}
                  ₫
                </strong>
              </div>
              <Button className={styles.confirmClick} onClick={handleOrder}
              >
                Xác nhận đặt hàng
              </Button>
            </Card>
          </Col>
        </Row>
      )}

      {/* 👈 Modal cho thêm địa chỉ mới */}
      <Modal show={showNewAddressModal} onHide={() => setShowNewAddressModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thêm địa chỉ mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Họ tên người nhận</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ tên"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="text"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Nhập số điện thoại (bắt đầu bằng 0)"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quận/Huyện (TP.HCM)</Form.Label>
              <Form.Select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              >
                <option value="">-- Chọn Quận/Huyện --</option>
                {hcmDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ chi tiết</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
                placeholder="Nhập địa chỉ chi tiết"
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewAddressModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddNewAddress}>
            Lưu địa chỉ
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}