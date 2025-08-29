import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";
import "./model.css"
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
  const [imageFile, setImageFile] = useState<File | null>(null); // State cho file upload mới
  const [imagePreview, setImagePreview] = useState<string>(""); // Preview ảnh cũ hoặc mới
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [taste, setTaste] = useState<string>("");
  const [size, setSize] = useState<string>("Không");
  const [price, setPrice] = useState<string>("");
  const [discount, setDiscount] = useState<string>("");
  const [variantPrices, setVariantPrices] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [categoriesList, setCategoriesList] = useState<
    { _id: string; name: string }[] | null
  >(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
    if (post) {
      setID(post._id?.toString() || "");
      setName(post.name || "");
      setCategory((post.category as string) || (post as any).categoryId || "");
      setImagePreview(post.image || "");
      setImageFile(null);
      setQuantity(post.quantity?.toString() || "");
      setTaste(
        Array.isArray(post.taste) ? post.taste.join(", ") : post.taste || ""
      );
      setDescription(post.description || "");

      if (post.sizes.length === 1 && post.sizes[0].name === "default") {
        setSize("Không");
        setPrice(post.sizes[0].price.original.toString());
        setDiscount(post.sizes[0].price.discount?.toString() || "");
      } else {
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
    const productId = id || post?._id;
    if (!productId) {
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
              parsedDiscount > 0 && { discount: parsedDiscount }),
          },
        },
      ];
    } else {
      const requiredSizes = ["S", "M", "L"];
      for (const sz of requiredSizes) {
        if (!variantPrices[`${sz}_original`]) {
          toast.error(`Thiếu giá gốc cho kích cỡ: ${sz}`);
          return;
        }
      }
      sizes = requiredSizes.map((sz) => ({
        name: sz,
        price: {
          original: variantPrices[`${sz}_original`],
          ...(variantPrices[`${sz}_discount`] && {
            discount: variantPrices[`${sz}_discount`],
          }),
        },
      }));
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("categoryId", category);
    formData.append("description", description);
    formData.append("quantity", quantity);
    formData.append("taste", JSON.stringify(taste.split(",").map((t) => t.trim()))); // Gửi array dưới dạng JSON string
    formData.append("sizes", JSON.stringify(sizes)); // Gửi array dưới dạng JSON string

    if (imageFile) {
      formData.append("image", imageFile); // Chỉ append nếu có file mới
    }

    try {
      const response = await fetch(
        `${API_URL}/products/updateProduct/${productId}`,
        {
          method: "PUT",
          body: formData, // Sử dụng FormData thay vì JSON
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || `Lỗi khi cập nhật sản phẩm: ${response.status}`);
      }

      toast.success("Cập nhật sản phẩm thành công!");
      fetchPosts();
      setUpdateModal(false);
    } catch (error: any) {
      toast.error("Cập nhật thất bại: " + (error.message || ""));
      console.error("Lỗi cập nhật sản phẩm:", error);
    }
  };

  return (
    <Modal
      show={showUpdateModal}
      onHide={() => setUpdateModal(false)}
      backdrop="static"
      keyboard={false} size="xl"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "black" }}>Cập nhật sản phẩm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="g-3">

            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ color: "black" }}>Tên sản phẩm</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Kích cỡ</Form.Label>
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
                    <Form.Label>Giá gốc</Form.Label>
                    <Form.Control
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Giá khuyến mãi (nếu có)</Form.Label>
                    <Form.Control
                      type="number"
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

            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ color: "black" }}>Số lượng sản phẩm</Form.Label>
                <Form.Control
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ color: "black" }}>Danh mục</Form.Label>
                <Form.Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {loading && <option>Đang tải...</option>}
                  {!loading &&
                    categoriesList &&
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
                  value={taste}
                  onChange={(e) => setTaste(e.target.value)}
                  placeholder="Nhập hương vị (cách nhau bằng dấu phẩy)"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ color: "black" }}>Mô tả sản phẩm</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label style={{ color: "black" }}>Hình ảnh hiện tại</Form.Label>
                {imagePreview && (
                  <img
                    src={
                      imagePreview.startsWith("http")
                        ? imagePreview
                        : `${API_URL}${imagePreview}`
                    }
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "contain",
                      marginBottom: "10px",
                    }}
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