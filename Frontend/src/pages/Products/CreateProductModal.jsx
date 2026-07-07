import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Space, message, Card, Row, Col } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { productApi } from '../../services/productApi';
import { categoryApi } from '../../services/categoryApi';

const CreateProductModal = ({ open, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);

    // Tự động tải danh sách Danh mục (Category) để đưa vào ô Select
    useEffect(() => {
        if (open) {
            const fetchCategories = async () => {
                try {
                    const res = await categoryApi.getAll({ size: 100 });
                    if (res.success) {
                        setCategories(res.data?.content || res.data || []);
                    }
                } catch (error) {
                    message.error('Không thể tải danh sách danh mục!');
                }
            };
            fetchCategories();
        }
    }, [open]);

    const handleCreateProduct = async (values) => {
        setSubmitting(true);
        try {
            // Chuyển đổi dữ liệu form FE thành DTO Backend yêu cầu
            const payload = {
                name: values.name,
                categoryId: values.categoryId,
                description: values.description,
                // Quét danh sách phân loại và đóng gói lại
                productDetails: values.details.map(detail => ({
                    // Map chuỗi Tên phân loại thành Map<String, String> attributes
                    attributes: { "Phân loại": detail.variantName || "Mặc định",
                                    "Đơn vị": detail.unit || "Cái"
                    },
                    costPrice: detail.costPrice || 0,
                    price: detail.price || 0,
                    stockQuantity: detail.stockQuantity || 0
                }))
            };

            const res = await productApi.create(payload);
            if (res.success) {
                message.success('Thêm sản phẩm mới thành công!');
                form.resetFields(); 
                onSuccess();        
                onCancel();         
            }
        } catch (error) {
            message.error(error.message || 'Thêm sản phẩm thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title="Thêm Sản phẩm mới"
            open={open}
            width={800} // Cố định chiều rộng to ra để chứa bảng chi tiết
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={() => form.submit()}
            confirmLoading={submitting}
            okText="Lưu sản phẩm"
            cancelText="Hủy bỏ"
        >
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleCreateProduct} 
                style={{ marginTop: 20 }}
                // Khởi tạo sẵn 1 dòng phân loại mặc định để người dùng đỡ phải bấm nút "Thêm" lần đầu
                initialValues={{ details: [{ variantName: 'Mặc định', unit: 'Cái', costPrice: 0, price: 0, stockQuantity: 0 }] }}
            >
                {/* THÔNG TIN CHUNG SẢN PHẨM */}
                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: 'Nhập tên sản phẩm!' }]}>
                            <Input placeholder="Ví dụ: Nước mắm Chinsu..." />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Danh mục" name="categoryId" rules={[{ required: true, message: 'Chọn danh mục!' }]}>
                            <Select 
                                placeholder="Chọn danh mục" 
                                showSearch 
                                optionFilterProp="children"
                            >
                                {categories.map(cat => (
                                    <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                
                <Form.Item label="Mô tả sản phẩm" name="description">
                    <Input.TextArea placeholder="Nhập mô tả ngắn (nếu có)" rows={2} />
                </Form.Item>

                {/* DANH SÁCH PHÂN LOẠI (SỬ DỤNG FORM.LIST CỦA ANT DESIGN) */}
                <Card size="small" title="Các phân loại của sản phẩm (Kích cỡ, Thể tích, Đóng gói...)" style={{ backgroundColor: '#fafafa' }}>
                    
                    {/* HÀNG TIÊU ĐỀ: Chia tỉ lệ cột (Tổng = 24) */}
                    <Row gutter={8} style={{ paddingBottom: 8, fontWeight: '600', color: '#595959', paddingLeft: 4 }}>
                        <Col span={6}>Tên phân loại <span style={{ color: '#ff4d4f' }}>*</span></Col>
                        <Col span={4}>Đơn vị tính <span style={{ color: '#ff4d4f' }}>*</span></Col>
                        <Col span={5}>Giá vốn</Col>
                        <Col span={5}>Giá bán <span style={{ color: '#ff4d4f' }}>*</span></Col>
                        <Col span={3}>Tồn kho <span style={{ color: '#ff4d4f' }}>*</span></Col>
                        <Col span={1}></Col> {/* Chỗ trống cho nút xóa */}
                    </Row>

                    <Form.List name="details">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    // HÀNG NHẬP LIỆU: Bắt buộc dùng lại y hệt tỉ lệ Col ở trên
                                    <Row gutter={8} key={key} align="top">
                                        <Col span={6}>
                                            <Form.Item {...restField} name={[name, 'variantName']} rules={[{ required: true, message: 'Nhập tên!' }]}>
                                                <Input placeholder="Lon 330ml..." style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item {...restField} name={[name, 'unit']} rules={[{ required: true, message: 'Nhập ĐVT!' }]}>
                                                <Input placeholder="Cái, Cuộn..." style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'costPrice']}>
                                                <InputNumber min={0} style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'price']} rules={[{ required: true, message: 'Nhập giá bán!' }]}>
                                                <InputNumber min={0} style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={3}>
                                            <Form.Item {...restField} name={[name, 'stockQuantity']} rules={[{ required: true, message: 'Nhập tồn kho!' }]}>
                                                <InputNumber min={0} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        
                                        {/* Cột chứa nút Xóa (Căn giữa và đẩy xuống 1 chút cho cân với ô Input) */}
                                        <Col span={1} style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
                                            {fields.length > 1 ? (
                                                <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f', fontSize: 18, cursor: 'pointer' }} />
                                            ) : null}
                                        </Col>
                                    </Row>
                                ))}
                                
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm phân loại mới (Ví dụ: Thùng 24 lon)
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Card>
            </Form>
        </Modal>
    );
};

export default CreateProductModal;