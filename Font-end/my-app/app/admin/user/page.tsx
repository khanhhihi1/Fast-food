"use client";
import React, { useEffect, useState } from "react";
import { Button, Container, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserShield,
  faUser,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import AdminNavbar from "../../component/adminNavbar";
import AdminSideBar from "../../component/adminSideBar";
import "../admin.css";
import useDarkMode from "../useDarkMode/page";

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
      fetchUsers(); // refresh lại danh sách
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi cập nhật người dùng");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const totalPages = Math.ceil(users.length / usersPerPage);
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = users.slice(indexOfFirst, indexOfLast);

  return (
    <div className="d-flex dark-mode">
      <AdminSideBar />
      <Container
        fluid
        className={`content w-100 container-content ${
          collapsed ? "collapsed-content" : ""
        }`}
      >
        <AdminNavbar />
        <h4 className="text-center mt-4">Danh sách người dùng</h4>

        <Table striped bordered hover responsive className="mt-3 text-center">
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
                    <span className="text-danger fw-bold">
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
                        User
                      </option>
                      <option value="staff" className="text-warning">
                        Staff
                      </option>
                    </select>
                  )}
                </td>

                {/* Trạng thái */}
                <td>
                  {user.role === "admin" ? (
                    <span className="fw-bold text-success">{user.status}</span>
                  ) : (
                    <select
                      value={user.status}
                      className={`form-select fw-bold text-capitalize ${
                        user.status === "active"
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
                        active
                      </option>
                      <option value="banned" className="text-danger">
                        banned
                      </option>
                      <option value="pending" className="text-muted">
                        pending
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
                      className={`form-select fw-bold ${
                        user.isLocked ? "text-danger" : "text-success"
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
    </div>
  );
}
