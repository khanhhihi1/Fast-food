"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Container,
  Table,
  Button,
  Row,
  Col,
  Card,
  Image,
  Alert,
  Form,
} from "react-bootstrap";
import { useEffect, useState } from "react";
import ProtectedRoute from "../component/ProtectedRoute";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  categoryId: string;
  image: string;
  description?: string;
  taste?: string[];
  quantity: number;
  status: boolean;
  saleOff?: boolean;
  time?: string;
  view?: number;
  rating?: number;
  sizes: {
    name: string;
    price: {
      original: number;
      discount?: number;
    };
  }[];
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  sizeName: string;
  price: number;
  fullPrice?: {
    original: number;
    discount?: number;
  };
  taste?: string[];
  availableSizes?: {
    name: string;
    price: {
      original: number;
      discount?: number;
    };
  }[];
  availableTastes?: string[];
}

interface Voucher {
  _id: string;
  code: string;
  description: string;
  discountValue: number;
  minOrderValue: number;
  expiresAt: string;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const router = useRouter();

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Lấy giỏ hàng từ server
  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:5000/cart", {
        credentials: "include",
      });
      const data = await res.json();
      if (!data.status) {
        setCartItems([]); // Đặt rỗng nếu không có dữ liệu
        throw new Error(data.message || "Không thể tải giỏ hàng");
      }

      const itemsWithProduct = await Promise.all(
        data.result.items.map(async (item: CartItem) => {
          try {
            const productRes = await fetch(
              `http://localhost:5000/products/${item.productId}`
            );
            const productData: Product = (await productRes.json()).result;
            const selectedSize = productData.sizes?.find(
              (s) => s.name === item.sizeName
            );
            return {
              ...item,
              availableSizes: productData.sizes || [],
              availableTastes: productData.taste || [],
              fullPrice: selectedSize?.price || { original: item.price },
              price:
                selectedSize?.price.discount ??
                selectedSize?.price.original ??
                item.price,
            };
          } catch {
            return {
              ...item,
              availableSizes: [],
              availableTastes: [],
              fullPrice: { original: item.price },
            };
          }
        })
      );
      setCartItems(itemsWithProduct);
    } catch (error) {
      setError(
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message ||
              "Không thể tải giỏ hàng. Vui lòng thử lại."
          : "Không thể tải giỏ hàng. Vui lòng thử lại."
      );
      setCartItems([]); // Đặt rỗng trong trường hợp lỗi
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVouchers = async () => {
    try {
      const res = await fetch("http://localhost:5000/voucher", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.status) {
        setVouchers(data.result || []);
      } else {
        toast.error(data.message || "Không thể tải danh sách voucher");
      }
    } catch {
      toast.error("Không thể tải danh sách voucher");
    }
  };

  const updateItemLocallyAndSync = async (updatedItem: CartItem) => {
    setCartItems((prev) =>
      prev.map((p) => (p.id === updatedItem.id ? updatedItem : p))
    );
    try {
      const selectedSize = updatedItem.availableSizes?.find(
        (s) => s.name === updatedItem.sizeName
      );
      const price = selectedSize?.price || { original: updatedItem.price };
      const res = await fetch(
        `http://localhost:5000/cart/update/${updatedItem.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            quantity: updatedItem.quantity,
            taste: updatedItem.taste || [],
            sizeName: updatedItem.sizeName,
            price,
          }),
        }
      );
      if (!res.ok) {
        throw new Error("Không thể cập nhật sản phẩm");
      }
    } catch {
      toast.error("Không thể cập nhật sản phẩm");
    }
  };

  const applyVoucher = async (voucherToApply?: Voucher) => {
    const voucher = voucherToApply || selectedVoucher;
    if (!voucher) return;

    try {
      const res = await fetch("http://localhost:5000/voucher/apply", {
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
        setFinalTotal(data.result.finalTotal);
        setDiscount(data.result.discountAmount);
        toast.success("Áp dụng voucher thành công");
      } else {
        toast.warning(data.message || "Không thể áp dụng voucher");
      }
    } catch {
      toast.error("Lỗi khi áp dụng voucher");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/cart/remove/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("Xóa sản phẩm thành công");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Không thể xóa sản phẩm");
      }
    } catch (error) {
      const errorMsg =
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message || "Không thể xóa sản phẩm"
          : "Không thể xóa sản phẩm";
      toast.error(errorMsg);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.warning("Giỏ hàng trống!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/temp-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: cartItems,
          total: finalTotal > 0 ? finalTotal : totalPrice,
          voucherCode: selectedVoucher?.code || null,
          voucherData: selectedVoucher || null,
        }),
      });

      const data = await res.json();
      if (data.status) {
        router.push("/shippingInfo");
      } else {
        toast.error(data.message || "Không thể tạo đơn hàng tạm thời");
      }
    } catch {
      toast.error("Lỗi khi tạo đơn hàng tạm thời");
    }
  };

  useEffect(() => {
    fetchCart();
    fetchVouchers();

    const stored = localStorage.getItem("selectedVoucher");
    if (stored) {
      const parsed: Voucher = JSON.parse(stored);
      setSelectedVoucher(parsed);
    }
  }, []);

  useEffect(() => {
    if (cartItems.length > 0 && selectedVoucher) {
      applyVoucher(selectedVoucher);
    }
  }, [cartItems, selectedVoucher]);

  return (
    <ProtectedRoute>
      <Container className="py-5">
        <h2 className="text-center mb-4">Giỏ hàng của bạn</h2>
        <Button variant="primary" onClick={fetchCart} className="mb-3">
          Đồng bộ giỏ hàng
        </Button>
        {error && <Alert variant="danger">{error}</Alert>}
        {isLoading ? (
          <Alert variant="info">Đang tải giỏ hàng...</Alert>
        ) : cartItems.length === 0 ? (
          <Alert variant="warning">Giỏ hàng của bạn đang trống.</Alert>
        ) : (
          <Row className="justify-content-center">
            <Col md={8}>
              <Card className="shadow p-4">
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Hình ảnh</th>
                      <th>Tên</th>
                      <th>Giá</th>
                      <th>Số lượng</th>
                      <th>Kích cỡ</th>
                      <th>Hương vị</th>
                      <th>Thành tiền</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Image
                            src={item.imageUrl || "/default-image.png"}
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                            }}
                            alt={item.name}
                          />
                        </td>
                        <td>{item.name}</td>
                        <td>{item.price.toLocaleString()} ₫</td>
                        <td>
                          <input
                            type="number"
                            value={item.quantity}
                            min={1}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value) || 1;
                              const updated = { ...item, quantity: newQty };
                              updateItemLocallyAndSync(updated);
                            }}
                            style={{ width: "60px" }}
                          />
                        </td>
                        <td>
                          <Form.Select
                            value={item.sizeName}
                            onChange={(e) => {
                              const newSize = e.target.value;
                              const selectedSize = item.availableSizes?.find(
                                (s) => s.name === newSize
                              );
                              const updated = {
                                ...item,
                                sizeName: newSize,
                                price:
                                  selectedSize?.price.discount ??
                                  selectedSize?.price.original ??
                                  item.price,
                                fullPrice:
                                  selectedSize?.price ?? item.fullPrice,
                              };
                              updateItemLocallyAndSync(updated);
                            }}
                          >
                            {item.availableSizes?.map((size) => (
                              <option key={size.name} value={size.name}>
                                {size.name}
                              </option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>
                          {item.availableTastes && (
                            <Form.Select
                              value={item.taste?.[0] || "Không"}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = {
                                  ...item,
                                  taste: val === "Không" ? [] : [val],
                                };
                                updateItemLocallyAndSync(updated);
                              }}
                            >
                              <option value="Không">Không</option>
                              {item.availableTastes.map((taste) => (
                                <option key={taste} value={taste}>
                                  {taste}
                                </option>
                              ))}
                            </Form.Select>
                          )}
                        </td>
                        <td>
                          {(item.price * item.quantity).toLocaleString()} ₫
                        </td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemove(item.id)}
                          >
                            Xóa
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow p-4">
                <h4>Tổng đơn hàng</h4>
                <Form.Group className="mb-3">
                  <Form.Label>Chọn voucher</Form.Label>
                  <Form.Select
                    value={selectedVoucher?.code || ""}
                    onChange={(e) => {
                      const code = e.target.value;
                      const found = vouchers.find((v) => v.code === code);
                      setSelectedVoucher(found || null);
                      if (found) {
                        localStorage.setItem(
                          "selectedVoucher",
                          JSON.stringify(found)
                        );
                        setTimeout(() => applyVoucher(found), 0);
                      } else {
                        localStorage.removeItem("selectedVoucher");
                        setDiscount(0);
                        setFinalTotal(0);
                      }
                    }}
                  >
                    <option value="">-- Chọn voucher --</option>
                    {vouchers.map((voucher) => (
                      <option key={voucher._id} value={voucher.code}>
                        {voucher.code} - Giảm{" "}
                        {voucher.discountValue.toLocaleString()} ₫
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <p>
                  <strong>Tổng giá:</strong> {totalPrice.toLocaleString()} ₫
                </p>
                {discount > 0 && (
                  <>
                    <p>
                      <strong>Giảm giá:</strong> -{discount.toLocaleString()} ₫
                    </p>
                    <p>
                      <strong>Thành tiền:</strong> {finalTotal.toLocaleString()}{" "}
                      ₫
                    </p>
                  </>
                )}
                <Button
                  variant="dark"
                  className="w-100"
                  onClick={handleCheckout}
                >
                  Thanh toán
                </Button>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </ProtectedRoute>
  );
}
