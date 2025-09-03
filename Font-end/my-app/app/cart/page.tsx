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
  Modal,
} from "react-bootstrap";
import { useEffect, useState, useCallback } from "react";
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
  maxQuantity?: number;
}

interface Voucher {
  _id: string;
  code: string;
  description: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiresAt: string;
  isActive?: boolean;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [variantModalShow, setVariantModalShow] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  /** ================== FETCH CART ================== */
  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/cart`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!data.status) {
        setCartItems([]);
        throw new Error(data.message || "Không thể tải giỏ hàng");
      }

      const itemsWithProduct = await Promise.all(
        data.result.items.map(async (item: CartItem) => {
          try {
            const productRes = await fetch(
              `${API_URL}/products/${item.productId}`
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
              maxQuantity: productData.quantity,
            };
          } catch {
            return {
              ...item,
              availableSizes: [],
              availableTastes: [],
              fullPrice: { original: item.price },
              maxQuantity: 1,
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
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  /** ================== FETCH VOUCHERS ================== */
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
      } else {
        toast.error(data.message || "Không thể tải danh sách voucher");
      }
    } catch {
      toast.error("Không thể tải danh sách voucher");
    }
  };

  /** ================== UPDATE CART ================== */
  const updateItemLocallyAndSync = async (updatedItem: CartItem) => {
    setCartItems((prev) =>
      prev.map((p) => (p.id === updatedItem.id ? updatedItem : p))
    );

    try {
      const selectedSize = updatedItem.availableSizes?.find(
        (s) => s.name === updatedItem.sizeName
      );
      const price = selectedSize?.price || { original: updatedItem.price };

      const res = await fetch(`${API_URL}/cart/update/${updatedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          quantity: updatedItem.quantity,
          taste: updatedItem.taste || [],
          sizeName: updatedItem.sizeName,
          price,
        }),
      });

      if (!res.ok) throw new Error("Không thể cập nhật sản phẩm");
    } catch {
      toast.error("Không thể cập nhật sản phẩm");
    }
  };

  /** ================== THÊM BIẾN THỂ MỚI ================== */
  const handleAddVariant = (baseItem: CartItem) => {
    // Tạo một bản sao của sản phẩm với số lượng mặc định là 1
    const newVariant = {
      ...baseItem,
      id: `temp-${Date.now()}`,
      quantity: 1,
    };

    // Hiển thị modal để chọn biến thể mới
    setVariantModalShow(true);
    setEditingItem(newVariant);
  };

  /** ================== LƯU BIẾN THỂ MỚI ================== */
  const handleSaveVariant = async (newVariant: CartItem) => {
    try {
      // Kiểm tra xem biến thể đã tồn tại chưa (kiểm tra lại để chắc chắn)
      const exists = cartItems.some(
        (ci) =>
          ci.productId === newVariant.productId &&
          ci.sizeName === newVariant.sizeName &&
          (ci.taste?.[0] || "Không") === (newVariant.taste?.[0] || "Không")
      );

      if (exists) {
        toast.error("Biến thể này đã có trong giỏ hàng");
        return;
      }

      // Lấy thông tin giá đúng từ availableSizes
      const selectedSize = newVariant.availableSizes?.find(
        (s) => s.name === newVariant.sizeName
      );

      if (!selectedSize) {
        toast.error("Không tìm thấy thông tin giá cho kích cỡ này");
        return;
      }

      // Chuẩn bị dữ liệu gửi đến API - định dạng đúng như server mong đợi
      const requestBody = {
        productId: newVariant.productId,
        quantity: newVariant.quantity,
        sizeName: newVariant.sizeName,
        taste: newVariant.taste || [],
        price: selectedSize.price, // Đảm bảo đây là object {original, discount}
      };

      console.log("Gửi dữ liệu đến server:", requestBody);

      // Gọi API để thêm vào giỏ hàng
      const res = await fetch(`${API_URL}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      console.log("Phản hồi từ server:", data);

      if (data.status) {
        // Cập nhật lại giỏ hàng
        await fetchCart();
        toast.success("Đã thêm biến thể mới vào giỏ hàng");
      } else {
        throw new Error(data.message || "Không thể thêm biến thể");
      }
    } catch (error: any) {
      console.error("Chi tiết lỗi:", error);
      toast.error(`Không thể thêm biến thể mới: ${error.message}`);
    }
  };
  /** ================== APPLY VOUCHER ================== */
  const applyVoucher = useCallback(
    async (voucherToApply?: Voucher, showToast: boolean = true) => {
      const voucher = voucherToApply || selectedVoucher;
      if (!voucher) return;

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
          setFinalTotal(data.result.finalTotal);
          setDiscount(data.result.discountAmount);

          if (showToast) {
            toast.success(`Áp dụng voucher ${voucher.code} thành công!`);
          }
        } else {
          if (showToast) {
            toast.warning(data.message || "Không thể áp dụng voucher");
          }
        }
      } catch {
        if (showToast) toast.error("Lỗi khi áp dụng voucher");
      }
    },
    [selectedVoucher, totalPrice, API_URL]
  );

  /** ================== REMOVE ITEM ================== */
  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/cart/remove/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("Xóa sản phẩm thành công");
      } else {
        throw new Error("Không thể xóa sản phẩm");
      }
    } catch (error) {
      toast.error("Không thể xóa sản phẩm");
    }
  };

  /** ================== CHECKOUT ================== */
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.warning("Giỏ hàng trống!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/temp-order`, {
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
        router.push("/checkout");
      } else {
        toast.error(data.message || "Không thể tạo đơn hàng tạm thời");
      }
    } catch {
      toast.error("Lỗi khi tạo đơn hàng tạm thời");
    }
  };

  /** ================== MODAL CHỌN BIẾN THỂ ================== */
  interface VariantModalProps {
    show: boolean;
    handleClose: () => void;
    item: CartItem;
    onSave: (item: CartItem) => void;
  }

  const VariantModal = ({
    show,
    handleClose,
    item,
    onSave,
  }: VariantModalProps) => {
    const [selectedSize, setSelectedSize] = useState(item.sizeName);
    const [selectedTaste, setSelectedTaste] = useState(
      item.taste?.[0] || "Không"
    );
    const [quantity, setQuantity] = useState(1);

    const selectedSizeObj = item.availableSizes?.find(
      (s) => s.name === selectedSize
    );
    const price =
      selectedSizeObj?.price.discount ??
      selectedSizeObj?.price.original ??
      item.price;

    const handleSave = () => {
      // Kiểm tra xem biến thể đã tồn tại chưa
      const exists = cartItems.some(
        (ci) =>
          ci.productId === item.productId &&
          ci.sizeName === selectedSize &&
          (ci.taste?.[0] || "Không") ===
          (selectedTaste === "Không" ? "Không" : selectedTaste)
      );

      if (exists) {
        toast.error("Biến thể này đã có trong giỏ hàng");
        return;
      }

      onSave({
        ...item,
        sizeName: selectedSize,
        taste: selectedTaste === "Không" ? [] : [selectedTaste],
        price,
        quantity,
        fullPrice: selectedSizeObj?.price || item.fullPrice,
      });

      handleClose();
    };

    return (
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm biến thể mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Kích cỡ</Form.Label>
            <Form.Select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              {item.availableSizes?.map((size) => (
                <option key={size.name} value={size.name}>
                  {size.name} -{" "}
                  {size.price.discount
                    ? `${size.price.discount.toLocaleString()} ₫ (Giảm từ ${size.price.original.toLocaleString()} ₫)`
                    : `${size.price.original.toLocaleString()} ₫`}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {item.availableTastes && item.availableTastes.length > 0 && (
            <Form.Group className="mb-3">
              <Form.Label>Hương vị</Form.Label>
              <Form.Select
                value={selectedTaste}
                onChange={(e) => setSelectedTaste(e.target.value)}
              >
                <option value="Không">Không</option>
                {item.availableTastes.map((taste) => (
                  <option key={taste} value={taste}>
                    {taste}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Số lượng</Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={item.maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
            {item.maxQuantity && (
              <Form.Text className="text-muted">
                Số lượng tối đa: {item.maxQuantity}
              </Form.Text>
            )}
          </Form.Group>

          <div className="fw-bold">
            Thành tiền: {(price * quantity).toLocaleString()} ₫
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Thêm vào giỏ
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  /** ================== HOOKS ================== */
  useEffect(() => {
    fetchCart();
    fetchVouchers();
  }, []);

  useEffect(() => {
    if (!isLoading) fetchVouchers();
  }, [cartItems, isLoading]);

  useEffect(() => {
    if (cartItems.length > 0 && selectedVoucher) {
      applyVoucher(selectedVoucher, false);
    } else if (!selectedVoucher) {
      setDiscount(0);
      setFinalTotal(0);
    }
  }, [cartItems, selectedVoucher, applyVoucher]);

  /** ================== RENDER ================== */
  return (
    <ProtectedRoute>
      <Container className="py-5">
        <h2 className="text-center mb-4">Giỏ hàng của bạn</h2>
        {error && <Alert variant="danger">{error}</Alert>}

        {isLoading ? (
          <Alert variant="info">Đang tải giỏ hàng...</Alert>
        ) : cartItems.length === 0 ? (
          <Alert variant="warning">Giỏ hàng của bạn đang trống.</Alert>
        ) : (
          <Row className="justify-content-center">
            {/* ================== Bảng giỏ hàng ================== */}
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
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Image
                            src={`${API_URL}/${item.imageUrl}`}
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
                              let newQty = parseInt(e.target.value) || 1;

                              // Tính tổng số lượng các biến thể của cùng 1 productId
                              const totalForProduct = cartItems.reduce(
                                (sum, ci) => {
                                  if (
                                    ci.productId === item.productId &&
                                    ci.id !== item.id
                                  ) {
                                    return sum + ci.quantity;
                                  }
                                  return sum;
                                },
                                newQty
                              ); // cộng luôn số lượng mới của biến thể hiện tại

                              if (
                                item.maxQuantity &&
                                totalForProduct > item.maxQuantity
                              ) {
                                toast.warning(
                                  `Sản phẩm ${item.name} hiện đang chỉ còn ${item.maxQuantity} sản phẩm`
                                );
                                newQty = Math.max(
                                  1,
                                  item.maxQuantity -
                                  cartItems
                                    .filter(
                                      (ci) =>
                                        ci.productId === item.productId &&
                                        ci.id !== item.id
                                    )
                                    .reduce((sum, ci) => sum + ci.quantity, 0)
                                );
                              }

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

                              // Check trùng biến thể
                              const exists = cartItems.some(
                                (ci) =>
                                  ci.id !== item.id &&
                                  ci.productId === item.productId &&
                                  ci.sizeName === newSize &&
                                  (ci.taste?.[0] || "Không") ===
                                  (item.taste?.[0] || "Không")
                              );

                              if (exists) {
                                toast.error(
                                  "Sản phẩm này đã có trong giỏ hàng"
                                );
                                return;
                              }

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
                                const newTaste = val === "Không" ? [] : [val];

                                // Check trùng biến thể
                                const exists = cartItems.some(
                                  (ci) =>
                                    ci.id !== item.id &&
                                    ci.productId === item.productId &&
                                    ci.sizeName === item.sizeName &&
                                    (ci.taste?.[0] || "Không") ===
                                    (val || "Không")
                                );

                                if (exists) {
                                  toast.error(
                                    "Sản phẩm này đã có trong giỏ hàng"
                                  );
                                  return;
                                }

                                const updated = { ...item, taste: newTaste };
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
                            variant="success"
                            size="sm"
                            className="me-2 mb-2"
                            onClick={() => handleAddVariant(item)}
                          >
                            Thêm biến thể
                          </Button>
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

            {/* ================== Tổng đơn hàng ================== */}
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
                        applyVoucher(found);
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
                        {voucher.code} - {voucher.description}
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

        {/* Modal thêm biến thể */}
        {editingItem && (
          <VariantModal
            show={variantModalShow}
            handleClose={() => setVariantModalShow(false)}
            item={editingItem}
            onSave={handleSaveVariant}
          />
        )}
      </Container>
    </ProtectedRoute>
  );
}