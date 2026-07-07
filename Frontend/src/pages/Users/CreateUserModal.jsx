import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { userApi } from '../../services/userApi';

// Component này nhận vào 3 "mệnh lệnh" (props) từ file cha (Users.jsx)
const CreateUserModal = ({ open, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const handleCreateStaff = async (values) => {
        setSubmitting(true);
        try {
            values.password = 'Grocery!123';
            const res = await userApi.create(values);
            if (res.success) {
                message.success('Tạo tài khoản nhân viên mới thành công!');
                form.resetFields(); // Dọn dẹp form
                onSuccess();        
                onCancel();         
            }
        } catch (error) {
            message.error(error.message || 'Tạo nhân viên thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title="Thêm Nhân viên mới"
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={() => form.submit()} 
            confirmLoading={submitting}
            okText="Lưu lại"
            cancelText="Hủy bỏ"
        >
            <Form form={form} layout="vertical" onFinish={handleCreateStaff} style={{ marginTop: 20 }}>
                <Form.Item
                    label="Họ và tên nhân viên"
                    name="fullName"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                    <Input placeholder="Ví dụ: Nguyễn Văn A" />
                </Form.Item>

                <Form.Item
                    label="Tên đăng nhập (Username)"
                    name="username"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                >
                    <Input placeholder="Ví dụ: nv_nguyenvana" />
                </Form.Item>

                {/* <Form.Item
                    label="Mật khẩu ban đầu"
                    name="password"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu!' },
                        { min: 6, message: 'Mật khẩu phải chứa ít nhất 6 ký tự!' }
                    ]}
                >
                    <Input.Password placeholder="Nhập mật khẩu cho nhân viên" />
                </Form.Item> */}
            </Form>
        </Modal>
    );
};

export default CreateUserModal;