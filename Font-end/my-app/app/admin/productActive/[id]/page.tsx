'use client'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import useSWR, { Fetcher } from "swr";
import './item.css'
import { Row, Col, Image, Container, Navbar, InputGroup, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse, faBarsProgress, faArrowLeft, faCartShopping, faTicket,
    faCircleUser, faChartSimple, faComments, faDollarSign, faTruck, faMagnifyingGlass,
    faBell, faBars, faSearch, faDollar, faPenToSquare, faTrash, faEye
} from "@fortawesome/free-solid-svg-icons";
interface PostType {
    id: number;
    name: string;
    image: string;
    price: number;
    description: string;
    category: string;
    quanlity:string;
}

const PostDetail = ({ params }: { params: { id: string } }) => {
    const fetcher: Fetcher<PostType, string> = (url) => fetch(url).then(res => res.json());
    const { data, error, isLoading } = useSWR(
        `http://localhost:9000/Product/${params.id}`, fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    }
    );

    if (isLoading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p>Lỗi khi tải dữ liệu!</p>;
    if (!data) return <p>Không tìm thấy sản phẩm!</p>;

    return (
        <>
            <div className="d-flex">
                <div className="sidebar">
                    <h3 className="text-center">
                        <img
                            className="rounded-circle"
                            src="/logo-admin.jpg"
                            style={{ width: "100px", height: "100px", marginLeft: 50 }}
                            alt="Logo"
                        />
                    </h3>
                    <div className="navbar">
                        <div className="nav-item">
                            <div className="nav-link">
                                <FontAwesomeIcon icon={faHouse} style={{ marginTop: "8px", marginLeft: "5px" }} />
                                <a href="/admin">Dashboard</a>
                            </div>
                            <div className="nav-link1">
                                <FontAwesomeIcon
                                    icon={faBarsProgress}
                                    style={{ marginTop: "8px", marginLeft: "5px", color: "rgb(135, 136, 140)" }}
                                />
                                <a style={{ marginLeft: "2px" }} href="#">
                                    Quản lý sản phẩm
                                </a>
                            </div>
                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faCartShopping}
                                    style={{ marginTop: "8px", marginLeft: "5px", color: "rgb(135, 136, 140)" }}
                                />
                                <a style={{ marginLeft: "2px", color: "rgb(135, 136, 140)" }} href="#">
                                    Quản lý đơn hàng
                                </a>
                            </div>
                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faTicket}
                                    style={{ marginTop: "8px", marginLeft: "5px", color: "rgb(135, 136, 140)" }}
                                />
                                <a style={{ marginLeft: "2px", color: "rgb(135, 136, 140)" }} href="#">
                                    Quản lý voucher
                                </a>
                            </div>
                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faCircleUser}
                                    style={{ marginTop: "8px", marginLeft: "5px", color: "rgb(135, 136, 140)" }}
                                />
                                <a style={{ marginLeft: "2px", color: "rgb(135, 136, 140)" }} href="#">
                                    Quản lý user
                                </a>
                            </div>
                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faChartSimple}
                                    style={{ marginTop: "8px", marginLeft: "5px", color: "rgb(135, 136, 140)" }}
                                />
                                <a style={{ marginLeft: "2px", color: "rgb(135, 136, 140)" }} href="#">
                                    Thống kê
                                </a>
                            </div>
                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faComments}
                                    style={{ marginTop: "8px", marginLeft: "5px", color: "rgb(135, 136, 140)" }}
                                />
                                <a style={{ marginLeft: "2px", color: "rgb(135, 136, 140)" }} href="#">
                                    Đánh giá
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <Container className="content w-100">
                    <Navbar className="navbar" style={{ marginRight: "10px" }}>
                        <Container fluid className="container-fluid">
                            <InputGroup className="input-group w-50">
                                <span className="input-group-text">
                                    <FontAwesomeIcon
                                        icon={faSearch}
                                    />
                                </span>
                                <Form.Control type="search" className="form-control" placeholder="Tìm kiếm..." />
                            </InputGroup>
                            <div className="hihi">
                                <span className="me-3">
                                    <FontAwesomeIcon
                                        icon={faBell}
                                        style={{ fontSize: 24 }}
                                    />
                                </span>
                                <span>
                                    <img
                                        src="/avt.jpg"
                                        className="rounded-circle"
                                        alt="Cinque Terre"
                                        style={{ width: "50px", height: "50px", marginTop: "-19px", marginRight: "12px" }}
                                    />
                                </span>
                                <span>
                                    <FontAwesomeIcon
                                        icon={faBars}
                                        style={{ fontSize: 24 }}
                                    />
                                </span>
                            </div>
                        </Container>
                    </Navbar>
                    <Button className="back" variant="secondary" onClick={() => window.history.back()}>
                        <FontAwesomeIcon
                            icon={faArrowLeft}

                        />
                    </Button>
                    <div className="row">
                        <Row className="mt-3">
                            <Col md={6}>
                                <Image style={{ borderRadius: "7px" }} src={data.image} alt={data.name} fluid />
                            </Col>
                            <Col md={6}>
                                <h2>{data.name}</h2>
                                <h4 className="text-danger">{data.price}₫</h4>
                                <p>{data.description || "Không có mô tả"}</p>
                                <div className="cate" style={{ display: "flex" }}>
                                    <p style={{ fontSize: "17px", fontWeight: "bold" }}>ID sản phẩm : </p>
                                    <p className="text-danger" style={{ fontSize: "17px", marginLeft: "5px" }}>{data.id}</p>
                                </div>
                                <div className="cate" style={{ display: "flex" }}>
                                    <p style={{ fontSize: "17px", fontWeight: "bold" }}>Danh mục : </p>
                                    <p className="text-danger" style={{ fontSize: "17px", marginLeft: "5px" }}>{data.category}</p>
                                </div>
                                <div className="cate" style={{ display: "flex" }}>
                                    <p style={{ fontSize: "17px", fontWeight: "bold" }}>Số lượng sản phẩm : </p>
                                    <p className="text-danger" style={{ fontSize: "17px", marginLeft: "5px" }}>{data.quanlity}</p>
                                </div>


                            </Col>
                        </Row>
                    </div>
                </Container>
            </div>
        </>
    );
}

export default PostDetail;
