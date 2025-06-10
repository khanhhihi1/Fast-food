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

function ModalsAdmin(props: iShow) {
    const { showModal, setShowModal } = props;
    const [name, setName] = useState<string>("");
    const [categories, setCategories] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [image, setImage] = useState<string>(""); 
    const [quantity, setQuantity] = useState<string>("");
    const [taste, setTaste] = useState<string>("");
    const [size, setSize] = useState<string>("");
    const [categoriesList, setCategoriesList] = useState<{ _id: string; name: string }[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (showModal) {
            const fetchCategories = async () => {
                setLoading(true);
                try {
                    const response = await fetch('http://localhost:5000/categories', {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    if (!response.ok) {
                        throw new Error(`Lỗi khi lấy danh sách danh mục: ${response.status} ${response.statusText}`);
                    }
                    const data = await response.json();
                    if (!data || (!Array.isArray(data) && !Array.isArray(data.result))) {
                        throw new Error("Dữ liệu danh mục không hợp lệ");
                    }
                    const categoriesData = Array.isArray(data) ? data : data.result;
                    setCategoriesList(categoriesData);
                } catch (error: any) {
                    console.error("Lỗi chi tiết khi lấy danh mục:", error);
                    toast.error(error.message || "Không thể tải danh sách danh mục");
                    setCategoriesList([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchCategories();
        }
    }, [showModal]);

    const handleSubmit = async () => {
        if (!name || !price || !categories || !quantity || !taste || !size || !image) {
            toast.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        if (Number(price) <= 0 || Number(quantity) < 0) {
            toast.error("Giá phải lớn hơn 0 và số lượng không được âm!");
            return;
        }
        if (!image.match(/^https?:\/\/.+/)) {
            toast.error("Hình ảnh phải là URL hợp lệ (bắt đầu bằng http:// hoặc https://)!");
            return;
        }
        const data = {
            name,
            price: Number(price), 
            categories,
            quantity: Number(quantity), 
            taste,
            size,
            image
        };

        try {
            const response = await fetch('http://localhost:5000/products/addProduct', {
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
                throw new Error(result.message || "Có lỗi xảy ra khi thêm sản phẩm");
            }

            toast.success("Thêm sản phẩm thành công!");
            handleClose();
            window.location.reload();
        } catch (error: any) {
            console.error("Lỗi chi tiết khi thêm sản phẩm:", error);
            toast.error(error.message || "Thêm sản phẩm thất bại");
        }
    };

    const handleClose = () => {
        setName("");
        setCategories("");
        setPrice("");
        setImage(""); 
        setQuantity("");
        setTaste("");
        setSize("");
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
                            <Form.Label className="mt-3 form-label">Tên sản phẩm</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Tên sản phẩm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formPrice">
                            <Form.Label className="mt-3 form-label">Giá</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Giá"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formCategories">
                            <Form.Label className="mt-3 form-label">Danh mục</Form.Label>
                            <Form.Select
                                value={categories}
                                onChange={(e) => setCategories(e.target.value)}
                                disabled={loading || !categoriesList}
                            >
                                <option value="">-- Chọn danh mục --</option>
                                {loading && <option>Đang tải...</option>}
                                {!loading && categoriesList && categoriesList.length > 0 ? (
                                    categoriesList.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))
                                ) : (
                                    !loading && <option>Không có danh mục</option>
                                )}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formQuantity">
                            <Form.Label className="mt-3 form-label">Số lượng</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Số lượng"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formTaste">
                            <Form.Label className="mt-3 form-label">Hương vị</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Hương vị"
                                value={taste}
                                onChange={(e) => setTaste(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formSize">
                            <Form.Label className="mt-3 form-label">Kích thước</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Kích thước"
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formImage">
                            <Form.Label className="mt-3 form-label">URL Hình ảnh</Form.Label>
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

export default ModalsAdmin;