"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Container,
  Table,
  Navbar,
  Dropdown,
  Form,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarsStaggered,
  faBell,
  faGear,
  faPlus,
  faPenToSquare,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import ModalsAdmin from "@/app/component/create.model.admin";
import UpdateModelAdmin from "@/app/component/update-model-admin";
import useDarkMode from "../useDarkMode/page";
import AdminSideBar from "../../component/adminSideBar";

export default function ShowInactiveProducts() {
  interface PostType {
    _id: string;
    name: string;
    categoryId?: string | { _id: string; name: string };
    image: string;
    quantity: number;
    taste?: string[];
    sizes?: {
      name: string;
      price: {
        original: number;
        discount?: number;
      };
    }[];
    description: string;
    isHidden?: boolean;
  }

  const [posts, setPosts] = useState<PostType[]>([]);
  const [post, setPost] = useState<PostType | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showUpdateModal, setUpdateModal] = useState<boolean>(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:5000/products/inactive");
      const data = await res.json();
      if (data?.result) setPosts(data.result);
    } catch (e) {
      toast.error("Lỗi tải sản phẩm");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/categories");
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.result;
      setCategories(list);
    } catch (e) {
      toast.error("Lỗi tải danh mục");
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const handleEdit = (product: PostType) => {
    setPost(product);
    setUpdateModal(true);
  };

  const handleShowProduct = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/products/show/${id}`, {
        method: "PATCH",
      });
      fetchPosts();
      toast.success("Hiện sản phẩm thành công");
    } catch (e) {
      toast.error("Hiện sản phẩm thất bại");
    }
  };

  const renderSizes = (sizes?: PostType["sizes"]) => {
    if (!sizes || sizes.length === 0) return "Không có";
    return (
      <>
        {sizes.map((s) => (
          <div key={s.name}>
            {s.name}:{" "}
            {s.price?.discount ? (
              <>
                <del>{s.price.original?.toLocaleString?.() || 0}đ</del>{" "}
                <strong>{s.price.discount?.toLocaleString?.() || 0}đ</strong>
              </>
            ) : (
              <>{s.price?.original?.toLocaleString?.() || 0}đ</>
            )}
          </div>
        ))}
      </>
    );
  };

  const totalPages = Math.ceil(posts.length / productsPerPage);
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const current = posts.slice(indexOfFirst, indexOfLast);

  return (
    <div className="d-flex dark-mode">
      <AdminSideBar />
      <Container
        fluid
        className={`content w-100 container-content ${
          collapsed ? "collapsed-content" : ""
        }`}
      >
        <Navbar className="navbar">
          <Container fluid>
            <Button
              variant="light"
              onClick={() => setCollapsed(!collapsed)}
              className="me-3"
            >
              <FontAwesomeIcon icon={faBarsStaggered} />
            </Button>
            <Form className="d-flex search-form">
              <div className="input-group">
                <input
                  className="form-control"
                  type="search"
                  placeholder="Tìm kiếm..."
                />
                <button className="btn btn-outline-secondary">
                  <FaSearch />
                </button>
              </div>
            </Form>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faBell} className="me-3" />
              <Dropdown>
                <Dropdown.Toggle className="drop-down-avt" id="dropdown-basic">
                  <img
                    src="/avt.jpg"
                    className="rounded-circle"
                    width={45}
                    height={45}
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="/admin/account">
                    Trang cá nhân
                  </Dropdown.Item>
                  <Dropdown.Item>Cài đặt</Dropdown.Item>
                  <Dropdown.Item>Đăng xuất</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Button className="ms-3" onClick={toggleDarkMode}>
                <FontAwesomeIcon icon={faGear} />
              </Button>
            </div>
          </Container>
        </Navbar>

        <h4 className="text-center mt-4">Danh sách sản phẩm ngưng bán</h4>
        <div className="d-flex justify-content-end mb-2">
          <Button onClick={() => setShowModal(true)}>
            <FontAwesomeIcon icon={faPlus} /> Thêm sản phẩm
          </Button>
        </div>

        <Table striped bordered hover responsive className="mt-3 text-center">
          <thead>
            <tr>
              <th>#</th>
              <th>Ảnh</th>
              <th>Tên</th>
              <th>Giá (các size)</th>
              <th>Số lượng</th>
              <th>Vị</th>
              <th>Danh mục</th>
              <th>Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {current.map((product, idx) => (
              <tr key={product._id}>
                <td>{idx + 1}</td>
                <td>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: "60px" }}
                  />
                </td>
                <td>{product.name}</td>
                <td>{renderSizes(product.sizes)}</td>
                <td>{product.quantity}</td>
                <td>
                  {product.taste?.[0] === "Không"
                    ? "Không có"
                    : product.taste?.join(", ")}
                </td>
                <td>
                  {typeof product.categoryId === "object"
                    ? product.categoryId?.name
                    : categories.find((c) => c._id === product.categoryId)
                        ?.name || "Không rõ"}
                </td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(product)}
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleShowProduct(product._id)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="d-flex justify-content-center gap-2 mt-3">
          <Button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            variant="outline-secondary"
          >
            Trang trước
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              variant={currentPage === i + 1 ? "primary" : "outline-secondary"}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            variant="outline-secondary"
          >
            Trang sau
          </Button>
        </div>
      </Container>

      <ModalsAdmin showModal={showModal} setShowModal={setShowModal} />
      <UpdateModelAdmin
        showUpdateModal={showUpdateModal}
        setUpdateModal={setUpdateModal}
        post={post}
        fetchPosts={fetchPosts}
      />
    </div>
  );
}
