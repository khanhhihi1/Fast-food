import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
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
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async () => {
    if (!code || !description || !discountValue || !expiresAt) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const data = {
      code,
      description,
      discountValue,
      discountType,
      minOrderValue,
      expiresAt,
      maxDiscount,
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
      onAdded(result.result || data); // Gọi callback
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
    setShowModal(false);
  };

  return (
    <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title className="modal-title">Thêm voucher mới</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Mã giảm giá</Form.Label>
            <Form.Control
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã voucher (VD: SAVE20)"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả voucher"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Loại giảm giá</Form.Label>
            <Form.Select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
            >
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed">Giá cố định (₫)</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Giá trị giảm</Form.Label>
            <Form.Control
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              placeholder="VD: 20 hoặc 50000"
              min={0}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Giá trị đơn hàng tối thiểu</Form.Label>
            <Form.Control
              type="number"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(Number(e.target.value))}
              placeholder="VD: 200000"
              min={0}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Giảm giá tối đa</Form.Label>
            <Form.Control
              type="number"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(Number(e.target.value))}
              placeholder="VD: 100000"
              min={0}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ngày hết hạn</Form.Label>
            <Form.Control
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </Form.Group>
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
