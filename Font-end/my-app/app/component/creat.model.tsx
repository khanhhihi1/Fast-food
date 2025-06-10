import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify"

interface iShow {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
}
function Modals(props: iShow) {
    const { showModal, setShowModal } = props;
    const [maSoSinhVien, setMaSoSinhVien] = useState<string>("");
    const [hoTen, setHoTen] = useState<string>("");
    const [ngaySinh, setNgaySinh] = useState<string>("");
    const [dienThoai, setDienThoai] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [diaChi, setDiaChi] = useState<string>("");
    const [lopHoc, setLopHoc] = useState<string>("");
    const [monHoc, setMonHoc] = useState<string>("");
    const [diemCuoiKhoa, setDiemCuoiKhoa] = useState<string>("");
    const handelSubmit = () => {
        fetch('http://localhost:9000/Student', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                maSoSinhVien, hoTen, ngaySinh, dienThoai, email, diaChi, lopHoc, monHoc, diemCuoiKhoa
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Có lỗi xảy ra khi thêm sản phẩm");
                }
                window.location.reload();
                toast.success("Them san pham thanh cong!");
                return response.json();
            })
            .then(data => {
                console.log("Sản phẩm đã thêm:", data);
            })
            .catch(error => {
                console.error("Lỗi:", error);
                toast.error("Thêm sản phẩm thất bại");
            });
    };

    const handelFalse = () => {
        toast.error("thatbai")
    }

    const handleClose = () => {
        setHoTen("");
        setMaSoSinhVien("");
        setNgaySinh("");
        setDienThoai("");
        setEmail("");
        setDiaChi("");
        setLopHoc("");
        setMonHoc("");
        setDiemCuoiKhoa("");
        setShowModal(false);
    };
    return (
        <>
            <Modal
                show={showModal}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Mã số sinh viên </Form.Label>
                            <Form.Control type="text" placeholder="mssv" value={maSoSinhVien} onChange={(e) => setMaSoSinhVien(e.target.value)} />
                            <Form.Label>Họ tên </Form.Label>
                            <Form.Control type="text" placeholder="Họ tên" value={hoTen} onChange={(e) => setHoTen(e.target.value)} />
                            <Form.Label>Ngày sinh </Form.Label>
                            <Form.Control type="text" placeholder="Ngày sinh" value={ngaySinh} onChange={(e) => setNgaySinh(e.target.value)} />
                            <Form.Label>Số điện thoại </Form.Label>
                            <Form.Control type="text" placeholder="Số điên thoại" value={dienThoai} onChange={(e) => setDienThoai(e.target.value)} />
                            <Form.Label>Email </Form.Label>
                            <Form.Control type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            <Form.Label>Địa chỉ</Form.Label>
                            <Form.Control type="text" placeholder="Địa chỉ" value={diaChi} onChange={(e) => setDiaChi(e.target.value)} />
                            <Form.Label>Lớp học</Form.Label>
                            <Form.Control type="text" placeholder="Lớp Học" value={lopHoc} onChange={(e) => setLopHoc(e.target.value)} />
                            <Form.Label>Môn học</Form.Label>
                            <Form.Control type="text" placeholder="Môn Học" value={monHoc} onChange={(e) => setMonHoc(e.target.value)} />
                            <Form.Label>Điểm cuối khóa</Form.Label>
                            <Form.Control type="text" placeholder="Điểm Cuối Khóa" value={diemCuoiKhoa} onChange={(e) => setDiemCuoiKhoa(e.target.value)} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handelFalse}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handelSubmit}>
                        Update
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Modals;
