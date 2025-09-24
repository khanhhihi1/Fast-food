"use client";
import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import styles from "../styles/contact.module.css";
import AdminSideBar from "../../component/adminSideBar";
import AdminNavbar from "../../component/adminNavbar";

interface User {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  replied: boolean;
}

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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchContacts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/chats/contacts`);
      if (!response.ok) throw new Error("Không thể tải danh sách liên hệ");
      const data: User[] = await response.json();
      setUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user: User) => {
    setSelectedUser(user);
    setMessages([]);
    setError("");
    await fetchMessages(user.id);
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/chats/${userId}`);
      if (!response.ok) throw new Error("Không thể tải tin nhắn");
      const data: { messages: { sender: string; text: string; timestamp: Date }[] } = await response.json();
      const mappedMessages: Message[] = data.messages.map((msg, idx) => ({
        id: idx,
        text: msg.text,
        time: new Date(msg.timestamp).toLocaleTimeString(),
        incoming: msg.sender === "user",
      }));
      setMessages(mappedMessages);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
      console.error("Error fetching messages:", err);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      const interval = setInterval(() => fetchMessages(selectedUser.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  const handleSend = async () => {
    if (!input.trim() || !selectedUser) {
      setError("Vui lòng nhập tin nhắn và chọn người dùng");
      return;
    }
    setError("");
    try {
      const response = await fetch(`${API_URL}/chats/${selectedUser.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: input }),
      });
      if (!response.ok) throw new Error("Không thể gửi tin nhắn");

      const newMsg: Message = {
        id: Date.now(),
        text: input,
        time: new Date().toLocaleTimeString(),
        incoming: false,
      };
      setMessages((prev) => [...prev, newMsg]);
      setInput("");

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === selectedUser.id
            ? { ...u, lastMessage: input, time: new Date().toLocaleTimeString(), replied: true }
            : u
        )
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi gửi tin nhắn");
      console.error("Error sending reply:", err);
    }
  };

  return (
    <div className="d-flex">
      <AdminSideBar />
      <div className={`${styles.content} flex-grow-1`}>
        <AdminNavbar />
        <Container fluid className="h-100">
          <Row className="h-100">
            <Col md={4} lg={3} className="border-end bg-white p-0">
              <div className="p-3 border-bottom">
                <h5 className="fw-bold">Liên hệ</h5>
                <Form.Control type="text" placeholder="Tìm kiếm liên hệ..." className="mt-2" />
              </div>
              <div>
                {loading ? (
                  <p className="p-3">Đang tải...</p>
                ) : error ? (
                  <p className="p-3 text-danger">{error}</p>
                ) : users.length === 0 ? (
                  <p className="p-3 text-muted">Không có liên hệ nào</p>
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
                      <div
                        className={user.replied ? styles.repliedDot : styles.unrepliedDot}
                      ></div>
                    </div>
                  ))
                )}
              </div>
            </Col>
            <Col md={8} lg={9} className="d-flex flex-column p-0">
              {!selectedUser ? (
                <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center bg-light">
                  <i className="bi bi-chat-dots text-secondary fs-1 mb-3"></i>
                  <h5 className="text-muted">Chọn một người dùng để chat</h5>
                </div>
              ) : (
                <div className="d-flex flex-column h-100">
                  <div className="d-flex align-items-center border-bottom p-3 bg-white">
                    <div>
                      <div className="fw-medium">{selectedUser.name}</div>
                      <small className="text-muted">
                        {selectedUser.replied ? "Đã trả lời" : "Chưa trả lời"}
                      </small>
                    </div>
                  </div>
                  <div className="flex-grow-1 overflow-auto p-3">
                    {messages.length === 0 && !error && (
                      <div className="text-muted text-center">Chưa có tin nhắn</div>
                    )}
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
                  <div className="border-top p-3 bg-white d-flex">
                    <Form.Control
                      type="text"
                      placeholder="Nhập tin nhắn..."
                      className="me-2"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <Button onClick={handleSend}>Gửi</Button>
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