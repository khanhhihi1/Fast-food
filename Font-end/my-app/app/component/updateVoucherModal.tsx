import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { Voucher } from "../type/voucher";


interface Props {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  voucher: Voucher;
  onUpdated: (updated: Voucher) => void;
}

function VoucherUpdateModal({ showModal, setShowModal, voucher, onUpdated }: Props) {
  const [code, setCode] = useState(voucher.code);
  const [description, setDescription] = useState(voucher.description);
  const [discountValue, setDiscountValue] = useState<number>(voucher.discountValue);
  const [discountType, setDiscountType] = useState(voucher.discountType);
  const [minOrderValue, setMinOrderValue] = useState<number>(voucher.minOrderValue);
  const [expiresAt, setExpiresAt] = useState(voucher.expiresAt.split("T")[0]);
  const [maxDiscount, setMaxDiscount] = useState<number>(voucher.maxDiscount);

  useEffect(() => {
    setCode(voucher.code);
    setDescription(voucher.description);
    setDiscountValue(voucher.discountValue);
    setDiscountType(voucher.discountType);
    setMinOrderValue(voucher.minOrderValue);
    setExpiresAt(voucher.expiresAt.split("T")[0]);
    setMaxDiscount(voucher.maxDiscount);
  }, [voucher]);

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
      const response = await fetch(`http://localhost:5000/voucher/update/${voucher._id}`, {
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
    <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title className="modal-title">Cập nhật voucher</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Mã giảm giá</Form.Label>
            <Form.Control
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Loại giảm giá</Form.Label>
            <Form.Select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
            >
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed">Cố định (₫)</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Giá trị giảm</Form.Label>
            <Form.Control
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              min={0}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Giá trị đơn hàng tối thiểu</Form.Label>
            <Form.Control
              type="number"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(Number(e.target.value))}
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
          Cập nhật
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default VoucherUpdateModal;
