"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button, Form, Modal } from "react-bootstrap";

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
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOTP] = useState("");
  const [tempData, setTempData] = useState<any>(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // handle change input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error khi nhập
  };

  // validate
  const validateForm = (): boolean => {
    const { fullName, username, email, password, confirmPassword } = formData;
    const newErrors: Partial<FormData> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Họ và tên không được để trống!";
    } else if (!/^[\p{L}\s]+$/u.test(fullName)) {
      newErrors.fullName = "Họ và tên chỉ được chứa chữ cái và khoảng trắng!";
    }

    if (!username.trim()) {
      newErrors.username = "Tên đăng nhập không được để trống!";
    } else if (username.length < 6) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 6 ký tự!";
    } else if (/\s/.test(username)) {
      newErrors.username = "Tên đăng nhập không được chứa khoảng trắng!";
    } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
      newErrors.username = "Tên đăng nhập không được chứa ký tự có dấu!";
    }

    if (!email.trim()) {
      newErrors.email = "Email không được để trống!";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      newErrors.email =
        "Email phải có định dạng hợp lệ (ví dụ: user@example.com)!";
    }

    if (!password.trim()) {
      newErrors.password = "Mật khẩu không được để trống!";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự!";
    } else if (/\s/.test(password)) {
      newErrors.password = "Mật khẩu không được chứa khoảng trắng!";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Xác nhận mật khẩu không được để trống!";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu và xác nhận mật khẩu không khớp!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitData = {
      name: formData.fullName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    try {
      const response = await fetch(`${API_URL}/users/register/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!data.status) {
        setErrors({ email: data.message || "Gửi OTP thất bại!" });
        return;
      }

      setTempData(data.tempData);
      setShowOTPModal(true);
    } catch (error: any) {
      setErrors({ email: error.message || "Đã có lỗi xảy ra!" });
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await fetch(`${API_URL}/users/register/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp, tempData }),
      });

      const data = await response.json();

      if (!data.status) {
        setErrors({ confirmPassword: data.message || "Xác thực OTP thất bại!" });
        return;
      }

      setShowOTPModal(false);
      router.push("/login");
    } catch (error: any) {
      setErrors({ confirmPassword: error.message || "Đã có lỗi xảy ra!" });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 authentication-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3c67a4] to-[#2d4a7a]" />
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <div className="mb-8 relative illustration-float">
            <div className="w-80 h-80 relative">
              <div className="absolute top-8 left-8 w-64 h-48 bg-gray-800 rounded-lg shadow-2xl transform rotate-3">
                <div className="w-full h-8 bg-gray-700 rounded-t-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
                <div className="p-4 bg-white rounded-b-lg h-40">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full mb-2 flex items-center justify-center">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full" />
                    </div>
                    <div className="text-xs text-gray-800 font-semibold mb-2">
                      RESGISTER

                    </div>
                    <div className="w-32 h-2 bg-gray-200 rounded mb-1" />
                    <div className="w-32 h-2 bg-gray-200 rounded mb-3" />
                    <div className="w-20 h-6 bg-yellow-400 rounded text-xs flex items-center justify-center text-white font-semibold">
                      RESGISTER
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 right-8 w-32 h-40">
                <div className="w-full h-full relative">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-yellow-400 rounded-full" />
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-12 h-16 bg-yellow-400 rounded-lg" />
                  <div className="absolute top-8 left-2 w-6 h-2 bg-yellow-400 rounded" />
                  <div className="absolute top-8 right-2 w-6 h-2 bg-yellow-400 rounded" />
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-12 bg-gray-800 rounded-b-full" />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-gray-700 rounded" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-16 h-20">
                <div className="w-8 h-12 bg-yellow-600 rounded-t-full mx-auto" />
                <div className="w-12 h-8 bg-gray-800 rounded mx-auto" />
              </div>
            </div>
          </div>
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Đăng ký</h2>
            <p className="text-blue-100 text-sm leading-relaxed opacity-80">
              Chào mừng đến với nền tảng Fast-Food của chúng tôi! Đăng nhập để
              quản lý dự án Fast-Food, cộng tác với chúng tôi và truy cập bảng
              điều khiển của bạn.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">Đăng ký</h1>
            <p className="text-gray-600">Tạo tài khoản mới để bắt đầu.</p>
          </div>

          <Form onSubmit={handleSubmit} className="space-y-4">
            <Form.Group controlId="formFullName">
              <Form.Label className="fw-medium ">Họ và tên</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                placeholder="Nhập họ và tên"
                value={formData.fullName}
                onChange={handleChange}
                isInvalid={!!errors.fullName}

              />
              {errors.fullName && (
                <div className="text-sm text-red-500 mt-1">
                  {errors.fullName}
                </div>
              )}
            </Form.Group>

            <Form.Group controlId="formUsername">
              <Form.Label className="fw-medium ">Tên đăng nhập</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                isInvalid={!!errors.username}

              />
              {errors.username && (
                <div className="text-sm text-red-500 mt-1">
                  {errors.username}
                </div>
              )}
            </Form.Group>

            <Form.Group controlId="formEmail">
              <Form.Label className="fw-medium ">Email</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
              />
              {errors.email && (
                <div className="text-sm text-red-500 mt-1">{errors.email}</div>
              )}
            </Form.Group>

            <Form.Group controlId="formPassword">
              <Form.Label className="fw-medium ">Mật khẩu</Form.Label>
              <div className="relative">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nhập mật khẩu"
                  isInvalid={!!errors.password}
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
              {errors.password && (
                <div className="text-sm text-red-500 mt-1">
                  {errors.password}
                </div>
              )}
            </Form.Group>

            <Form.Group controlId="formConfirmPassword">
              <Form.Label className="fw-medium ">Nhập lại mật khẩu</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                isInvalid={!!errors.confirmPassword}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <div className="text-sm text-red-500 mt-1">
                  {errors.confirmPassword}
                </div>
              )}
            </Form.Group>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 border-0 text-white"
            >
              Đăng ký
            </Button>

            <div className="text-center text-sm text-gray-600 mt-2">
              Bạn đã có tài khoản?{" "}
              <Link href="/login" className="text-red-600 hover:underline">
                Đăng nhập
              </Link>
            </div>
          </Form>

          {/* OTP Modal */}
          <Modal show={showOTPModal} onHide={() => setShowOTPModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Xác thực OTP</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group controlId="formOTP">
                <Form.Label className="fw-medium ">Nhập mã OTP từ email</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập OTP"
                  value={otp}
                  onChange={(e) => setOTP(e.target.value)}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowOTPModal(false)}
              >
                Đóng
              </Button>
              <Button
                variant="danger"
                className="bg-red-600 border-0"
                onClick={handleVerifyOTP}
              >
                Xác thực
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}
