import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";
import './model.css';

interface iShow {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
}

function CategoryFormModal(props: iShow) {
    const { showModal, setShowModal } = props;
    const [name, setName] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const handleSubmit = async () => {
        if (!name || !image) {
            toast.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        if (!image.match(/^https?:\/\/.+/)) {
            toast.error("Hình ảnh phải là URL hợp lệ (bắt đầu bằng http:// hoặc https://)!");
            return;
        }
        const data = {
            name,
            image,
        };

        try {
            const response = await fetch('http://localhost:5000/categories/add', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (!response.ok) {
                console.error("Phản hồi từ server:", result);
                throw new Error(result.message || "Có lỗi xảy ra khi thêm danh mục sản phẩm");
            }

            toast.success("Thêm danh mục sản phẩm thành công!");
            handleClose();
            window.location.reload();
        } catch (error: any) {
            console.error("Lỗi chi tiết khi thêm sản phẩm:", error);
            toast.error(error.message || "Thêm danh mục sản phẩm thất bại");
        }
    };

    const handleClose = () => {
        setName("");
        setImage("");
        setShowModal(false);
    };

    return (
        <>
            <Modal
                show={showModal}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton className="modal-header">
                    <Modal.Title className="modal-title">Thêm sản phẩm mới</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body">
                    <Form>
                        <Form.Group className="mb-3" controlId="formName">
                            <Form.Label className="mt-3 form-label">Tên danh mục sản phẩm</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Tên sản phẩm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Form.Group>


                        <Form.Group className="mb-3" controlId="formImage">
                            <Form.Label className="mt-3 form-label">URL Hình ảnh danh mục</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập URL hình ảnh (http:// hoặc https://)"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modal-footer">
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Thêm sản phẩm
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default CategoryFormModal;