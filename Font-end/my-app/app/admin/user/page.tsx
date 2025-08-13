"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Button, Container, Form, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserShield } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import AdminNavbar from "../../component/adminNavbar";
import AdminSideBar from "../../component/adminSideBar";
import useDarkMode from "../useDarkMode/page";
import styles from "../styles/product.module.css";
import { FaSearch } from "react-icons/fa";

interface UserType {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  status: string;
  isLocked: boolean;
}

export default function UserAdmin() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const { isDarkMode } = useDarkMode();

  // Thêm filter và search
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/users", {
        credentials: "include",
      });
      const data = await res.json();
      if (data?.result) {
        setUsers(data.result);
      } else if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (e) {
      toast.error("Lỗi tải danh sách người dùng");
    }
  };

  const updateUserField = async (
    id: string,
    field: string,
    value: string | boolean
  ) => {
    try {
      const res = await fetch(`http://localhost:5000/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi cập nhật người dùng");
      }

      toast.success("Cập nhật thành công");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi cập nhật người dùng");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Lọc và tìm kiếm
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Filter trạng thái
      if (filter === "active" && user.status !== "active") return false;
      if (filter === "inactive" && user.status !== "banned") return false;

      // Filter theo tìm kiếm
      const keyword = searchTerm.toLowerCase();
      if (
        !user.username.toLowerCase().includes(keyword) &&
        !user.name.toLowerCase().includes(keyword) &&
        !user.email.toLowerCase().includes(keyword)
      ) {
        return false;
      }

      return true;
    });
  }, [users, filter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

  return (
    <div className="d-flex dark-mode">
      <AdminSideBar />
      <Container
        fluid
        className={`content w-100 container-content ${collapsed ? "collapsed-content" : ""
          }`}
        style={{ minHeight: "100vh" }}
      >
        <AdminNavbar />
        <div className={styles["admin-product-container"]}>
          <h2>Quản lý người dùng</h2>

          {/* Thống kê */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Tổng người dùng</span>
              <span className={styles.statValue}>{users.length}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Tổng admin</span>
              <span className={styles.statValue}>
                {users.filter((u) => u.role === "admin").length}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Tổng quản lý</span>
              <span className={styles.statValue}>
                {users.filter((u) => u.role === "staff").length}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Tổng khách hàng</span>
              <span className={styles.statValue}>
                {users.filter((u) => u.role === "user").length}
              </span>
            </div>
          </div>

          <div className={styles["adminHeader"] + " mb-4 d-flex"}>
            <div className={styles.meNu}>
              <div className={styles.filters}>
                <button
                  className={`${styles.filterBtn} ${filter === "all" ? styles.active : ""
                    }`}
                  onClick={() => setFilter("all")}
                >
                  Tất cả
                </button>
                <button
                  className={`${styles.filterBtn} ${filter === "active" ? styles.active : ""
                    }`}
                  onClick={() => setFilter("active")}
                >
                  Đang hoạt động
                </button>
                <button
                  className={`${styles.filterBtn} ${filter === "inactive" ? styles.active : ""
                    }`}
                  onClick={() => setFilter("inactive")}
                >
                  Bị khóa
                </button>
              </div>
              <Form
                className={styles.fromInput}
                onSubmit={(e) => e.preventDefault()}
                style={{marginLeft:"630px"}}
              >
                <div className="input-group">
                  <input
                    className="form-control search-input"
                    type="search"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn search-button" type="submit">
                    <FaSearch />
                  </button>
                </div>
              </Form>
            </div>
          </div>

          {/* Bảng danh sách */}
          <Table striped bordered hover className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Tên người dùng</th>
                <th>Email</th>
                <th>Tên hiển thị</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Bị khóa?</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, idx) => (
                <tr key={user._id}>
                  <td>{indexOfFirst + idx + 1}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.name}</td>

                  {/* Vai trò */}
                  <td>
                    {user.role === "admin" ? (
                      <span
                      >
                        <FontAwesomeIcon icon={faUserShield} /> Admin
                      </span>
                    ) : (
                      <select
                        value={user.role}
                        className="form-select fw-bold text-capitalize"
                        onChange={(e) =>
                          updateUserField(user._id, "role", e.target.value)
                        }
                      >
                        <option value="user" className="text-primary">
                          Khách hàng
                        </option>
                        <option value="staff" className="text-warning">
                          Quản lý
                        </option>
                      </select>
                    )}
                  </td>

                  {/* Trạng thái */}
                  <td>
                    {user.role === "admin" ? (
                      <span className="fw-bold text-success">
                        {user.status}
                      </span>
                    ) : (
                      <select
                        value={user.status}
                        className={`form-select fw-bold text-capitalize ${user.status === "active"
                          ? "text-success"
                          : user.status === "banned"
                            ? "text-danger"
                            : "text-muted"
                          }`}
                        onChange={(e) =>
                          updateUserField(user._id, "status", e.target.value)
                        }
                      >
                        <option value="active" className="text-success">
                          Hoạt động
                        </option>
                        <option value="banned" className="text-danger">
                          Khóa tài khoản
                        </option>
                        <option value="pending" className="text-muted">
                          Chờ xử lý
                        </option>
                      </select>
                    )}
                  </td>

                  {/* Bị khóa */}
                  <td>
                    {user.role === "admin" ? (
                      <span className="text-success fw-bold">Không</span>
                    ) : (
                      <select
                        value={user.isLocked ? "true" : "false"}
                        className={`form-select fw-bold ${user.isLocked ? "text-danger" : "text-success"
                          }`}
                        onChange={(e) =>
                          updateUserField(
                            user._id,
                            "isLocked",
                            e.target.value === "true"
                          )
                        }
                      >
                        <option value="false" className="text-success">
                          Không
                        </option>
                        <option value="true" className="text-danger">
                          Có
                        </option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content mt-3 gap-2">
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
              variant={
                currentPage === i + 1 ? "primary" : "outline-secondary"
              }
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
    </div>
  );
}
