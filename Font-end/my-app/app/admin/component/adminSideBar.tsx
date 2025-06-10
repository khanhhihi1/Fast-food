'use client';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHouse, faBarsProgress, faCartShopping, faTicket, faCircleUser,
    faChartSimple, faComments,
    faChevronUp,
    faChevronDown,
    faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import '../admin.css';
import { motion, AnimatePresence } from 'framer-motion';


export default function AdminSideBar() {
    const [collapsed, setCollapsed] = useState(false);
    const [openProductMenu, setOpenProductMenu] = useState(false);
    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
                    <h3 className="text-center">
                        <img
                            className="rounded-circle"
                            src="/logo-admin.jpg"
                            style={{ width: '100px', height: '100px', marginLeft: 50 }}
                            alt="Logo"
                        />
                    </h3>
                    <div className="navbar">
                        <div className="nav-item">
                            <div className="nav-link1">
                                <FontAwesomeIcon icon={faHouse} style={{ marginTop: '8px', marginLeft: '5px' }} />
                                <Link href="/admin">Dashboard</Link>
                            </div>
                            <div
                                className="nav-link flex items-center justify-between text-gray-700 hover:text-blue-600 cursor-pointer transition"
                                onClick={() => setOpenProductMenu(!openProductMenu)}
                            >
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon style={{ marginTop: '8px', marginLeft: '5px', color: 'rgb(135, 136, 140)' }} icon={faBarsProgress} />
                                    <span style={{ marginLeft: '2px', color: 'rgb(135, 136, 140)' }}>Quản lý sản phẩm</span>
                                </div>
                                <FontAwesomeIcon style={{ color: 'rgb(135, 136, 140)' }} icon={openProductMenu ? faChevronUp : faChevronDown} />
                            </div>

                            <AnimatePresence>
                                {openProductMenu && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="ml-6 overflow-hidden"
                                    >
                                        <div className="submenu space-y-1 mt-2">
                                            <Link
                                                href="/admin/productAdmin"
                                                className="nav-link2"
                                            >
                                                Sản phẩm đang bán
                                            </Link>
                                            <Link
                                                href="/admin/productAdmin/add"
                                                className="nav-link2"
                                            >
                                                Sản phẩm ngưng bán
                                            </Link>
                                            <Link
                                                href="/admin/productCategory"
                                                className="nav-link2"
                                            >
                                                Danh mục sản phẩm
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faCartShopping}
                                    style={{ marginTop: '8px', marginLeft: '5px', color: 'rgb(135, 136, 140)' }}
                                />
                                <Link style={{ marginLeft: '2px', color: 'rgb(135, 136, 140)' }} href="#">
                                    Quản lý đơn hàng
                                </Link>
                            </div>

                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faTicket}
                                    style={{ marginTop: '8px', marginLeft: '5px', color: 'rgb(135, 136, 140)' }}
                                />
                                <Link style={{ marginLeft: '2px', color: 'rgb(135, 136, 140)' }} href="#">
                                    Quản lý voucher
                                </Link>
                            </div>

                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faCircleUser}
                                    style={{ marginTop: '8px', marginLeft: '5px', color: 'rgb(135, 136, 140)' }}
                                />
                                <Link style={{ marginLeft: '2px', color: 'rgb(135, 136, 140)' }} href="#">
                                    Quản lý người dùng
                                </Link>
                            </div>

                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faChartSimple}
                                    style={{ marginTop: '8px', marginLeft: '5px', color: 'rgb(135, 136, 140)' }}
                                />
                                <Link style={{ marginLeft: '2px', color: 'rgb(135, 136, 140)' }} href="#">
                                    Thống kê
                                </Link>
                            </div>

                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faComments}
                                    style={{ marginTop: '8px', marginLeft: '5px', color: 'rgb(135, 136, 140)' }}
                                />
                                <Link style={{ marginLeft: '2px', color: 'rgb(135, 136, 140)' }} href="#">
                                    Đánh giá
                                </Link>
                            </div>

                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faRightFromBracket}
                                    style={{ marginTop: '8px', marginLeft: '5px', color: 'rgb(135, 136, 140)' }}
                                />
                                <Link style={{ marginLeft: '2px', color: 'rgb(135, 136, 140)' }} href="#">
                                    Đăng xuất
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>)
}