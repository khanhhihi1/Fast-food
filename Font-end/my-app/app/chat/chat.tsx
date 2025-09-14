"use client";
import { useState } from "react";
import { Button, Card, Form, ListGroup } from "react-bootstrap";
import styles from "../styles/chat.module.css";
import { BsChatDots, BsX, BsSend } from "react-icons/bs";

interface Product {
  name: string;
  price: number;
  imageUrl?: string;
}

interface ChatMessage {
  type: "user" | "ai";
  content: string;
  products?: Product[];
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const toggleChat = () => setOpen(!open);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage: ChatMessage = { type: "user", content: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      try {
        const response = await fetch(`${API_URL}/products/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        });

        const data = await response.json();
        const aiMessage: ChatMessage = {
          type: "ai",
          content: data.message,
          products: data.products,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { type: "ai", content: "Lỗi kết nối" },
        ]);
      }
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
            <span>Chat Box</span>
            <Button
              variant="light"
              size="sm"
              className={styles.closeBtn}
              onClick={toggleChat}
            >
              <BsX size={20} />
            </Button>
          </Card.Header>

          <Card.Body className={styles.chatBody}>
            {messages.length === 0 && (
              <div className="text-muted text-center">
                Bắt đầu cuộc trò chuyện...
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`${styles.message} ${
                  msg.type === "user" ? styles.userMessage : styles.aiMessage
                }`}
              >
                {msg.type === "user" ? "Bạn: " : "AI: "}
                {msg.content}
                {msg.products && (
                  <ListGroup className="mt-2">
                    {msg.products.map((product, pIdx) => (
                      <ListGroup.Item key={pIdx}>
                        {product.name} - {product.price} VND
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            style={{ width: "50px", marginLeft: "10px" }}
                          />
                        )}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>
            ))}
          </Card.Body>

          <Card.Footer className="d-flex gap-2">
            <Form.Control
              type="text"
              value={input}
              placeholder="Nhập tin nhắn..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend} variant="primary">
              <BsSend />
            </Button>
          </Card.Footer>
        </Card>
      )}
    </div>
  );
}
