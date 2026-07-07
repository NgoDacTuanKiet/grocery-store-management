import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { categoryApi } from '../../services/categoryApi';

const UpdateCategoryModal = ({ open, onCancel, onSuccess, categoryData }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    // Lắng nghe sự thay đổi: Cứ hễ mở popup lên và có dữ liệu thì bơm vào Form
    useEffect(() => {
        if (open && categoryData) {
            form.setFieldsValue({
                name: categoryData.name,
                description: categoryData.description,
            });
        }
    }, [open, categoryData, form]);

    const handleUpdateCategory = async (values) => {
        setSubmitting(true);
        try {
            // Gọi API Update kèm ID của danh mục đang sửa
            const res = await categoryApi.update(categoryData.id, values);
            if (res.success) {
                message.success(res.message || 'Cập nhật danh mục thành công!');
                form.resetFields(); 
                onSuccess();        
                onCancel();         
            }
        } catch (error) {
            message.error(error.message || 'Cập nhật danh mục thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title="Sửa Danh mục Sản phẩm"
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
            <Form form={form} layout="vertical" onFinish={handleUpdateCategory} style={{ marginTop: 20 }}>
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

export default UpdateCategoryModal;