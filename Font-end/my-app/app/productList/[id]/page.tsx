"use client";
import useSWR, { Fetcher } from "swr";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Image from "react-bootstrap/Image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Counter from "@/app/count/count";
import "./productList.css";
import ProductList from "../productList";

interface ProductType {
  _id: string;
  id?: string;
  category: string;
  name: string;
  image: string;
  price: number | Record<string, number>;
  rating?: number;
  time: string;
  description?: string;
  taste: string[];
  size?: string[];
  status: boolean;
  quantity: number;
  view: number;
}

const ProductDetail = () => {
  const { id } = useParams();
  const [productId, setProductId] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Hàm định dạng giá
  const renderPrice = (price: ProductType["price"], selectedSize: string | null) => {
    if (typeof price === "number") {
      return <div>{price.toLocaleString()}đ</div>;
    }
    if (selectedSize && price[selectedSize]) {
      return <div>{selectedSize}: {price[selectedSize].toLocaleString()}đ</div>;
    }
    return <div>Giá không khả dụng</div>;
  };

  useEffect(() => {
    if (id && typeof id === "string") {
      setProductId(id);
    } else {
      console.error("ID sản phẩm không hợp lệ:", id);
    }
  }, [id]);

  const fetcher: Fetcher<ProductType, string> = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Không thể lấy dữ liệu sản phẩm");
    }
    const response = await res.json();
    console.log("API response:", response); // Ghi log để debug
    const data = response.result; // Lấy dữ liệu từ result
    if (!data) {
      throw new Error("Không tìm thấy sản phẩm");
    }
    // Chuẩn hóa price
    if (typeof data.price === "number") {
      if (data.price <= 0) {
        console.warn("Giá thường không hợp lệ:", data.price);
        data.price = 0;
      }
    } else if (typeof data.price === "object" && data.price !== null) {
      if (
        !Object.keys(data.price).length ||
        Object.values(data.price).some(v => typeof v !== "number" || v <= 0)
      ) {
        console.warn("Giá theo kích thước không hợp lệ:", data.price);
        data.price = { Nhỏ: 0, Vừa: 0, Lớn: 0 };
      }
    } else {
      console.warn("Price không hợp lệ:", data.price);
      data.price = 0; // Giá mặc định
    }
    // Chuẩn hóa taste
    if (!Array.isArray(data.taste)) {
      console.warn("Taste không phải mảng:", data.taste);
      data.taste = [];
    }
    // Chuẩn hóa size
    if (!Array.isArray(data.size)) {
      console.warn("Size không phải mảng:", data.size);
      data.size = [];
    }
    // Chuẩn hóa description
    if (typeof data.description !== "string") {
      console.warn("Description không phải chuỗi:", data.description);
      data.description = "Không có mô tả";
    }
    // Chuẩn hóa rating
    if (typeof data.rating !== "number") {
      console.warn("Rating không hợp lệ:", data.rating);
      data.rating = 0;
    }
    // Chuẩn hóa status
    if (typeof data.status !== "boolean") {
      console.warn("Status không hợp lệ:", data.status);
      data.status = true;
    }
    // Chuẩn hóa quantity
    if (typeof data.quantity !== "number") {
      console.warn("Quantity không hợp lệ:", data.quantity);
      data.quantity = 0;
    }
    // Chuẩn hóa view
    if (typeof data.view !== "number") {
      console.warn("View không hợp lệ:", data.view);
      data.view = 0;
    }
    return data;
  };

  const { data, error, isLoading } = useSWR(
    productId ? `http://localhost:5000/products/${productId}` : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // useEffect để đặt kích thước mặc định
  useEffect(() => {
    if (data && typeof data.price === "object" && data.size && data.size.length > 0) {
      setSelectedSize(data.size[0]); // Chọn kích thước đầu tiên
    } else {
      setSelectedSize(null); // Không chọn kích thước nếu price là số hoặc không có size
    }
  }, [data]); // Dependency array chỉ chứa data

  if (isLoading) return <p>Đang tải...</p>;
  if (error) return <p>Lỗi khi tải sản phẩm: {error.message}</p>;
  if (!data || !data._id) return <p>Không tìm thấy sản phẩm</p>;

  return (
    <>
      <Container fluid className="mt-4">
        <Breadcrumb className="ms-5">
          <Breadcrumb.Item href="/" className="breadCrumbItem">
            Trang chủ
          </Breadcrumb.Item>
          <Breadcrumb.Item href="" className="breadCrumbItem">
            {data.category || "Danh mục"}
          </Breadcrumb.Item>
          <Breadcrumb.Item active>{data.name || "Sản phẩm"}</Breadcrumb.Item>
        </Breadcrumb>
        <Container fluid className="p-5">
          <Row>
            <Col xs={8} className="d-flex justify-content-center">
              <Image src={data.image || "/placeholder-image.jpg"} fluid />
            </Col>
            <Col xs={4}>
              <Row className="d-flex flex-column" style={{ gap: "12px" }}>
                <h1 style={{ fontSize: "20px", color: "#252a2b" }}>
                  {data.name}
                </h1>
                <span>{renderPrice(data.price, selectedSize)}</span>
                {/* Form chọn kích thước (chỉ hiển thị nếu price là object và có size) */}
                {typeof data.price === "object" && data.size && data.size.length > 0 && (
                  <>
                    <p className="m-0">Chọn kích thước:</p>
                    <Form>
                      {data.size.map((size, index) => (
                        <Form.Check
                          type="radio"
                          id={`size-radio-${index}`}
                          key={index}
                          label={`${size} (${data.price[size] ? data.price[size].toLocaleString() : "N/A"}đ)`}
                          name="size"
                          checked={selectedSize === size}
                          onChange={() => setSelectedSize(size)}
                        />
                      ))}
                    </Form>
                  </>
                )}
                <span>{data.time || "Thời gian không khả dụng"}</span>
                <span>Đánh giá: {data.rating} sao</span>
                <p className="m-0">Chọn vị:</p>
                <Form>
                  {Array.isArray(data.taste) && data.taste.length > 0 ? (
                    data.taste.map((item, index) => (
                      <Form.Check
                        id={`taste-checkbox-${index}`}
                        key={index}
                        label={item}
                      />
                    ))
                  ) : (
                    <p>Không có lựa chọn vị</p>
                  )}
                </Form>
                <p className="m-0" style={{ color: "orange" }}>
                  Combo bao gồm:
                </p>
                <ul>
                  {data.description && data.description.trim() ? (
                    <li>{data.description}</li>
                  ) : (
                    <li>Không có mô tả</li>
                  )}
                </ul>
                <Counter />
                <Button
                  className="text-light p-2"
                  style={{
                    border: "none",
                    borderRadius: "0",
                    backgroundColor: "#e00000",
                  }}
                  onClick={() => {
                    console.log("Thêm vào giỏ:", {
                      productId: data._id,
                      name: data.name,
                      size: typeof data.price === "object" ? selectedSize : null,
                      price: typeof data.price === "number" ? data.price : selectedSize && data.price ? data.price[selectedSize] : 0,
                    });
                  }}
                >
                  Thêm vào giỏ
                </Button>
              </Row>
            </Col>
          </Row>
        </Container>
      </Container>
      <ProductList category="related" title="Sản phẩm liên quan" limit={6} />
    </>
  );
};

export default ProductDetail;