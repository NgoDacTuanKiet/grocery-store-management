import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { categoryApi } from '../../services/categoryApi';

const CreateCategoryModal = ({ open, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const handleCreateCategory = async (values) => {
        setSubmitting(true);
        try {
            const res = await categoryApi.create(values);
            if (res.success) {
                message.success(res.message || 'Thêm danh mục mới thành công!');
                form.resetFields(); // Xóa sạch dữ liệu ô nhập sau khi tạo xong
                onSuccess();        // Báo cho file cha load lại danh sách mới
                onCancel();         // Đóng popup
            }
        } catch (error) {
            message.error(error.message || 'Thêm danh mục thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title="Thêm Danh mục Sản phẩm mới"
            open={open}
            onCancel={() => {
                form.resetFields(); // Xóa dữ liệu tạm thời nếu bấm Hủy
                onCancel();
            }}
            onOk={() => form.submit()} // Kích hoạt sự kiện onFinish của Form
            confirmLoading={submitting} // Xoay vòng tròn đợi API
            okText="Thêm mới"
            cancelText="Hủy bỏ"
        >
            <Form form={form} layout="vertical" onFinish={handleCreateCategory} style={{ marginTop: 20 }}>
                <Form.Item
                    label="Tên danh mục"
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                >
                    <Input placeholder="Ví dụ: Đồ uống, Thực phẩm khô..." />
                </Form.Item>

                <Form.Item
                    label="Mô tả danh mục"
                    name="description"
                >
                    <Input.TextArea placeholder="Nhập mô tả ngắn về danh mục này (nếu có)" rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateCategoryModal;