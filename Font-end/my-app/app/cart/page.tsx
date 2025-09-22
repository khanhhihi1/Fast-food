"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import ProtectedRoute from "../component/ProtectedRoute";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { Voucher } from "@/app/type/voucher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "../styles/cart.module.css";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

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

/**
 * VariantModal: moved outside main component to avoid export-inside-function and typing issues.
 * Uses styles for its CSS (make sure styles/cartModal.module.css exists).
 */
interface VariantModalProps {
  show: boolean;
  handleClose: () => void;
  item: CartItem;
  onSave: (item: CartItem) => void;
  apiUrl?: string;
}

const VariantModal: React.FC<VariantModalProps> = ({
  show,
  handleClose,
  item,
  onSave,
  apiUrl = "",
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(item.sizeName || "");
  const [selectedTaste, setSelectedTaste] = useState<string>(item.taste?.[0] || "Không");
  const [quantity, setQuantity] = useState<number>(item.quantity || 1);

  useEffect(() => {
    setSelectedSize(item.sizeName || (item.availableSizes?.[0]?.name ?? ""));
    setSelectedTaste(item.taste?.[0] || "Không");
    setQuantity(item.quantity || 1);
  }, [item]);

  const selectedSizeObj = item.availableSizes?.find((s) => s.name === selectedSize);

  const price =
    selectedSizeObj?.price.discount ?? selectedSizeObj?.price.original ?? item.price;

  const handleIncrease = () => {
    // Không check giới hạn ở đây để người dùng có thể tăng/giảm thoải mái
    setQuantity((q) => q + 1);
  };
  const handleDecrease = () => setQuantity((q) => Math.max(1, q - 1));

  const handleSave = () => {
    const priceInfo = selectedSizeObj?.price || item.fullPrice || { original: item.price };

    onSave({
      ...item,
      sizeName: selectedSize,
      taste: selectedTaste === "Không" ? [] : [selectedTaste],
      quantity,
      price: price,
      fullPrice: priceInfo,
    });

    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Điều chỉnh sản phẩm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className={styles.modalRow}>
          <Col xs={4} className={styles.imageCol}>
            <Image
              src={apiUrl ? `${apiUrl}/${item.imageUrl}` : item.imageUrl}
              alt={item.name}
              fluid
              rounded
              className={styles.variantModalImage}
            />
          </Col>

          <Col xs={8} className={styles.formCol}>
            <div className={styles.itemName}>{item.name}</div>

            {/* Kích cỡ */}
            {item.availableSizes && item.availableSizes.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Kích cỡ</Form.Label>
                <div className={styles.sizeOptions}>
                  {item.availableSizes.map((size) => {
                    const label = size.price.discount
                      ? `${size.name} — ${size.price.discount.toLocaleString()} ₫ (Giảm từ ${size.price.original.toLocaleString()} ₫)`
                      : `${size.name} — ${size.price.original.toLocaleString()} ₫`;

                    const isChecked = selectedSize === size.name;

                    return (
                      <div
                        key={size.name}
                        className={`${styles.sizeOption} ${isChecked ? styles.selected : ""}`}
                        onClick={() => setSelectedSize(size.name)}
                        role="button"
                      >
                        <Form.Check
                          type="radio"
                          id={`size-${item.id}-${size.name}`}
                          name={`size-${item.id}`}
                          checked={isChecked}
                          onChange={() => setSelectedSize(size.name)}
                          label={label}
                        />
                      </div>
                    );
                  })}
                </div>
              </Form.Group>
            )}

            {/* Hương vị */}
            {item.availableTastes && item.availableTastes.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Hương vị</Form.Label>
                <div className={styles.tasteOptions}>
                  {item.availableTastes.map((taste) => (
                    <div
                      key={taste}
                      className={`${styles.tasteOption} ${selectedTaste === taste ? styles.selected : ""}`}
                      onClick={() => setSelectedTaste(taste)}
                    >
                      <Form.Check
                        type="radio"
                        id={`taste-${item.id}-${taste}`}
                        name={`taste-${item.id}`}
                        checked={selectedTaste === taste}
                        onChange={() => setSelectedTaste(taste)}
                        label={taste}
                      />
                    </div>
                  ))}
                </div>
              </Form.Group>
            )}

            <div className={styles.quantityRow}>


              <div className={styles.priceSummary}>
                Thành tiền: <strong>{(price * quantity).toLocaleString()} ₫</strong>
              </div>
            </div>

          </Col>
        </Row>
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
  const searchParams = useSearchParams(); // lấy query
  const orderSuccess = searchParams.get("success"); // check ?success=true
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
  /** ================== FETCH VOUCHERS ================== */
  const fetchVouchers = async () => {
    try {
      const res = await fetch(`${API_URL}/voucher`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.status) {
        const now = new Date();

        // Lọc voucher hợp lệ
        const validVouchers = (data.result || [])
          .filter((v: Voucher) => {
            const notExpired = !v.expiresAt || new Date(v.expiresAt) > now;
            const active = v.isActive !== false;
            const enoughOrder = totalPrice >= v.minOrderValue;
            const notUsedUp =
              v.usageLimit === undefined ||
              v.currentUsage === undefined ||
              v.currentUsage < v.usageLimit;

            return notExpired && active && enoughOrder && notUsedUp;
          })
          // Sắp xếp theo giá trị giảm giá (cao → thấp)
          .sort((a: Voucher, b: Voucher) => (b.discountValue || 0) - (a.discountValue || 0));

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
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

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
    }
  };

  /** ================== HOOKS ================== */
  useEffect(() => {
    fetchCart();
    fetchVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading) fetchVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          orderSuccess ? (
            <Alert variant="success">
              Đơn hàng của bạn sẽ được giao thành công trong vòng{" "}
              <strong>30 phút - 2 tiếng <Link style={{ textDecoration: "none" }} href="/account">Xem đơn hàng tại đây</Link></strong>.
              <strong className="text-center"> <Link style={{ textDecoration: "none", color: "red" }} href="/category/all">Tiếp tục mua hàng</Link></strong>.

            </Alert>
          ) : (
            <Alert variant="warning">Giỏ hàng của bạn đang trống.</Alert>
          )
        ) : (
          <Row className="justify-content-center">
            {/* ================== Bảng giỏ hàng ================== */}
            <Col md={8} style={{ position: "relative" }}>
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
                      {item.availableSizes && item.availableSizes.length > 0 && item.sizeName && (
                        <div className={styles.tasteNew}>Cỡ: {item.sizeName}</div>
                      )}

                      {item.availableTastes && item.availableTastes.length > 0 && item.taste?.[0] && (
                        <div className={styles.tasteNew}>Hương vị: {item.taste[0]}</div>
                      )}
                      <div className={styles.itemPrice}>
                        {item.price.toLocaleString()} ₫
                      </div>
                      <div className={styles.priceSummaryTopRight}>
                        <span className={styles.totalSum}>Thành tiền: </span>
                        <span className={styles.itemTotal}>
                          {(item.price * item.quantity).toLocaleString()} ₫
                        </span>
                      </div>
                      {item.maxQuantity !== undefined && (
                        <Form.Text className={styles.quantityMax}>
                         Số lượng: {item.maxQuantity} 
                        </Form.Text>
                      )}
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
                            updateItemLocallyAndSync({
                              ...item,
                              quantity: newQty,
                            });
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
                        <span
                          className={styles.deleteIcon}
                          onClick={() => handleRemove(item.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </span>
                        <span
                          className={styles.choose}
                          onClick={() => handleEditItem(item)}
                        >
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
                                localStorage.setItem(
                                  "selectedVoucher",
                                  JSON.stringify(voucher)
                                );
                                applyVoucher(voucher);
                              }
                            }
                          }}
                        >
                          <Card.Body className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{voucher.code}</h6>
                              <p className="mb-1 text-muted small">
                                {voucher.description}
                              </p>
                              {voucher.expiresAt && (
                                <small className="text-danger">
                                  HSD: {" "}
                                  {new Date(
                                    voucher.expiresAt
                                  ).toLocaleDateString("vi-VN")}
                                </small>
                              )}
                              {voucher.usageLimit && (
                                <small className="d-block">
                                  Đã dùng: {voucher.currentUsage || 0}/
                                  {voucher.usageLimit}
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
                      <strong>Thành tiền:</strong> {finalTotal.toLocaleString()} ₫
                    </p>
                  </>
                )}
                <Button variant="dark" className="w-100" onClick={handleCheckout}>
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
            apiUrl={API_URL}
          />
        )}
      </Container>
    </ProtectedRoute>
  );
}

