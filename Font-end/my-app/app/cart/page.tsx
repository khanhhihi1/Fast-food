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
import { Voucher } from "@/app/type/voucher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "../styles/cart.module.css";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

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
  maxAvailable?: number;
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

  /** ================== CALCULATE TOTAL QUANTITY FOR PRODUCT ================== */
  const getTotalQuantityForProduct = (productId: string, excludeItemId?: string) => {
    return cartItems.reduce((total, item) => {
      if (item.productId === productId && item.id !== excludeItemId) {
        return total + item.quantity;
      }
      return total;
    }, 0);
  };

  /** ================== UPDATE CART ================== */
  const updateItemLocallyAndSync = async (updatedItem: CartItem) => {
    const totalOtherQty = getTotalQuantityForProduct(updatedItem.productId, updatedItem.id);
    const maxAvailable = (updatedItem.maxQuantity || 0) - totalOtherQty;

    if (updatedItem.quantity > maxAvailable) {
      toast.error(`Số lượng tối đa có thể đặt là ${maxAvailable}`);
      return;
    }

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
      // Rollback local state if needed
      fetchCart();
    }
  };

  /** ================== EDIT ITEM ================== */
  const handleEditItem = (item: CartItem) => {
    const totalOtherQty = getTotalQuantityForProduct(item.productId, item.id);
    const maxAvailable = (item.maxQuantity || 0) - totalOtherQty;
    setEditingItem({ ...item, maxAvailable });
    setVariantModalShow(true);
  };

  /** ================== SAVE EDITED ITEM ================== */
  const handleSaveEdit = async (updatedItem: CartItem) => {
    try {
      // Kiểm tra xem biến thể mới có trùng với item khác không (không tính chính nó)
      const exists = cartItems.some(
        (ci) =>
          ci.id !== updatedItem.id &&
          ci.productId === updatedItem.productId &&
          ci.sizeName === updatedItem.sizeName &&
          (ci.taste?.[0] || "Không") === (updatedItem.taste?.[0] || "Không")
      );

      if (exists) {
        toast.error("Biến thể này đã có trong giỏ hàng");
        return;
      }

      // Kiểm tra số lượng
      const totalOtherQty = getTotalQuantityForProduct(updatedItem.productId, updatedItem.id);
      const maxAvailable = (updatedItem.maxQuantity || 0) - totalOtherQty;

      if (updatedItem.quantity > maxAvailable) {
        toast.error(`Số lượng tối đa có thể đặt là ${maxAvailable}`);
        return;
      }

      // Lấy thông tin giá đúng từ availableSizes
      const selectedSize = updatedItem.availableSizes?.find(
        (s) => s.name === updatedItem.sizeName
      );

      if (!selectedSize) {
        toast.error("Không tìm thấy thông tin giá cho kích cỡ này");
        return;
      }

      // Chuẩn bị dữ liệu gửi đến API
      const requestBody = {
        quantity: updatedItem.quantity,
        sizeName: updatedItem.sizeName,
        taste: updatedItem.taste || [],
        price: selectedSize.price,
      };

      const res = await fetch(`${API_URL}/cart/update/${updatedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (data.status) {
        // Cập nhật lại giỏ hàng
        await fetchCart();
        toast.success("Đã cập nhật sản phẩm");
      } else {
        throw new Error(data.message || "Không thể cập nhật sản phẩm");
      }
    } catch (error: any) {
      console.error("Chi tiết lỗi:", error);
      toast.error(`Không thể cập nhật sản phẩm: ${error.message}`);
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
      // Trước tiên, gọi API để kiểm tra và trừ số lượng hàng tồn kho cho tất cả sản phẩm
      const buyRes = await fetch(`${API_URL}/products/buyMultiple`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const buyData = await buyRes.json();

      if (!buyData.success) {
        throw new Error(buyData.message || "Không đủ hàng tồn kho cho một số sản phẩm");
      }

      // Nếu trừ thành công, tạo temp-order
      const tempOrderRes = await fetch(`${API_URL}/temp-order`, {
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

      const tempOrderData = await tempOrderRes.json();
      if (tempOrderData.status) {
        router.push("/checkout");
      } else {
        throw new Error(tempOrderData.message || "Không thể tạo đơn hàng tạm thời");
      }
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xử lý đơn hàng");
      // Lưu ý: Vì backend xử lý all-or-nothing, không cần rollback ở đây
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
    const [quantity, setQuantity] = useState(item.quantity);

    const selectedSizeObj = item.availableSizes?.find(
      (s) => s.name === selectedSize
    );
    const price =
      selectedSizeObj?.price.discount ??
      selectedSizeObj?.price.original ??
      item.price;

    const handleSave = () => {
      if (quantity > (item.maxAvailable || 0)) {
        toast.error(`Số lượng tối đa có thể đặt là ${item.maxAvailable}`);
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
          <Modal.Title>Điều chỉnh sản phẩm</Modal.Title>
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
            <div className={styles.quantityWrapper}>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <Form.Control
                type="number"
                value={quantity}
                min={1}
                max={item.maxAvailable}
                className={styles.quantityInput}
                onChange={(e) => {
                  const newQty = parseInt(e.target.value) || 1;
                  if (newQty <= (item.maxAvailable || Infinity)) {
                    setQuantity(newQty);
                  } else {
                    toast.error(`Số lượng tối đa có thể đặt là ${item.maxAvailable}`);
                  }
                }}
              />
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  if (quantity < (item.maxAvailable || Infinity)) {
                    setQuantity(quantity + 1);
                  } else {
                    toast.error(`Số lượng tối đa có thể đặt là ${item.maxAvailable}`);
                  }
                }}
              >
                +
              </Button>
            </div>
            {item.maxAvailable !== undefined && (
              <Form.Text className="text-muted">
                Số lượng tối đa: {item.maxAvailable}
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
            Cập nhật
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
              <div className={styles.cartContainer}>
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.cartItem}>
                    <Image
                      src={`${API_URL}/${item.imageUrl}`}
                      alt={item.name}
                      className={styles.cartImage}
                    />

                    <div className={styles.itemInfo}>
                      <div className={styles.itemTitle}>{item.name}</div>
                      <div className={styles.itemVariant}>
                        {item.sizeName ? `Cỡ ${item.sizeName}` : ""}
                        {item.taste?.[0] ? ` - ${item.taste[0]}` : ""}
                      </div>
                      <div className={styles.itemPrice}>{item.price.toLocaleString()} ₫</div>

                      <div className={styles.quantityWrapper}>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => {
                            const newQty = Math.max(1, item.quantity - 1);
                            updateItemLocallyAndSync({ ...item, quantity: newQty });
                          }}
                        >
                          -
                        </Button>
                        <Form.Control
                          type="number"
                          value={item.quantity}
                          min={1}
                          className={styles.quantityInput}
                          onChange={(e) => {
                            let newQty = parseInt(e.target.value) || 1;
                            updateItemLocallyAndSync({ ...item, quantity: newQty });
                          }}
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => {
                            const newQty = item.quantity + 1;
                            updateItemLocallyAndSync({ ...item, quantity: newQty });
                          }}
                        >
                          +
                        </Button>
                      </div>

                      <div className={styles.actionLinks}>
                        <span className={styles.deleteIcon} onClick={() => handleRemove(item.id)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </span>
                        <span className={styles.choose} onClick={() => handleEditItem(item)}>
                          Điều Chỉnh
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Col>

            {/* ================== Tổng đơn hàng ================== */}
            <Col md={4}>
              <Card className="shadow p-4">
                <h4>Tổng đơn hàng</h4>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Chọn voucher</Form.Label>
                  <div className={styles.voucherList}>
                    {vouchers.length === 0 && (
                      <p className="text-muted">Không có voucher khả dụng</p>
                    )}
                    {vouchers.map((voucher) => {
                      const isExpired = voucher.expiresAt
                        ? new Date(voucher.expiresAt) <= new Date()
                        : false;
                      const isUsedUp =
                        voucher.usageLimit !== undefined &&
                        voucher.currentUsage !== undefined &&
                        voucher.currentUsage >= voucher.usageLimit;

                      const disabled = isExpired || isUsedUp;
                      const isSelected = selectedVoucher?.code === voucher.code;

                      return (
                        <Card
                          key={voucher._id}
                          className={`mb-2 ${styles.voucherCard} ${isSelected ? "selected" : ""
                            } ${disabled ? "disabled" : ""}`}
                          onClick={() => {
                            if (!disabled) {
                              if (isSelected) {
                                setSelectedVoucher(null);
                                localStorage.removeItem("selectedVoucher");
                                setDiscount(0);
                                setFinalTotal(0);
                              } else {
                                setSelectedVoucher(voucher);
                                localStorage.setItem("selectedVoucher", JSON.stringify(voucher));
                                applyVoucher(voucher);
                              }
                            }
                          }}
                        >
                          <Card.Body className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{voucher.code}</h6>
                              <p className="mb-1 text-muted small">{voucher.description}</p>
                              {voucher.expiresAt && (
                                <small className="text-danger">
                                  HSD:{" "}
                                  {new Date(voucher.expiresAt).toLocaleDateString("vi-VN")}
                                </small>
                              )}
                              {voucher.usageLimit && (
                                <small className="d-block">
                                  Đã dùng: {voucher.currentUsage || 0}/{voucher.usageLimit}
                                </small>
                              )}
                            </div>
                            <Button
                              size="sm"
                              className={styles.voucherButton}
                              variant={
                                disabled
                                  ? "secondary"
                                  : isSelected
                                    ? "success"
                                    : "outline-dark"
                              }
                              disabled={disabled}
                            >
                              {disabled
                                ? "Hết hạn"
                                : isSelected
                                  ? "Bỏ chọn"
                                  : "Chọn"}
                            </Button>
                          </Card.Body>
                        </Card>
                      );
                    })}
                  </div>
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

        {/* Modal điều chỉnh sản phẩm */}
        {editingItem && (
          <VariantModal
            show={variantModalShow}
            handleClose={() => setVariantModalShow(false)}
            item={editingItem}
            onSave={handleSaveEdit}
          />
        )}
      </Container>
    </ProtectedRoute>
  );
}