"use client";
import useSWR from "swr";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Image from "react-bootstrap/Image";
import Card from "react-bootstrap/Card";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Counter from "@/app/count/count";
import "./productList.css";
import ProductList from "../productList";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

interface SizeType {
  name: string;
  price: {
    original: number;
    discount?: number;
  };
}

interface CategoryInfo {
  _id: string;
  name: string;
  imageUrl?: string;
  isHidden?: boolean;
}

interface ProductType {
  _id: string;
  name: string;
  image: string;
  description: string;
  time: string;
  view: number;
  quantity: number;
  taste?: string[];
  sizes?: SizeType[];
  categoryId?: string | CategoryInfo;
}

interface CommentType {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  productId: string;
  orderId: string;
  comment: string;
  rating: number;
  createdAt: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const [productId, setProductId] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedTaste, setSelectedTaste] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (id && typeof id === "string") {
      setProductId(id);
    }
  }, [id]);

  const fetcher = async (url: string) => {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Lỗi ${res.status}: ${text.startsWith("<!DOCTYPE") ? "Không tìm thấy endpoint" : text}`);
    }
    const data = await res.json();
    if (!data.result) throw new Error("API không trả về 'result'");
    return data.result;
  };

  const { data: product, error: productError, isLoading: productLoading } = useSWR(
    productId ? `http://localhost:5000/products/${productId}` : null,
    fetcher
  );

  const { data: categories, error: categoryError, isLoading: categoryLoading } = useSWR(
    "http://localhost:5000/categories",
    fetcher
  );

  const { data: comments, error: commentError, isLoading: commentLoading } = useSWR(
  productId ? `http://localhost:5000/comment/${productId}` : null,
  async (url: string) => {
    console.log("Fetching comments from:", url);
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) {
      const text = await res.text();
      console.error("Fetch error:", { status: res.status, body: text });
      throw new Error(`Lỗi ${res.status}: ${text.startsWith("<!DOCTYPE") ? "Không tìm thấy endpoint" : text}`);
    }
    const data = await res.json();
    console.log("Comments response:", data);
    if (!data.result) throw new Error("API không trả về 'result'");
    return data.result;
  }
);

  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0].name);
    } else {
      setSelectedSize(null);
    }
  }, [product]);

  useEffect(() => {
    if (categories) {
      console.log("Fetched categories:", categories);
    }
    if (categoryError) {
      console.error("Category fetch error:", categoryError);
    }
    if (comments) {
      console.log("Fetched comments:", comments);
    }
    if (commentError) {
      console.error("Comment fetch error:", commentError);
    }
  }, [categories, categoryError, comments, commentError]);

  const getCategoryName = () => {
    if (!product || !categories) return "Danh mục";
    if (typeof product.categoryId === "string") {
      const category = categories.find((cat: CategoryInfo) => cat._id === product.categoryId);
      return category?.name || "Danh mục";
    }
    return (product.categoryId as CategoryInfo)?.name || "Danh mục";
  };

  const renderPrice = () => {
    if (!product?.sizes || product.sizes.length === 0) return "Giá không khả dụng";
    const size = product.sizes.find((s) => s.name === selectedSize);
    if (!size) return "Không có size phù hợp";

    const { original, discount } = size.price;
    return (
      <span>
        {discount ? (
          <>
            <del>{original.toLocaleString()}đ</del>{" "}
            <strong>{discount.toLocaleString()}đ</strong>
          </>
        ) : (
          <>{original.toLocaleString()}đ</>
        )}
      </span>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <span>
        {[...Array(5)].map((_, index) => (
          <FontAwesomeIcon
            key={index}
            icon={faStar}
            style={{ color: index < rating ? "#ffc107" : "#e4e5e9" }}
          />
        ))}
      </span>
    );
  };

  const handleAddToCart = async (product: ProductType) => {
    if (!selectedSize || !product?._id) {
      toast.error("Vui lòng chọn kích cỡ");
      return;
    }

    const sizeInfo = product.sizes?.find((s) => s.name === selectedSize);
    if (!sizeInfo) {
      toast.error("Kích cỡ không hợp lệ");
      return;
    }

    const price = {
      original: sizeInfo.price.original,
      discount: sizeInfo.price.discount,
    };

    try {
      const res = await fetch("http://localhost:5000/cart/add", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          sizeName: selectedSize,
          taste: selectedTaste ? [selectedTaste] : [],
          quantity,
          price,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Lỗi không xác định");

      toast.success(`${product.name} đã được thêm vào giỏ hàng.`);
    } catch (error: any) {
      toast.error(`Thêm giỏ hàng thất bại: ${error.message}`);
      console.error("Lỗi khi thêm giỏ hàng:", error);
    }
  };

  if (productLoading || categoryLoading || commentLoading) return <p>Đang tải...</p>;
  if (productError) return <p>Lỗi khi tải sản phẩm: {productError.message}</p>;
  if (categoryError) return <p>Lỗi khi tải danh mục: {categoryError.message}</p>;
  if (commentError) return <p>Lỗi khi tải bình luận: {commentError.message}</p>;
  if (!product || !product._id) return <p>Không tìm thấy sản phẩm</p>;

  return (
    <>
      <Container fluid style={{ padding: "0px" }}>
        <Breadcrumb className="m-0" style={{ backgroundColor: "#ddd", padding: "10px 110px" }}>
          <Breadcrumb.Item href="/" className="breadCrumbItem" style={{ margin: "0px" }}>
            Trang chủ
          </Breadcrumb.Item>
          <Breadcrumb.Item href="" className="breadCrumbItem">
            {getCategoryName()}
          </Breadcrumb.Item>
          <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Container fluid className="p-5">
          <Row>
            <Col xs={8} className="d-flex justify-content-center">
              <Image src={product.image} fluid />
            </Col>
            <Col xs={4}>
              <Row className="d-flex flex-column" style={{ gap: "12px" }}>
                <h1 style={{ fontSize: "20px", color: "#252a2b" }}>{product.name}</h1>
                <span>{renderPrice()}</span>

                {product.sizes && product.sizes.length > 0 && (
                  <>
                    <p className="m-0">Chọn kích thước:</p>
                    <Form>
                      {product.sizes.map((size, index) => (
                        <Form.Check
                          type="radio"
                          key={index}
                          id={`size-${index}`}
                          label={`${size.name} (${size.price.discount
                              ? size.price.discount.toLocaleString()
                              : size.price.original.toLocaleString()
                            }đ)`}
                          name="size"
                          checked={selectedSize === size.name}
                          onChange={() => setSelectedSize(size.name)}
                        />
                      ))}
                    </Form>
                  </>
                )}

                <span>{product.time || "Thời gian không khả dụng"}</span>
                <span>
                  Đánh giá: {comments?.length ? renderStars(comments.reduce((acc: number, c: CommentType) => acc + c.rating, 0) / comments.length) : "Chưa có đánh giá"}
                </span>

                <p className="m-0">Chọn vị:</p>
                <Form>
                  {Array.isArray(product.taste) && product.taste.length > 0 ? (
                    <>
                      <Form.Check
                        key="no-taste"
                        id="taste-radio-no"
                        label="Không"
                        type="radio"
                        name="taste"
                        checked={selectedTaste === null}
                        onChange={() => setSelectedTaste(null)}
                      />
                      {product.taste.map((item, index) => (
                        <Form.Check
                          key={index}
                          id={`taste-radio-${index}`}
                          label={item}
                          type="radio"
                          name="taste"
                          checked={selectedTaste === item}
                          onChange={() => setSelectedTaste(item)}
                        />
                      ))}
                    </>
                  ) : (
                    <p>Không có lựa chọn vị</p>
                  )}
                </Form>

                <p className="m-0" style={{ color: "orange" }}>Combo bao gồm:</p>
                <ul>
                  <li>{product.description || "Không có mô tả"}</li>
                </ul>

                <Counter value={quantity} setValue={setQuantity} />

                <Button
                  className="text-light p-2"
                  style={{ border: "none", borderRadius: "0", backgroundColor: "#e00000" }}
                  onClick={() => handleAddToCart(product)}
                >
                  Thêm vào giỏ
                </Button>
              </Row>
            </Col>
          </Row>

          {/* Section hiển thị bình luận */}
          <Row className="mt-5">
            <Col xs={12}>
              <h3>Bình luận về sản phẩm</h3>
              {comments?.length > 0 ? (
                comments.map((comment: CommentType) => (
                  <Card key={comment._id} className="mb-3">
                    <Card.Body>
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>{comment.userId.name}</strong>
                          <div>{renderStars(comment.rating)}</div>
                        </div>
                        <small className="text-muted">
                          {new Date(comment.createdAt).toLocaleDateString("vi-VN")} {new Date(comment.createdAt).toLocaleTimeString("vi-VN")}
                        </small>
                      </div>
                      <p className="mt-2">{comment.comment}</p>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <p>Chưa có bình luận nào cho sản phẩm này.</p>
              )}
            </Col>
          </Row>
        </Container>
      </Container>

      <ProductList category="related" title="Sản phẩm liên quan" limit={6} />
    </>
  );
};

export default ProductDetail;