import { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { Voucher } from "../type/voucher";

interface Props {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  voucher: Voucher;
  onUpdated: (updated: Voucher) => void;
}

function VoucherUpdateModal({ showModal, setShowModal, voucher, onUpdated }: Props) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("percentage");
  const [minOrderValue, setMinOrderValue] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState("");
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [voucherType, setVoucherType] = useState<"timed" | "limited">("timed");
  const [startsAt, setStartsAt] = useState("");
  const [usageLimit, setUsageLimit] = useState<number>(0);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Load voucher khi mở modal
  useEffect(() => {
    if (voucher) {
      setCode(voucher.code);
      setDescription(voucher.description);
      setDiscountValue(voucher.discountValue);
      setDiscountType(voucher.discountType as "fixed" | "percentage");
      setMinOrderValue(voucher.minOrderValue);
      setMaxDiscount(voucher.maxDiscount || 0);
      setVoucherType(voucher.voucherType || "timed");
      setStartsAt(voucher.startsAt ? voucher.startsAt.split("T")[0] : "");
      setExpiresAt(voucher.expiresAt ? voucher.expiresAt.split("T")[0] : "");
      setUsageLimit(voucher.usageLimit || 0);
    }
  }, [voucher]);

  // Auto update mô tả
  useEffect(() => {
    let desc = "";
    if (discountType === "fixed") {
      desc = `Giảm ${discountValue.toLocaleString("vi-VN")}đ cho đơn từ ${minOrderValue.toLocaleString("vi-VN")}đ`;
    } else if (discountType === "percentage") {
      desc = `Giảm ${discountValue}%`;
      if (maxDiscount > 0) {
        desc += ` (tối đa ${maxDiscount.toLocaleString("vi-VN")}đ)`;
      }
      desc += ` cho đơn từ ${minOrderValue.toLocaleString("vi-VN")}đ`;
    }
    setDescription(desc);
  }, [discountType, discountValue, minOrderValue, maxDiscount]);

  const handleSubmit = async () => {
    if (!code || !description || !discountValue || !voucherType) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (voucherType === "timed") {
      if (!expiresAt || new Date(expiresAt) <= new Date(startsAt)) {
        toast.error("Ngày hết hạn phải lớn hơn ngày bắt đầu!");
        return;
      }
    } else if (voucherType === "limited" && (!usageLimit || usageLimit <= 0)) {
      toast.error("Số lượng sử dụng phải lớn hơn 0!");
      return;
    }

    const data = {
      code,
      description,
      discountValue,
      discountType,
      minOrderValue,
      maxDiscount,
      voucherType,
      // startsAt không cho update (backend giữ nguyên)
      expiresAt: voucherType === "timed" ? expiresAt : undefined,
      usageLimit: voucherType === "limited" ? usageLimit : undefined,
    };

    try {
      const response = await fetch(`${API_URL}/voucher/update/${voucher._id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok || !result.status) {
        throw new Error(result.message || "Có lỗi khi cập nhật voucher");
      }

      toast.success("🎉 Cập nhật voucher thành công!");
      onUpdated(result.result || data);
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "❌ Cập nhật voucher thất bại");
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false} size="lg" centered>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title className="modal-title text-dark">Cập nhật voucher</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <Form>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Mã giảm giá</Form.Label>
                <Form.Control
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Loại voucher</Form.Label>
                <Form.Select value={voucherType} onChange={(e) => setVoucherType(e.target.value as "timed" | "limited")}>
                  <option value="timed">Có thời hạn</option>
                  <option value="limited">Có số lượng</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Loại giảm giá</Form.Label>
                <Form.Select value={discountType} onChange={(e) => setDiscountType(e.target.value as "fixed" | "percentage")}>
                  <option value="percentage">Phần trăm (%)</option>
                  <option value="fixed">Cố định (₫)</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Giá trị giảm</Form.Label>
                <Form.Control
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  min={0}
                />
              </Form.Group>
            </Col>

            {discountType === "percentage" && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Giảm giá tối đa</Form.Label>
                  <Form.Control
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    min={0}
                  />
                </Form.Group>
              </Col>
            )}

            <Col md={6}>
              <Form.Group>
                <Form.Label>Giá trị đơn hàng tối thiểu</Form.Label>
                <Form.Control
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  min={0}
                />
              </Form.Group>
            </Col>

            {voucherType === "timed" && (
              <>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Ngày bắt đầu</Form.Label>
                    <Form.Control type="date" value={startsAt} disabled />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Ngày hết hạn</Form.Label>
                    <Form.Control
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </>
            )}

            {voucherType === "limited" && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Số lượng sử dụng tối đa</Form.Label>
                  <Form.Control
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    min={1}
                  />
                </Form.Group>
              </Col>
            )}

            <Col md={12}>
              <Form.Group>
                <Form.Label>Mô tả</Form.Label>
                <Form.Control type="text" value={description} disabled />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer className="modal-footer">
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Cập nhật
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default VoucherUpdateModal;
