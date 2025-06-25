import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";

interface PostType {
  _id?: string;
  name: string;
  image: string;
  category: string;
  quantity: number;
  taste: string[] | string;
  description: string;
  sizes: {
    name: string;
    price: {
      original: number;
      discount?: number;
    };
  }[];
  status?: boolean;
}

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
  const [image, setImage] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [taste, setTaste] = useState<string>("");
  const [size, setSize] = useState<string>("Không");
  const [price, setPrice] = useState<string>("");
  const [discount, setDiscount] = useState<string>("");
  const [variantPrices, setVariantPrices] = useState<{ [key: string]: number }>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [categoriesList, setCategoriesList] = useState<
    { _id: string; name: string }[] | null
  >(null);

  useEffect(() => {
    if (showUpdateModal) {
      const fetchCategories = async () => {
        setLoading(true);
        try {
          const response = await fetch("http://localhost:5000/categories");
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
      setImage(post.image || "");
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

    const updatedPost = {
      name,
      image,
      categoryId: category,
      description,
      quantity: parseInt(quantity, 10),
      taste: taste.split(",").map((t) => t.trim()),
      sizes,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/products/updateProduct/${productId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedPost),
        }
      );

      if (!response.ok) {
        throw new Error(`Lỗi khi cập nhật sản phẩm: ${response.status}`);
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
      keyboard={false}
    >
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
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Form.Label>Kích cỡ</Form.Label>
            <Form.Select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="Không">Không</option>
              <option value="Có">Có</option>
            </Form.Select>

            {size === "Không" ? (
              <>
                <Form.Label>Giá gốc</Form.Label>
                <Form.Control
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <Form.Label>Giá khuyến mãi (nếu có)</Form.Label>
                <Form.Control
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </>
            ) : (
              ["S", "M", "L"].map((sz) => (
                <div key={sz}>
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
                </div>
              ))
            )}

            <Form.Label className="mt-2" style={{ color: "black" }}>
              Số lượng sản phẩm
            </Form.Label>
            <Form.Control
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            <Form.Label className="mt-2" style={{ color: "black" }}>
              Hương vị
            </Form.Label>
            <Form.Control
              type="text"
              value={taste}
              onChange={(e) => setTaste(e.target.value)}
              placeholder="Nhập hương vị (cách nhau bằng dấu phẩy)"
            />

            <Form.Label className="mt-2" style={{ color: "black" }}>
              Mô tả sản phẩm
            </Form.Label>
            <Form.Control
              as="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Form.Label className="mt-3">Danh mục</Form.Label>
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

            <Form.Label className="mt-2" style={{ color: "black" }}>
              URL Hình ảnh
            </Form.Label>
            <Form.Control
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </Form.Group>
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
