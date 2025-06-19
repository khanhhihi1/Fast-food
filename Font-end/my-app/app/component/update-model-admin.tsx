import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";

interface iShow {
    showUpdateModal: boolean;
    setUpdateModal: (value: boolean) => void;
    post: PostType | null;
    fetchPosts: () => void;
}

function UpdateModelAdmin({ showUpdateModal, setUpdateModal, post, fetchPosts }: iShow) {
    const [id, setID] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [quantity, setQuantity] = useState<string>("");
    const [taste, setTaste] = useState<string[]>([]);
    const [size, setSize] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [categoriesList, setCategoriesList] = useState<{ _id: string; name: string }[] | null>(null);
    const [tasteOptions, setTasteOptions] = useState<string[]>([]);
    const [sizeOptions, setSizeOptions] = useState<string[]>([]);
    useEffect(() => {
        const fetchOptionsFromProducts = async () => {
            try {
                const res = await fetch("http://localhost:5000/products");
                if (!res.ok) throw new Error("Không lấy được sản phẩm");

                const data = await res.json();
                const products = Array.isArray(data) ? data : data.result || [];

                // Lấy tất cả taste và size, sau đó loại bỏ trùng
                const tasteSet = new Set<string>();
                const sizeSet = new Set<string>();

                products.forEach((product: any) => {
                    if (Array.isArray(product.taste)) {
                        product.taste.forEach((t: string) => tasteSet.add(t));
                    }
                    if (Array.isArray(product.size)) {
                        product.size.forEach((s: string) => sizeSet.add(s));
                    }
                });

                setTasteOptions(Array.from(tasteSet));
                setSizeOptions(Array.from(sizeSet));
            } catch (error: any) {
                toast.error("Lỗi khi lấy dữ liệu sản phẩm");
                console.error("Lỗi load taste/size:", error);
            }
        };

        if (showUpdateModal) {
            fetchOptionsFromProducts();
        }
    }, [showUpdateModal]);
    useEffect(() => {
        if (post) {
            console.log("Thông tin post nhận được:", post);
            setID(post._id?.toString());
            setCategory(post.category || "");
            setName(post.name);
            setPrice(post.price?.toString());
            setImage(post.image);
            setQuantity(post.quantity);
            setSize(post.size)
            setTaste(post.taste)
            setDescription(post.description)
        }
    }, [post]);
    useEffect(() => {
        if (showUpdateModal) {
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
    }, [showUpdateModal]);
    const handleSubmit = async () => {
        const productId = id || post?.id;

        if (!productId) {
            toast.error("Không tìm thấy ID sản phẩm để cập nhật!");
            return;
        }

        const updatedPost = {
            name,
            price: parseFloat(price),
            image,
            categories: category,
            description,
            quantity,
            size,
            taste,
        };

        const url = `http://localhost:5000/products/updateProduct/${productId}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedPost),
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi cập nhật sản phẩm: ${response.status} - ${response.statusText}`);
            }

            toast.success("Cập nhật sản phẩm thành công!");
            fetchPosts();
            setUpdateModal(false);
        } catch (error) {
            toast.error("Cập nhật thất bại");
            console.error("Lỗi cập nhật sản phẩm:", error);
        }
    };

    const handleClose = () => {
        setUpdateModal(false);
    };

    return (
        <Modal show={showUpdateModal} onHide={handleClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title style={{ color: "black" }}>Cập nhật sản phẩm</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ color: "black" }}>ID</Form.Label>
                        <Form.Control type="text" value={id} readOnly />

                        <Form.Label style={{ color: "black" }}>Tên sản phẩm</Form.Label>
                        <Form.Control type="text" placeholder="Tên sản phẩm" value={name} onChange={(e) => setName(e.target.value)} />

                        <Form.Label className="mt-2" style={{ color: "black" }}>Giá sản phẩm</Form.Label>
                        <Form.Control type="text" placeholder="Giá sản phẩm" value={price} onChange={(e) => setPrice(e.target.value)} />

                        <Form.Label className="mt-2" style={{ color: "black" }}>Số lượng sản phẩm</Form.Label>
                        <Form.Control type="text" placeholder="Giá sản phẩm" value={quantity} onChange={(e) => setQuantity(e.target.value)} />

                        <Form.Label className="mt-3 form-label">Hương vị</Form.Label>
                        <Form.Select
                            value={taste[0] || ""}
                            onChange={(e) => setTaste([e.target.value])}
                            disabled={loading || !tasteOptions}
                        >
                            <option value="">-- Chọn hương vị --</option>
                            {loading && <option>Đang tải...</option>}
                            {!loading && tasteOptions && tasteOptions.length > 0 ? (
                                tasteOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))
                            ) : (
                                !loading && <option>Không có hương vị</option>
                            )}
                        </Form.Select>


                        <Form.Label className="mt-3 form-label">Kích cỡ</Form.Label>
                        <Form.Select
                            value={size[0] || ""}
                            onChange={(e) => setSize([e.target.value])} 
                            disabled={loading || !sizeOptions}
                        >
                            <option value="">-- Chọn kích cỡ --</option>
                            {loading && <option>Đang tải...</option>}
                            {!loading && sizeOptions && sizeOptions.length > 0 ? (
                                sizeOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))
                            ) : (
                                !loading && <option>Không có kích cỡ</option>
                            )}
                        </Form.Select>


                        <Form.Label className="mt-2" style={{ color: "black" }}>Mô tả sản phẩm</Form.Label>
                        <Form.Control type="text" placeholder="Danh mục sản phẩm" value={description} onChange={(e) => setDescription(e.target.value)} />


                        <Form.Label className="mt-3 form-label">Danh mục</Form.Label>
                        <Form.Select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
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

                        <Form.Label className="mt-2" style={{ color: "black" }}>Image URL</Form.Label>
                        <Form.Control type="text" placeholder="URL hình ảnh sản phẩm" value={image} onChange={(e) => setImage(e.target.value)} />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Đóng</Button>
                <Button variant="primary" onClick={handleSubmit}>Cập nhật sản phẩm</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default UpdateModelAdmin;
