'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'

export default function SignUpPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Xử lý đăng ký tại đây
        console.log(formData)
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-5/12 authentication-gradient relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3c67a4] to-[#2d4a7a]" />
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#grid)" />
                    </svg>
                </div>
                <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
                     <div className="mb-8 relative illustration-float">
                        <div className="w-80 h-80 relative">
                            {/* Device Frame */}
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
                                        <div className="text-xs text-gray-800 font-semibold mb-2">REGISTER</div>
                                        <div className="w-32 h-2 bg-gray-200 rounded mb-1" />
                                        <div className="w-32 h-2 bg-gray-200 rounded mb-3" />
                                        <div className="w-20 h-6 bg-yellow-400 rounded text-xs flex items-center justify-center text-white font-semibold">
                                            REGISTER
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Character */}
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

                            {/* Plant */}
                            <div className="absolute bottom-0 left-0 w-16 h-20">
                                <div className="w-8 h-12 bg-yellow-600 rounded-t-full mx-auto" />
                                <div className="w-12 h-8 bg-gray-800 rounded mx-auto" />
                            </div>
                        </div>
                    </div>

                    <div className="text-center max-w-md">
                        <h2 className="text-2xl font-semibold mb-4">Đăng ký</h2>
                        <p className="text-blue-100 text-sm leading-relaxed opacity-80">
                            Chào mừng đến với nền tảng Fast-Food của chúng tôi! Đăng nhập để quản lý dự án Fast-Food, cộng tác với chúng tôi và truy cập bảng điều khiển của bạn..
                        </p>
                    </div>
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
                        <h1 className="text-2xl font-semibold text-gray-900">Đăng ký </h1>
                        <p className="text-gray-600">Tham gia ngay để trải nghiệm dịch vụ.</p>
                    </div>

                    <Form onSubmit={handleSubmit} className="space-y-4">
                        <Form.Group controlId="formUsername">
                            <Form.Label>Tên đăng nhập</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                placeholder="Nhập tên đăng nhập"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                placeholder="Nhập email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formPassword">
                            <Form.Label>Mật khẩu</Form.Label>
                            <div className="relative">
                                <Form.Control
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Nhập mật khẩu"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
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
                                required
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
    )
}
