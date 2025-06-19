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

    const [name, setName] = useState("");
    const [categories, setCategories] = useState("");
    const [price, setPrice] = useState(""); // Giá đơn nếu không có biến thể
    const [variantPrices, setVariantPrices] = useState<{ [key: string]: number }>({}); // Giá theo biến thể
    const [image, setImage] = useState("");
    const [quantity, setQuantity] = useState("");
    const [taste, setTaste] = useState<string[]>([]);
    const [size, setSize] = useState<string>("Không"); // Mặc định là "Không"
    const [status, setStatus] = useState(true);
    const [description, setDescription] = useState("");

    const [tasteOptions, setTasteOptions] = useState<string[]>([]);
    const [sizeOptions, setSizeOptions] = useState<string[]>([]);
    const [categoriesList, setCategoriesList] = useState<{ _id: string; name: string }[] | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (showModal) {
            const fetchCategories = async () => {
                setLoading(true);
                try {
                    const response = await fetch('http://localhost:5000/categories');
                    const data = await response.json();
                    const tasteSet = new Set<string>();
                    const sizeSet = new Set<string>();
                    const products = Array.isArray(data) ? data : data.result || [];

                    products.forEach((product: any) => {
                        product.taste?.forEach((t: string) => tasteSet.add(t));
                        product.size?.forEach((s: string) => sizeSet.add(s));
                    });

                    setTasteOptions(Array.from(tasteSet));
                    setSizeOptions(Array.from(sizeSet));

                    const categoriesData = Array.isArray(data) ? data : data.result;
                    setCategoriesList(categoriesData);
                } catch (error: any) {
                    console.error("Lỗi khi lấy danh mục:", error);
                    toast.error(error.message || "Không thể tải danh sách danh mục");
                } finally {
                    setLoading(false);
                }
            };
            fetchCategories();
        }
    }, [showModal]);

    const handleSubmit = async () => {
        if (!name || !categories || !quantity || !taste.length || !image) {
            toast.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        const isVariant = size === "Có";

        let finalPrice: number | { [key: string]: number };

        if (isVariant) {
            const requiredSizes = ["Nhỏ", "Vừa", "Lớn"];
            const missingPrices = requiredSizes.filter(sz => !variantPrices[sz]);
            if (missingPrices.length > 0) {
                toast.error(`Thiếu giá cho kích cỡ: ${missingPrices.join(", ")}`);
                return;
            }
            finalPrice = variantPrices;
        } else {
            if (!price || Number(price) <= 0) {
                toast.error("Giá phải lớn hơn 0!");
                return;
            }
            finalPrice = Number(price);
        }

        const data = {
            name,
            price: finalPrice,
            category: categories,
            quantity: Number(quantity),
            taste,
            size: isVariant ? ["Nhỏ", "Vừa", "Lớn"] : [],
            image,
            status,
            description,
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
                throw new Error(result.message || "Có lỗi xảy ra khi thêm sản phẩm");
            }

            toast.success("Thêm sản phẩm thành công!");
            handleClose();
            window.location.reload();
        } catch (error: any) {
            console.error("Lỗi khi thêm sản phẩm:", error);
            toast.error(error.message || "Thêm sản phẩm thất bại");
        }
    };

    const handleClose = () => {
        setName("");
        setCategories("");
        setPrice("");
        setImage("");
        setQuantity("");
        setDescription("");
        setTaste([]);
        setSize("Không");
        setVariantPrices({});
        setStatus(true);
        setShowModal(false);
    };

    return (
        <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Thêm sản phẩm mới</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Tên sản phẩm</Form.Label>
                        <Form.Control type="text" placeholder="Nhập tên sản phẩm" value={name} onChange={(e) => setName(e.target.value)} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Kích cỡ</Form.Label>
                        <Form.Select
                            value={size}
                            onChange={(e) => {
                                const selected = e.target.value;
                                setSize(selected); // Chỉ cho phép chọn một giá trị
                            }}
                        >
                            <option value="Không">Không</option>
                            <option value="Có">Có</option>
                        </Form.Select>
                    </Form.Group>

                    {size === "Không" ? (
                        <Form.Group>
                            <Form.Label>Giá</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Nhập giá sản phẩm"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </Form.Group>
                    ) : (
                        ["Nhỏ", "Vừa", "Lớn"].map((sz) => (
                            <Form.Group key={sz}>
                                <Form.Label>Giá cho kích cỡ {sz}</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Nhập giá sản phẩm"
                                    value={variantPrices[sz] || ""}
                                    onChange={(e) => {
                                        setVariantPrices({
                                            ...variantPrices,
                                            [sz]: Number(e.target.value) || 0,
                                        });
                                    }}
                                />
                            </Form.Group>
                        ))
                    )}

                    <Form.Group>
                        <Form.Label>Danh mục</Form.Label>
                        <Form.Select
                            value={categories}
                            onChange={(e) => setCategories(e.target.value)}
                            disabled={loading || !categoriesList}
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categoriesList?.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Số lượng</Form.Label>
                        <Form.Control
                            placeholder="Nhập số lượng sản phẩm"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Hương vị</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nhập hương vị và nhấn Enter"
                            onKeyDown={(e) => {
                                const value = (e.target as HTMLInputElement).value.trim();
                                if (e.key === "Enter" && value) {
                                    e.preventDefault();
                                    if (!taste.includes(value)) {
                                        setTaste([...taste, value]);
                                    }
                                    (e.target as HTMLInputElement).value = "";
                                }
                            }}
                        />
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: 8 }}>
                            {taste.map((t, i) => (
                                <span key={i} style={{ background: '#007bff', color: 'white', padding: '5px 10px', borderRadius: 20 }}>
                                    {t}
                                    <button
                                        onClick={() => setTaste(taste.filter((_, idx) => idx !== i))}
                                        style={{ marginLeft: 8, color: 'red', background: 'none', border: 'none' }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </Form.Group>



                    <Form.Group>
                        <Form.Label>URL hình ảnh</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nhập URL hình ảnh"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Trạng thái</Form.Label>
                        <Form.Select
                            value={status ? "Đang bán" : "Ngừng bán"}
                            onChange={(e) => setStatus(e.target.value === "Đang bán")}
                        >
                            <option value="Đang bán">Đang bán</option>
                            <option value="Ngừng bán">Ngừng bán</option>
                        </Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Đóng</Button>
                <Button variant="primary" onClick={handleSubmit}>Thêm sản phẩm</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalsAdmin;