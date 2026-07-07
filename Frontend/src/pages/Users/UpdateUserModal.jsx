import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { userApi } from '../../services/userApi';

const UpdateUserModal = ({ open, onCancel, onSuccess, userData }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open && userData) {
            form.setFieldsValue({
                fullName: userData.fullName,
                username: userData.username, // Username vẫn bơm vào để hiện ra, nhưng sẽ khóa ở giao diện
            });
        }
    }, [open, userData, form]);

    const handleUpdateStaff = async (values) => {
        setSubmitting(true);
        try {
            // Gọi API Update kèm theo ID của nhân viên đang sửa
            // Lưu ý: Biến values lúc này chỉ chứa fullName vì username đã bị disabled (khóa)
            const res = await userApi.update(userData.id, values);
            
            if (res.success) {
                message.success('Cập nhật thông tin nhân viên thành công!');
                form.resetFields(); 
                onSuccess();        
                onCancel();         
            }
        } catch (error) {
            message.error(error.message || 'Cập nhật thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title="Cập nhật thông tin Nhân viên"
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={() => form.submit()}
            confirmLoading={submitting}
            okText="Lưu thay đổi"
            cancelText="Hủy bỏ"
        >
            <Form form={form} layout="vertical" onFinish={handleUpdateStaff} style={{ marginTop: 20 }}>
                
                {/* Tên đăng nhập: Hiển thị nhưng khóa cứng không cho sửa */}
                <Form.Item
                    label="Tên đăng nhập (Username)"
                    name="username"
                >
                    <Input disabled style={{ backgroundColor: '#f5f5f5', color: '#888' }} />
                </Form.Item>

                {/* Họ và tên: Cho phép sửa bình thường */}
                <Form.Item
                    label="Họ và tên nhân viên"
                    name="fullName"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                    <Input placeholder="Nhập họ và tên mới" />
                </Form.Item>

            </Form>
        </Modal>
    );
};

export default UpdateUserModal;