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
    useEffect(() => {
        if (post) {
            setID(post.id.toString());
            setCategory(post.category || "");
            setName(post.name);
            setPrice(post.price.toString());
            setImage(post.image);
            setDescription(post.description)
        }
    }, [post]);

    const handleSubmit = async () => {
        if (!post) {
            toast.error("Không tìm thấy sản phẩm để cập nhật!");
            return;
        }

        const updatedPost = {
            id: post.id,
            name,
            price: parseFloat(price),
            image,
            category,
            description,
        };

        const url = `http://localhost:9000/Product/${post.id}`;

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

                        <Form.Label className="mt-2" style={{ color: "black" }}>Mô tả sản phẩm</Form.Label>
                        <Form.Control type="text" placeholder="Danh mục sản phẩm" value={description} onChange={(e) => setDescription(e.target.value)} />


                        <Form.Label className="mt-2" style={{ color: "black" }}>Danh mục</Form.Label>
                        <Form.Control type="text" placeholder="Danh mục sản phẩm" value={category} onChange={(e) => setCategory(e.target.value)} />

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
