"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";

interface FormData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Hàm xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm xác thực input
  const validateForm = (): boolean => {
    const { fullName, username, email, password, confirmPassword } = formData;

    // Kiểm tra fullName
    if (!fullName.trim()) {
      toast.error("Họ và tên không được để trống!", {
        toastId: "fullName-empty",
      });
      return false;
    }
    if (!/^[\p{L}\s]+$/u.test(fullName)) {
      toast.error("Họ và tên chỉ được chứa chữ cái và khoảng trắng!", {
        toastId: "fullName-format",
      });
      return false;
    }

    // Kiểm tra username
    if (!username.trim()) {
      toast.error("Tên đăng nhập không được để trống!", {
        toastId: "username-empty",
      });
      return false;
    }
    if (username.length < 6) {
      toast.error("Tên đăng nhập phải có ít nhất 6 ký tự!", {
        toastId: "username-length",
      });
      return false;
    }
    if (/\s/.test(username)) {
      toast.error("Tên đăng nhập không được chứa khoảng trắng!", {
        toastId: "username-space",
      });
      return false;
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      toast.error("Tên đăng nhập không được chứa ký tự có dấu!", {
        toastId: "username-format",
      });
      return false;
    }

    // Kiểm tra email
    if (!email.trim()) {
      toast.error("Email không được để trống!", { toastId: "email-empty" });
      return false;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      toast.error(
        "Email phải có định dạng hợp lệ và không chứa ký tự có dấu (ví dụ: user@example.com)!",
        {
          toastId: "email-format",
        }
      );
      return false;
    }

    // Kiểm tra password
    if (!password.trim()) {
      toast.error("Mật khẩu không được để trống!", {
        toastId: "password-empty",
      });
      return false;
    }
    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!", {
        toastId: "password-length",
      });
      return false;
    }
    if (/\s/.test(password)) {
      toast.error("Mật khẩu không được chứa khoảng trắng!", {
        toastId: "password-space",
      });
      return false;
    }
    if (!/^[a-zA-Z0-9!@#$%^&*()_+-=]+$/.test(password)) {
      toast.error("Mật khẩu không được chứa ký tự có dấu!", {
        toastId: "password-format",
      });
      return false;
    }

    // Kiểm tra confirmPassword
    if (!confirmPassword.trim()) {
      toast.error("Xác nhận mật khẩu không được để trống!", {
        toastId: "confirmPassword-empty",
      });
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu và xác nhận mật khẩu không khớp!", {
        toastId: "confirmPassword-match",
      });
      return false;
    }
    if (!/^[a-zA-Z0-9!@#$%^&*()_+-=]+$/.test(confirmPassword)) {
      toast.error("Xác nhận mật khẩu không được chứa ký tự có dấu!", {
        toastId: "confirmPassword-format",
      });
      return false;
    }

    return true;
  };

  // Hàm xử lý đăng ký
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra validation
    if (!validateForm()) {
      return;
    }

    const submitData = {
      name: formData.fullName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const contentType = response.headers.get("content-type");

      let data: any;
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Không phải JSON:", text);
        toast.error("Phản hồi từ server không hợp lệ!", {
          toastId: "server-error",
        });
        return;
      }

      if (!response.ok || !data.status) {
        toast.error(data.message || "Đăng ký thất bại!", {
          toastId: "register-failed",
        });
        return;
      }

      toast.success("🎉 Đăng ký thành công! Chuyển về trang đăng nhập!", {
        toastId: "register-success",
      });
      router.push("/login");
    } catch (error: any) {
      console.error("Lỗi đăng ký:", error);
      toast.error(error.message || "Đã có lỗi xảy ra!", {
        toastId: "register-error",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 authentication-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3c67a4] to-[#2d4a7a]" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <h2 className="text-3xl font-bold mb-4">Chào mừng!</h2>
          <p className="text-blue-100 text-sm text-center">
            Tham gia nền tảng Fast-Food để quản lý dự án, cộng tác và truy cập
            các tính năng quản trị.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div className="mb-8">
            <img
              src="https://ext.same-assets.com/2464927738/3409472389.png"
              alt="Logo"
              width={136}
              height={40}
              className="h-10 w-auto"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">Đăng ký</h1>
            <p className="text-gray-600">
              Tham gia ngay để trải nghiệm dịch vụ.
            </p>
          </div>

          <Form onSubmit={handleSubmit} className="space-y-4">
            <Form.Group controlId="formFullName">
              <Form.Label>Họ và tên</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                placeholder="Nhập họ và tên"
                value={formData.fullName}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formUsername">
              <Form.Label>Tên đăng nhập</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="text"
                name="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formPassword">
              <Form.Label>Mật khẩu</Form.Label>
              <div className="relative">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center bg-transparent border-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </Form.Group>

            <Form.Group controlId="formConfirmPassword">
              <Form.Label>Nhập lại mật khẩu</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Xác nhận lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-full bg-[#3c67a4] hover:bg-[#2d4a7a] border-0"
            >
              Đăng ký
            </Button>

            <div className="text-center text-sm text-gray-600 mt-2">
              Bạn đã có tài khoản?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Đăng nhập
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
