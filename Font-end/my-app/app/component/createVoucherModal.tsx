import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { toast } from "react-toastify";
import "./model.css";

interface iShow {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  onAdded: (newVoucher: any) => void;
}

function VoucherFormModal(props: iShow) {
  const { showModal, setShowModal, onAdded } = props;
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState("percentage");
  const [minOrderValue, setMinOrderValue] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState("");
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [voucherType, setVoucherType] = useState("timed");
  const [startsAt, setStartsAt] = useState(new Date().toISOString().split("T")[0]);
  const [usageLimit, setUsageLimit] = useState<number>(0);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Auto update description
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

  // Nếu chọn "fixed" thì tự động gán maxDiscount = discountValue
  useEffect(() => {
    if (discountType === "fixed") {
      setMaxDiscount(discountValue);
    }
  }, [discountType, discountValue]);

  const handleSubmit = async () => {
    if (!code || !description || !discountValue || !voucherType) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (voucherType === "timed") {
      if (!startsAt || !expiresAt || new Date(expiresAt) <= new Date(startsAt)) {
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
      startsAt: voucherType === "timed" ? startsAt : undefined,
      expiresAt: voucherType === "timed" ? expiresAt : undefined,
      usageLimit: voucherType === "limited" ? usageLimit : undefined,
    };

    try {
      const response = await fetch(`${API_URL}/voucher/add`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok || !result.status) {
        throw new Error(result.message || "Lỗi khi thêm voucher");
      }

      toast.success("🎉 Thêm voucher thành công!");
      onAdded(result.result || data);
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "❌ Thêm voucher thất bại");
    }
  };

  const handleClose = () => {
    setCode("");
    setDescription("");
    setDiscountValue(0);
    setDiscountType("percentage");
    setMinOrderValue(0);
    setExpiresAt("");
    setMaxDiscount(0);
    setVoucherType("timed");
    setStartsAt(new Date().toISOString().split("T")[0]);
    setUsageLimit(0);
    setShowModal(false);
  };

  return (
    <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false} size="lg" centered>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title className="modal-title text-dark">Thêm voucher mới</Modal.Title>
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
                  placeholder="VD: SAVE20"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Loại voucher</Form.Label>
                <Form.Select value={voucherType} onChange={(e) => setVoucherType(e.target.value)}>
                  <option value="timed">Có thời hạn</option>
                  <option value="limited">Có số lượng</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Loại giảm giá</Form.Label>
                <Form.Select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                  <option value="percentage">Phần trăm (%)</option>
                  <option value="fixed">Giá cố định (₫)</option>
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
                  placeholder="VD: 20 hoặc 50000"
                  min={0}
                />
              </Form.Group>
            </Col>

            {/* Chỉ hiển thị input maxDiscount khi là % */}
            {discountType === "percentage" && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Giảm giá tối đa</Form.Label>
                  <Form.Control
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    placeholder="VD: 100000"
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
                  placeholder="VD: 200000"
                  min={0}
                />
              </Form.Group>
            </Col>

            {voucherType === "timed" && (
              <>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Ngày bắt đầu</Form.Label>
                    <Form.Control type="date" readOnly value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Ngày hết hạn</Form.Label>
                    <Form.Control type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
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
                    placeholder="VD: 100"
                    min={1}
                  />
                </Form.Group>
              </Col>
            )}

            <Col md={12}>
              <Form.Group>
                <Form.Label>Mô tả</Form.Label>
                <Form.Control type="text" value={description} placeholder="Mô tả voucher" disabled />
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
          Thêm voucher
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default VoucherFormModal;
