import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";

interface PostType {
  _id?: string;
  name: string;
  price: number | { [key: string]: number };
  category: string;
  quantity: number;
  image: string;
  taste: string[] | string;
  size: string[];
  description: string;
  status?: boolean;
}

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
  const [variantPrices, setVariantPrices] = useState<{ [key: string]: number }>({});
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [taste, setTaste] = useState<string>("");
  const [size, setSize] = useState<string>("Không");
  const [loading, setLoading] = useState<boolean>(false);
  const [categoriesList, setCategoriesList] = useState<{ _id: string; name: string }[] | null>(null);
  const [tasteOptions, setTasteOptions] = useState<string[]>([]);
  const [sizeOptions, setSizeOptions] = useState<string[]>([]);
useEffect(() => {
        if (showUpdateModal) {
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
    }, [showUpdateModal]);
  useEffect(() => {
    const fetchOptionsFromProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/products");
        if (!res.ok) throw new Error("Không lấy được sản phẩm");

        const data = await res.json();
        const products = Array.isArray(data) ? data : data.result || [];

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
      setID(post._id?.toString() || "");
      setCategory(post.category || "");
      setName(post.name || "");
      setPrice(post.price?.toString() || "");
      setImage(post.image || "");
      setQuantity(post.quantity?.toString() || "");
      setSize("Không");
      setTaste(post.taste?.toString() || "");
      setDescription(post.description || "");
    }
  }, [post]);

  useEffect(() => {
  if (post) {
    setID(post._id?.toString() || "");
    setName(post.name || "");
    setCategory(post.category || "");
    setImage(post.image || "");
    setQuantity(post.quantity?.toString() || "");
    setTaste(Array.isArray(post.taste) ? post.taste.join(", ") : post.taste || "");
    setDescription(post.description || "");

    // 👇 Xử lý giá và size tương ứng
    if (typeof post.price === "number") {
      setPrice(post.price.toString());
      setVariantPrices({});
      setSize("Không");
    } else if (typeof post.price === "object" && post.price !== null) {
      setVariantPrices(post.price);
      setPrice(""); // Xóa giá đơn khi có biến thể
      setSize("Có");
    }
  }
}, [post]);

  const handleSubmit = async () => {
  const productId = id || post?._id;

  if (!productId) {
    toast.error("Không tìm thấy ID sản phẩm để cập nhật!");
    return;
  }

  let finalPrice: number | { [key: string]: number };

  if (size === "Có") {
    const requiredSizes = ["Nhỏ", "Vừa", "Lớn"];
    const missingPrices = requiredSizes.filter(sz => !variantPrices[sz]);
    if (missingPrices.length > 0) {
      toast.error(`Thiếu giá cho kích cỡ: ${missingPrices.join(", ")}`);
      return;
    }
    finalPrice = variantPrices;
  } else {
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Giá phải là số dương!");
      return;
    }
    finalPrice = parsedPrice;
  }

   const updatedPost = {
    name,
    price: finalPrice,
    image,
    category,
    description,
    quantity: parseInt(quantity, 10),
    taste: taste.split(",").map((t) => t.trim()),
    size: size === "Có" ? ["Nhỏ", "Vừa", "Lớn"] : [],
  };


    const url = `http://localhost:5000/products/updateProduct/${productId}`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPost),
      });

      if (!response.ok) {
        throw new Error(`Lỗi khi cập nhật sản phẩm: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      toast.success("Cập nhật sản phẩm thành công!");
      fetchPosts(); // Lấy lại danh sách sản phẩm
      setUpdateModal(false);
    } catch (error: any) {
      toast.error("Cập nhật thất bại: " + (error.message || ""));
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
            <Form.Control
              type="text"
              placeholder="Tên sản phẩm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Form.Label>Kích cỡ</Form.Label>
            <Form.Select
              value={size}
              onChange={(e) => {
                const selected = e.target.value;
                setSize(selected);
              }}
            >
              <option value="Không">Không</option>
              <option value="Có">Có</option>
            </Form.Select>

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

            <Form.Label className="mt-2" style={{ color: "black" }}>Số lượng sản phẩm</Form.Label>
            <Form.Control
              type="number"
              placeholder="Số lượng sản phẩm"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            <Form.Label className="mt-2" style={{ color: "black" }}>Hương vị</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập hương vị (cách nhau bằng dấu phẩy)"
              value={taste}
              onChange={(e) => setTaste(e.target.value)}
            />

            <Form.Label className="mt-2" style={{ color: "black" }}>Mô tả sản phẩm</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="Mô tả sản phẩm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Form.Label className="mt-3 form-label">Danh mục</Form.Label>
            <Form.Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">-- Chọn danh mục --</option>
              {loading && <option>Đang tải...</option>}
              {!loading &&
                categoriesList &&
                categoriesList.length > 0 &&
                categoriesList.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              {!loading && (!categoriesList || categoriesList.length === 0) && (
                <option>Không có danh mục</option>
              )}
            </Form.Select>

            <Form.Label className="mt-2" style={{ color: "black" }}>Image URL</Form.Label>
            <Form.Control
              type="text"
              placeholder="URL hình ảnh sản phẩm"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
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