import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";

interface iShow {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
}

function ModalsAdmin({ showModal, setShowModal }: iShow) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [quantity, setQuantity] = useState("");
  const [taste, setTaste] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [size, setSize] = useState("Không");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [variantPrices, setVariantPrices] = useState<{ [key: string]: number }>({});
  const [status, setStatus] = useState(true);
  const [categoriesList, setCategoriesList] = useState<{ _id: string; name: string }[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showModal) {
      const fetchCategories = async () => {
        setLoading(true);
        try {
          const response = await fetch("http://localhost:5000/categories");
          const data = await response.json();
          const categoriesData = Array.isArray(data) ? data : data.result;
          setCategoriesList(categoriesData);
        } catch (error: any) {
          toast.error(error.message || "Không thể tải danh mục");
        } finally {
          setLoading(false);
        }
      };
      fetchCategories();
    }
  }, [showModal]);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Tên sản phẩm không được để trống!");
    if (!category) return toast.error("Vui lòng chọn danh mục!");
    if (!image.trim()) return toast.error("Vui lòng nhập URL hình ảnh!");
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) return toast.error("Số lượng phải là số nguyên dương!");
    if (taste.length === 0) return toast.error("Vui lòng nhập ít nhất một hương vị!");

    let sizes = [];

    if (size === "Không") {
      const original = parseFloat(price);
      const d = parseFloat(discount);
      if (!original || original <= 0) return toast.error("Giá gốc phải lớn hơn 0!");
      if (discount && (!d || d < 0 || d >= original))
        return toast.error("Giá khuyến mãi phải nhỏ hơn giá gốc và không âm!");

      sizes = [
        {
          name: "default",
          price: {
            original,
            ...(d > 0 && d < original ? { discount: d } : {}),
          },
        },
      ];
    } else {
      const requiredSizes = ["S", "M", "L"];
      for (const sz of requiredSizes) {
        const original = variantPrices[`${sz}_original`];
        const d = variantPrices[`${sz}_discount`];
        if (!original || original <= 0)
          return toast.error(`Giá gốc cho kích cỡ ${sz} phải lớn hơn 0!`);
        if (d && (d < 0 || d >= original))
          return toast.error(`Giá khuyến mãi của ${sz} phải nhỏ hơn giá gốc và không âm!`);
      }

      sizes = requiredSizes.map((sz) => ({
        name: sz,
        price: {
          original: variantPrices[`${sz}_original`],
          ...(variantPrices[`${sz}_discount`] &&
            variantPrices[`${sz}_discount`] < variantPrices[`${sz}_original`]
              ? { discount: variantPrices[`${sz}_discount`] }
              : {}),
        },
      }));
    }

    const data = {
      name,
      image,
      categoryId: category,
      quantity: qty,
      taste,
      description,
      sizes,
      status,
    };

    try {
      const res = await fetch("http://localhost:5000/products/addProduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message || "Lỗi khi thêm sản phẩm");
      }

      toast.success("Thêm sản phẩm thành công!");
      handleClose();
      window.location.reload();
    } catch (error: any) {
      toast.error("Thêm thất bại: " + (error.message || ""));
    }
  };

  const handleClose = () => {
    setName("");
    setCategory("");
    setImage("");
    setQuantity("");
    setTaste([]);
    setDescription("");
    setPrice("");
    setDiscount("");
    setVariantPrices({});
    setSize("Không");
    setStatus(true);
    setShowModal(false);
  };

  return (
    <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "black" }}>Thêm sản phẩm mới</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label style={{ color: "black" }}>Tên sản phẩm</Form.Label >
            <Form.Control
              type="text"
              placeholder="Nhập tên sản phẩm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label style={{ color: "black" }}>Kích cỡ</Form.Label >
            <Form.Select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="Không">Không</option>
              <option value="Có">Có</option>
            </Form.Select>
          </Form.Group>

          {size === "Không" ? (
            <>
              <Form.Group>
                <Form.Label style={{ color: "black" }}>Giá gốc</Form.Label >
                <Form.Control
                  type="number"
                  placeholder="Nhập giá gốc"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label style={{ color: "black" }}>Giá khuyến mãi (nếu có)</Form.Label >
                <Form.Control
                  type="number"
                  placeholder="Nhập giá khuyến mãi"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </Form.Group>
            </>
          ) : (
            ["S", "M", "L"].map((sz) => (
              <div key={sz}>
                <Form.Group>
                  <Form.Label style={{ color: "black" }}>Giá gốc - {sz}</Form.Label >
                  <Form.Control
                    type="number"
                    placeholder={`Nhập giá gốc cho kích cỡ ${sz}`}
                    value={variantPrices[`${sz}_original`] || ""}
                    onChange={(e) =>
                      setVariantPrices({
                        ...variantPrices,
                        [`${sz}_original`]: Number(e.target.value),
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label style={{ color: "black" }}>Giá khuyến mãi - {sz} (nếu có)</Form.Label >
                  <Form.Control
                    type="number"
                    placeholder={`Nhập giá khuyến mãi cho ${sz}`}
                    value={variantPrices[`${sz}_discount`] || ""}
                    onChange={(e) =>
                      setVariantPrices({
                        ...variantPrices,
                        [`${sz}_discount`]: Number(e.target.value),
                      })
                    }
                  />
                </Form.Group>
              </div>
            ))
          )}

          <Form.Group>
            <Form.Label style={{ color: "black" }}>Danh mục</Form.Label >
            <Form.Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Chọn danh mục --</option>
              {loading && <option>Đang tải...</option>}
              {categoriesList &&
                categoriesList.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label style={{ color: "black" }}>Số lượng</Form.Label >
            <Form.Control
              type="number"
              placeholder="Nhập số lượng"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label style={{ color: "black" }}>Hương vị</Form.Label >
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
                <span key={i} style={{ background: "#007bff", color: "white", padding: "5px 10px", borderRadius: 20 }}>
                  {t}
                  <button
                    onClick={() => setTaste(taste.filter((_, idx) => idx !== i))}
                    style={{ marginLeft: 8, color: "red", background: "none", border: "none" }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </Form.Group>

          <Form.Group>
            <Form.Label style={{ color: "black" }}>URL hình ảnh</Form.Label >
            <Form.Control
              type="text"
              placeholder="Nhập URL hình ảnh"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label style={{ color: "black" }}>Trạng thái</Form.Label >
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
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Thêm sản phẩm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalsAdmin;
