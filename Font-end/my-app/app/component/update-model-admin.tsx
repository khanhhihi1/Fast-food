"use client";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";
import "./model.css";
import { PostType } from "../type/type";
import { Col, Row } from "react-bootstrap";
import React from "react";

interface iShow {
  showUpdateModal: boolean;
  setUpdateModal: (value: boolean) => void;
  post: PostType | null;
  fetchPosts: () => void;
}

function UpdateModelAdmin({
  showUpdateModal,
  setUpdateModal,
  post,
  fetchPosts,
}: iShow) {
  const [id, setID] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [quantity, setQuantity] = useState<string>(""); // tồn kho
  const [taste, setTaste] = useState<string[]>([]);
  const [size, setSize] = useState<string>("Không");
  const [price, setPrice] = useState<string>("");
  const [discount, setDiscount] = useState<string>("");
  const [variantPrices, setVariantPrices] = useState<{ [key: string]: number }>({});
  const [status, setStatus] = useState<boolean>(true);
  const [productType, setProductType] = useState<string>("Tồn kho"); // Dropdown
  const [dailyInitialQuantity, setDailyInitialQuantity] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [categoriesList, setCategoriesList] = useState<{ _id: string; name: string }[] | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Load categories
  useEffect(() => {
    if (showUpdateModal) {
      const fetchCategories = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${API_URL}/categories`);
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
  }, [showUpdateModal]);

  // Load dữ liệu sản phẩm để update
 // Load dữ liệu sản phẩm để update
useEffect(() => {
  if (post) {
    setID(post._id?.toString() || "");
    setName(post.name || "");
    setDescription(post.description || "");
    setImagePreview(post.image || "");
    setImageFile(null);
    setTaste(Array.isArray(post.taste) ? post.taste : []);
    setStatus(post.status ?? true);

    // Gán danh mục (ưu tiên _id trong object category)
    if (typeof post.category === "object" && post.category?._id) {
      setCategory(post.category._id.toString());
    } else if ((post as any).categoryId) {
      setCategory((post as any).categoryId.toString());
    } else if (typeof post.category === "string") {
      setCategory(post.category);
    } else {
      setCategory("");
    }

    // Xác định loại sản phẩm
    if (post.isDaily) {
      setProductType("Theo ngày");
      setDailyInitialQuantity(post.dailyInitialQuantity ?? 0);
      setQuantity(""); // reset tồn kho
    } else {
      setProductType("Tồn kho");
      setQuantity(post.quantity?.toString() || "");
      setDailyInitialQuantity(0);
    }

    // Sizes
    if (post.sizes?.length === 1 && post.sizes[0].name === "default") {
      setSize("Không");
      setPrice(post.sizes[0].price.original.toString());
      setDiscount(post.sizes[0].price.discount?.toString() || "");
    } else if (post.sizes?.length > 0) {
      setSize("Có");
      const variantMap: { [key: string]: number } = {};
      post.sizes.forEach((sz) => {
        variantMap[`${sz.name}_original`] = sz.price.original;
        if (sz.price.discount != null) {
          variantMap[`${sz.name}_discount`] = sz.price.discount;
        }
      });
      setVariantPrices(variantMap);
    }
  }
}, [post]);

  const handleSubmit = async () => {
    if (!id) {
      toast.error("Không tìm thấy ID sản phẩm để cập nhật!");
      return;
    }

    let sizes: PostType["sizes"] = [];

    if (size === "Không") {
      const parsedPrice = parseFloat(price);
      const parsedDiscount = parseFloat(discount);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        toast.error("Giá phải là số dương!");
        return;
      }
      sizes = [
        {
          name: "default",
          price: {
            original: parsedPrice,
            ...(discount &&
              !isNaN(parsedDiscount) &&
              parsedDiscount > 0 &&
              parsedDiscount < parsedPrice && { discount: parsedDiscount }),
          },
        },
      ];
    } else {
      const requiredSizes = ["S", "M", "L"];
      for (const sz of requiredSizes) {
        if (!variantPrices[`${sz}_original`] || variantPrices[`${sz}_original`] <= 0) {
          toast.error(`Giá gốc cho kích cỡ ${sz} phải lớn hơn 0`);
          return;
        }
        if (
          variantPrices[`${sz}_discount`] &&
          (variantPrices[`${sz}_discount`] < 0 ||
            variantPrices[`${sz}_discount`] >= variantPrices[`${sz}_original`])
        ) {
          toast.error(`Giá khuyến mãi của ${sz} phải nhỏ hơn giá gốc và không âm`);
          return;
        }
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

    const formData = new FormData();
    formData.append("name", name);
    formData.append("categoryId", category);
    formData.append("description", description);
    formData.append("taste", JSON.stringify(taste));
    formData.append("sizes", JSON.stringify(sizes));
    formData.append("status", status.toString());

    if (productType === "Tồn kho") {
      formData.append("quantity", quantity);
      formData.append("isDaily", "false");
    } else {
      formData.append("isDaily", "true");
      formData.append("dailyInitialQuantity", dailyInitialQuantity.toString());
    }

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await fetch(`${API_URL}/products/updateProduct/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Lỗi khi cập nhật sản phẩm");
      }

      toast.success("Cập nhật sản phẩm thành công!");
      fetchPosts();
      setUpdateModal(false);
    } catch (error: any) {
      toast.error("Cập nhật thất bại: " + (error.message || ""));
    }
  };

  return (
    <Modal show={showUpdateModal} onHide={() => setUpdateModal(false)} backdrop="static" keyboard={false} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "black" }}>Cập nhật sản phẩm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="g-3">
            {/* Tên sản phẩm */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>Tên sản phẩm</Form.Label>
                <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </Form.Group>
            </Col>

            {/* Kích cỡ */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>Kích cỡ</Form.Label>
                <Form.Select value={size} onChange={(e) => setSize(e.target.value)}>
                  <option value="Không">Không</option>
                  <option value="Có">Có</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Nếu không có kích cỡ */}
            {size === "Không" ? (
              <>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Giá gốc</Form.Label>
                    <Form.Control type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Giá khuyến mãi (nếu có)</Form.Label>
                    <Form.Control type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                  </Form.Group>
                </Col>
              </>
            ) : (
              ["S", "M", "L"].map((sz) => (
                <React.Fragment key={sz}>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Giá gốc - {sz}</Form.Label>
                      <Form.Control
                        type="number"
                        value={variantPrices[`${sz}_original`] || ""}
                        onChange={(e) =>
                          setVariantPrices({
                            ...variantPrices,
                            [`${sz}_original`]: Number(e.target.value),
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Giá khuyến mãi - {sz} (nếu có)</Form.Label>
                      <Form.Control
                        type="number"
                        value={variantPrices[`${sz}_discount`] || ""}
                        onChange={(e) =>
                          setVariantPrices({
                            ...variantPrices,
                            [`${sz}_discount`]: Number(e.target.value),
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                </React.Fragment>
              ))
            )}

            {/* Loại sản phẩm */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>Loại sản phẩm</Form.Label>
                <Form.Select value={productType} onChange={(e) => setProductType(e.target.value)}>
                  <option value="Tồn kho">Tồn kho</option>
                  <option value="Theo ngày">Theo ngày</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Nếu là tồn kho */}
            {productType === "Tồn kho" && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Số lượng sản phẩm</Form.Label>
                  <Form.Control type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </Form.Group>
              </Col>
            )}

            {/* Nếu là theo ngày */}
            {productType === "Theo ngày" && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Số lượng ban đầu (daily)</Form.Label>
                  <Form.Control
                    type="number"
                    value={dailyInitialQuantity}
                    onChange={(e) => setDailyInitialQuantity(Number(e.target.value))}
                  />
                </Form.Group>
              </Col>
            )}

            {/* Danh mục */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>Danh mục</Form.Label>
                <Form.Select value={category} onChange={(e) => setCategory(e.target.value)} disabled={loading}>
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
            </Col>

            {/* Hương vị */}
            <Col md={6}>
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
            </Col>

            {/* Mô tả */}
            <Col md={12}>
              <Form.Group>
                <Form.Label>Mô tả sản phẩm</Form.Label>
                <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </Form.Group>
            </Col>

            {/* Hình ảnh */}
            <Col md={12}>
              <Form.Group>
                <Form.Label>Hình ảnh</Form.Label>
                {imagePreview && (
                  <img
                    src={imagePreview.startsWith("http") ? imagePreview : `${API_URL}${imagePreview}`}
                    alt="Preview"
                    style={{ width: "100%", maxHeight: "200px", objectFit: "contain", marginBottom: "10px" }}
                  />
                )}
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </Form.Group>
            </Col>

            {/* Trạng thái */}
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setUpdateModal(false)}>
          Đóng
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Cập nhật sản phẩm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default UpdateModelAdmin;
