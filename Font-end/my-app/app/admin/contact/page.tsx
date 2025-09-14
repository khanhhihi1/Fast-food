"use client";
import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import styles from "../styles/contact.module.css";
import AdminSideBar from "../../component/adminSideBar";
import AdminNavbar from "../../component/adminNavbar";

// Type cho User
interface User {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  replied: boolean; // ✅ thêm trạng thái đã trả lời
}

// Type cho Message
interface Message {
  id: string | number;
  text: string;
  time: string;
  incoming: boolean;
}

export default function AdminContactPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/contacts`);
      const data: {
        id: string;
        name: string;
        lastMessage: string;
        time: string;
        replied: boolean;
      }[] = await response.json();

      if (!response.ok) throw new Error("Failed to fetch contacts");

      const mappedUsers: User[] = data.map((contact) => ({
        id: contact.id,
        name: contact.name,
        lastMessage: contact.lastMessage,
        time: contact.time,
        replied: contact.replied, // ✅ lấy trạng thái từ backend
      }));

      setUsers(mappedUsers);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user: User) => {
    setSelectedUser(user);
    setMessages([]);
    setError("");
    try {
      const response = await fetch(`${API_URL}/contacts/${user.id}`);
      const data: Message[] = await response.json();

      if (!response.ok) throw new Error("Failed to fetch messages");
      setMessages(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedUser) return;
    setError("");
    try {
      const response = await fetch(`${API_URL}/contacts/${selectedUser.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: input }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to send reply");

      const newMsg: Message = {
        id: Date.now(),
        text: input,
        time: "Just now",
        incoming: false,
      };
      setMessages((prev) => [...prev, newMsg]);
      setInput("");

      // ✅ Cập nhật trạng thái user thành "đã trả lời"
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === selectedUser.id
            ? { ...u, lastMessage: input, time: "Just now", replied: true }
            : u
        )
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    }
  };

  return (
    <div className="d-flex">
      {/* Sidebar cố định */}
      <AdminSideBar />

      {/* Nội dung */}
      <div className={`${styles.content} flex-grow-1`}>
        <AdminNavbar />

        <Container fluid className="h-100">
          <Row className="h-100">
            {/* Danh sách user */}
            <Col md={4} lg={3} className="border-end bg-white p-0">
              <div className="p-3 border-bottom">
                <h5 className="fw-bold">Liên hệ</h5>
                <Form.Control type="text" placeholder="Search contacts..." className="mt-2" />
              </div>
              <div>
                {loading ? (
                  <p className="p-3">Loading...</p>
                ) : error ? (
                  <p className="p-3 text-danger">{error}</p>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`d-flex align-items-center p-3 ${styles.userItem} ${
                        selectedUser?.id === user.id ? styles.selectedUser : ""
                      }`}
                    >
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between">
                          <span className="fw-medium">{user.name}</span>
                          <small className="text-muted">{user.time}</small>
                        </div>
                        <small className="text-muted text-truncate">{user.lastMessage}</small>
                      </div>
                      {/* ✅ Hiển thị dot trạng thái: đỏ nếu chưa trả lời, xám nếu đã trả lời */}
                      <div
                        className={user.replied ? styles.repliedDot : styles.unrepliedDot}
                      ></div>
                    </div>
                  ))
                )}
              </div>
            </Col>

            {/* Chat */}
            <Col md={8} lg={9} className="d-flex flex-column p-0">
              {!selectedUser ? (
                <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center bg-light">
                  <i className="bi bi-chat-dots text-secondary fs-1 mb-3"></i>
                  <h5 className="text-muted">Select a user to chat</h5>
                </div>
              ) : (
                <div className="d-flex flex-column h-100">
                  {/* Header */}
                  <div className="d-flex align-items-center border-bottom p-3 bg-white">
                    <div>
                      <div className="fw-medium">{selectedUser.name}</div>
                      <small className="text-muted">
                        {selectedUser.replied ? "Đã trả lời" : "Chưa trả lời"}
                      </small>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-grow-1 overflow-auto p-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`d-flex ${
                          msg.incoming ? "justify-content-start" : "justify-content-end"
                        } mb-2`}
                      >
                        <div>
                          <div
                            className={`${
                              msg.incoming ? styles.messageIn : styles.messageOut
                            } px-3 py-2`}
                          >
                            {msg.text}
                          </div>
                          <small className="text-muted d-block text-end">{msg.time}</small>
                        </div>
                      </div>
                    ))}
                    {error && <p className="text-danger text-center">{error}</p>}
                  </div>

                  {/* Input */}
                  <div className="border-top p-3 bg-white d-flex">
                    <Form.Control
                      type="text"
                      placeholder="Type a message..."
                      className="me-2"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <Button onClick={handleSend}>Send</Button>
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
