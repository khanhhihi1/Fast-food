"use client";
import { useState, useEffect, useRef } from "react";
import { Button, Card, Form } from "react-bootstrap";
import styles from "../styles/chat.module.css";
import { BsChatDots, BsX, BsSend } from "react-icons/bs";

interface ChatMessage {
  type: "user" | "admin";
  content: string;
  timestamp: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/users/profile`, {
          method: "GET",
          credentials: "include", // Gửi cookie tự động
        });

        if (!res.ok) {
          throw new Error("Không lấy được thông tin người dùng");
        }

        const data = await res.json();

        if (data?.status && data?.result) {
          setUserId(data.result._id);
          setUserName(data.result.name);
          setError("");
        } else {
          setError("Vui lòng đăng nhập để sử dụng tính năng chat.");
        }
      } catch (err) {
        setError("Vui lòng đăng nhập để sử dụng tính năng chat.");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (open && userId) {
      fetchHistory();
      const interval = setInterval(fetchHistory, 5000);
      return () => clearInterval(interval);
    }
  }, [open, userId]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/chats/history`, {
        method: "GET",
        credentials: "include", // Sửa: Gửi cookie, xóa header Authorization
      });
      if (!response.ok) throw new Error("Không thể tải lịch sử chat");

      const data: { status: string; result: { sender: string; text: string; timestamp: string }[] } =
        await response.json();

      const mappedMessages: ChatMessage[] = data.result.map((msg) => ({
        type: msg.sender === "user" ? "user" : "admin",
        content: msg.text,
        timestamp: new Date(msg.timestamp).toLocaleTimeString(),
      }));
      setMessages(mappedMessages);
    } catch (error) {
      console.error("Error fetching history:", error);
      setError("Lỗi tải lịch sử chat");
    }
  };

  const toggleChat = () => setOpen(!open);

  const handleSend = async () => {
    if (!userId) {
      setError("Vui lòng đăng nhập để gửi tin nhắn.");
      return;
    }
    if (!input.trim()) {
      return;
    }

    const userMessage: ChatMessage = {
      type: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const msgToSend = input;
    setInput("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/chats/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Sửa: Gửi cookie, xóa header Authorization
        body: JSON.stringify({ message: msgToSend }), // Sửa: Không cần userId/userName, back-end lấy từ token
      });
      if (!response.ok) {
        throw new Error((await response.json()).message || "Không thể gửi tin nhắn");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error instanceof Error ? error.message : "Lỗi gửi tin nhắn";
      setMessages((prev) => prev.slice(0, -1));
      setError(`Lỗi: ${errorMessage}`);
    }
  };

  return (
    <div className={styles.chatContainer}>
      {!open && (
        <Button
          variant="primary"
          className={styles.chatButton}
          onClick={toggleChat}
        >
          <BsChatDots size={22} />
        </Button>
      )}

      {open && (
        <Card className={styles.chatBox}>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>Hỗ trợ trực tuyến</span>
            <Button variant="light" size="sm" className={styles.closeBtn} onClick={toggleChat}>
              <BsX size={20} />
            </Button>
          </Card.Header>

          <Card.Body ref={chatBodyRef} className={styles.chatBody}>
            {!userId && <div className="text-danger text-center p-3">{error}</div>}

            {userId && messages.length === 0 && (
              <div className="text-muted text-center">Bắt đầu cuộc trò chuyện...</div>
            )}
            {userId &&
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`${styles.message} ${msg.type === "user" ? styles.userMessage : styles.aiMessage
                    }`}
                >
                  <div className={styles.messageContent}>{msg.content}</div>
                  <div
                    className={`${styles.messageMeta} ${msg.type === "user" ? styles.userMeta : styles.aiMeta
                      }`}
                  >
                    <small className={styles.messageTimestamp}>{msg.timestamp}</small>
                  </div>
                </div>
              ))}
          </Card.Body>

          <Card.Footer className="d-flex gap-2">
            <Form.Control
              type="text"
              value={input}
              placeholder={!userId ? "Vui lòng đăng nhập" : "Nhập tin nhắn..."}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={!userId}
            />
            <Button onClick={handleSend} variant="primary" disabled={!userId}>
              <BsSend />
            </Button>
          </Card.Footer>
        </Card>
      )}
    </div>
  );
}