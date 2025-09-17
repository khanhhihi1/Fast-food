"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Form, Col, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { PostType } from "../type/type";
import "./model.css";
import React from "react";

interface iShow {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  fetchPosts: () => void;
}

function ModalsAdmin({ showModal, setShowModal, fetchPosts }: iShow) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [quantity, setQuantity] = useState("");
  const [taste, setTaste] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [size, setSize] = useState("Không");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [variantPrices, setVariantPrices] = useState<{ [key: string]: number }>({});
  const [status, setStatus] = useState(true);
  const [categoriesList, setCategoriesList] = useState<PostType[] | null>(null);
  const [loading, setLoading] = useState(false);

  // loại sản phẩm
  const [productType, setProductType] = useState<"stock" | "daily">("stock");
  const [dailyInitialQuantity, setDailyInitialQuantity] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (showModal) {
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
  }, [showModal]);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Tên sản phẩm không được để trống!");
    if (!category) return toast.error("Vui lòng chọn danh mục!");
    if (!imageFile) return toast.error("Vui lòng chọn file hình ảnh!");
    if (productType === "stock") {
      const qty = parseInt(quantity, 10);
      if (!qty || qty <= 0) return toast.error("Số lượng phải là số nguyên dương!");
    }
    if (productType === "daily" && (!dailyInitialQuantity || dailyInitialQuantity <= 0)) {
      return toast.error("Số lượng ban đầu phải lớn hơn 0!");
    }
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

    const formData = new FormData();
    formData.append("name", name);
    formData.append("categoryId", category);
    if (productType === "stock") {
      formData.append("quantity", quantity);
      formData.append("isDaily", "false");
    } else {
      formData.append("dailyInitialQuantity", dailyInitialQuantity.toString());
      formData.append("isDaily", "true");
    }
    formData.append("taste", JSON.stringify(taste));
    formData.append("description", description);
    formData.append("sizes", JSON.stringify(sizes));
    formData.append("status", status.toString());
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res = await fetch(`${API_URL}/products/addProduct`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        try {
          const result = JSON.parse(text);
          throw new Error(result.message || "Lỗi khi thêm sản phẩm");
        } catch (parseErr) {
          throw new Error("Response không phải JSON: " + text.substring(0, 100));
        }
      }
      await res.json();
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
    setImageFile(null);
    setQuantity("");
    setTaste([]);
    setDescription("");
    setPrice("");
    setDiscount("");
    setVariantPrices({});
    setSize("Không");
    setStatus(true);
    setProductType("stock");
    setDailyInitialQuantity(0);
    setShowModal(false);
  };

  return (
    <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "black" }}>Thêm sản phẩm mới</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ color: "black" }}>Tên sản phẩm</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập tên sản phẩm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ color: "black" }}>Kích cỡ</Form.Label>
                <Form.Select value={size} onChange={(e) => setSize(e.target.value)}>
                  <option value="Không">Không</option>
                  <option value="Có">Có</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {size === "Không" ? (
              <>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ color: "black" }}>Giá gốc</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Nhập giá gốc"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ color: "black" }}>Giá khuyến mãi (nếu có)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Nhập giá khuyến mãi"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </>
            ) : (
              ["S", "M", "L"].map((sz) => (
                <React.Fragment key={sz}>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{ color: "black" }}>Giá gốc - {sz}</Form.Label>
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
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{ color: "black" }}>Giá khuyến mãi - {sz} (nếu có)</Form.Label>
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
                  </Col>
                </React.Fragment>
              ))
            )}

            <Col md={6}>
              <Form.Group>
                <Form.Label>Loại sản phẩm</Form.Label>
                <Form.Select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value as "stock" | "daily")}
                >
                  <option value="stock">Sản phẩm tồn kho</option>
                  <option value="daily">Sản phẩm theo ngày</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {productType === "daily" ? (
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
            ) : (
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ color: "black" }}>Số lượng</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Nhập số lượng"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </Form.Group>
              </Col>
            )}

            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ color: "black" }}>Danh mục</Form.Label>
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
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ color: "black" }}>Hương vị</Form.Label>
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
                    <span
                      key={i}
                      style={{
                        background: "#007bff",
                        color: "white",
                        padding: "5px 10px",
                        borderRadius: 20,
                      }}
                    >
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

            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ color: "black" }}>Mô tả sản phẩm</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={description}
                  placeholder="Nhập mô tả sản phẩm"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ color: "black" }}>Hình ảnh</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      setImageFile(file);
                    }
                  }}
                />
              </Form.Group>
            </Col>

            
          </Row>
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
