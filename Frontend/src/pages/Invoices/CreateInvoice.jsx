import React, { useState, useEffect } from 'react';
import { Drawer, Row, Col, Card, Table, Input, Select, Button, Space, InputNumber, Divider, Tag, Modal, Form, message } from 'antd';
import { SearchOutlined, PlusOutlined, DeleteOutlined, ShoppingCartOutlined, UserAddOutlined } from '@ant-design/icons';
import { productApi } from '../../services/productApi';
import { categoryApi } from '../../services/categoryApi';
import { customerApi } from '../../services/customerApi';
import { invoiceApi } from '../../services/invoiceApi';

const CreateInvoiceDrawer = ({ open, onClose, onSuccess }) => {
    // STATE: Dữ liệu nguồn
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [customers, setCustomers] = useState([]);
    
    // STATE: Bộ lọc sản phẩm
    const [searchProduct, setSearchProduct] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    // STATE: Giỏ hàng & Thanh toán
    const [cart, setCart] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [newCustomer, setNewCustomer] = useState(null);
    const [paidAmount, setPaidAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [submitting, setSubmitting] = useState(false);

    // STATE: Popup tạo khách hàng nhanh
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [customerForm] = Form.useForm();

    // Lấy dữ liệu nền khi mở Drawer
    useEffect(() => {
        if (open) {
            fetchCategories();
            fetchCustomers();
            fetchProducts();
        }
    }, [open]);

    const fetchCategories = async () => {
        const res = await categoryApi.getAll({ size: 100 });
        if (res.success) setCategories(res.data?.content || res.data || []);
    };

    const fetchCustomers = async (search = '') => {
        const res = await customerApi.getAll({ size: 50, search });
        if (res.success) setCustomers(res.data?.content || res.data || []);
    };

    const fetchProducts = async () => {
        const params = { size: 50, search: searchProduct };
        if (selectedCategory) params.categoryId = selectedCategory;
        const res = await productApi.getAll(params);
        if (res.success) setProducts(res.data?.content || res.data || []);
    };

    // Theo dõi bộ lọc sản phẩm để fetch lại
    useEffect(() => {
        if (open) fetchProducts();
    }, [searchProduct, selectedCategory]);

    // -----------------------------------------------------
    // LOGIC GIỎ HÀNG
    // -----------------------------------------------------
    const handleAddToCart = (product, variant) => {
        const existingItem = cart.find(item => item.variantId === variant.id);
        if (existingItem) {
            // Tăng số lượng nếu đã có trong giỏ
            setCart(cart.map(item => item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            // Thêm mới vào giỏ
            setCart([...cart, {
                variantId: variant.id,
                productName: `${product.name} - ${Object.values(variant.attributes || {}).join(' ')}`,
                unitPrice: variant.price,
                quantity: 1,
            }]);
        }
        message.success('Đã thêm vào giỏ!');
    };

    const handleQuantityChange = (variantId, qty) => {
        setCart(cart.map(item => item.variantId === variantId ? { ...item, quantity: qty } : item));
    };

    const handleRemoveFromCart = (variantId) => {
        setCart(cart.filter(item => item.variantId !== variantId));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    // -----------------------------------------------------
    // LOGIC THANH TOÁN & TẠO KHÁCH HÀNG
    // -----------------------------------------------------
    const handleCreateCustomer = (values) => {
        setNewCustomer(values); 
        setSelectedCustomer(null); // Hủy chọn khách cũ (nếu đang chọn)
        
        setIsCustomerModalOpen(false);
        customerForm.resetFields();
        message.success('Đã ghi nhận thông tin khách mới!');
    };

    const handleSubmitInvoice = async () => {
        if (cart.length === 0) return message.warning('Giỏ hàng đang trống!');
        
        const payload = {
            customerId: selectedCustomer, // Sẽ là null nếu có newCustomer
            newCustomer: newCustomer,     // Gửi cục data khách mới xuống Backend
            paidAmount: paidAmount,
            paymentMethod: paymentMethod,
            items: cart.map(item => ({
                productId: item.variantId,
                quantity: item.quantity
            }))
        };

        setSubmitting(true);
        try {
            const res = await invoiceApi.create(payload);
            if (res.success) {
                message.success('Tạo hóa đơn bán hàng thành công!');
                // Reset toàn bộ state
                setCart([]);
                setSelectedCustomer(null);
                setNewCustomer(null);
                setPaidAmount(0);
                onSuccess();
                onClose();
            }
        } catch (error) {
            message.error(error.message || 'Lỗi tạo hóa đơn!');
        } finally {
            setSubmitting(false);
        }
    };

    // -----------------------------------------------------
    // CỘT HIỂN THỊ (Sản phẩm & Giỏ hàng)
    // -----------------------------------------------------
    const productColumns = [
        { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name', fontWeight: 'bold' },
        { title: 'Danh mục', dataIndex: 'categoryName', key: 'categoryName' },
    ];

    const expandedRowRender = (record) => {
        const variantCols = [
            { title: 'Phân loại', key: 'attrs', render: (_, vr) => Object.values(vr.attributes || {}).join(' ') || 'Mặc định' },
            { title: 'Giá bán', dataIndex: 'price', key: 'price', render: (val) => <b style={{color:'#f5222d'}}>{val?.toLocaleString('vi-VN')} đ</b> },
            { title: 'Tồn kho', dataIndex: 'stockQuantity', key: 'stockQuantity' },
            { 
                title: 'Thao tác', 
                key: 'action', 
                render: (_, variant) => (
                    <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => handleAddToCart(record, variant)} disabled={variant.stockQuantity <= 0}>
                        Chọn
                    </Button>
                ) 
            }
        ];
        return <Table columns={variantCols} dataSource={record.productDetails || []} pagination={false} size="small" rowKey="id" />;
    };

    const cartColumns = [
        { title: 'Mặt hàng', dataIndex: 'productName', key: 'productName', width: '40%' },
        { 
            title: 'SL', 
            key: 'quantity', 
            width: '25%',
            render: (_, record) => (
                <InputNumber min={1} value={record.quantity} onChange={(val) => handleQuantityChange(record.variantId, val)} style={{ width: 60 }} />
            )
        },
        { 
            title: 'Thành tiền', 
            key: 'subTotal', 
            render: (_, record) => <b style={{color:'#f5222d'}}>{(record.unitPrice * record.quantity).toLocaleString('vi-VN')} đ</b>
        },
        { 
            title: '', 
            key: 'action', 
            align: 'right',
            render: (_, record) => <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleRemoveFromCart(record.variantId)} />
        },
    ];

    return (
        <Drawer title="Tạo Hóa Đơn Mới (POS)" width="100%" placement="right" onClose={onClose} open={open} destroyOnClose>
            <Row gutter={24} style={{ height: '100%' }}>
                
                {/* CỘT TRÁI: CHỌN HÀNG HÓA */}
                <Col span={14} style={{ borderRight: '1px solid #f0f0f0', paddingRight: 24 }}>
                    <Space style={{ marginBottom: 16, width: '100%' }} size="middle">
                        <Input 
                            placeholder="Tìm kiếm sản phẩm..." 
                            prefix={<SearchOutlined />} 
                            style={{ width: 300 }}
                            value={searchProduct}
                            onChange={(e) => setSearchProduct(e.target.value)}
                            onPressEnter={() => fetchProducts()}
                        />
                        <Select 
                            placeholder="Lọc theo Danh mục" 
                            style={{ width: 200 }} 
                            allowClear
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            options={categories.map(c => ({ value: c.id, label: c.name }))}
                        />
                    </Space>
                    <Table 
                        dataSource={products} 
                        columns={productColumns} 
                        rowKey="id" 
                        size="middle"
                        pagination={{ pageSize: 8 }}
                        expandable={{ expandedRowRender }}
                    />
                </Col>

                {/* CỘT PHẢI: GIỎ HÀNG & THANH TOÁN */}
                <Col span={10}>
                    <Card size="small" title={<><ShoppingCartOutlined /> Chi tiết Đơn hàng</>} bordered={false}>
                        
                        {/* Khu vực Khách hàng */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ marginBottom: 8, fontWeight: 500 }}>Khách hàng:</div>
                            
                            {/* NẾU CÓ KHÁCH MỚI THÌ HIỆN THÔNG TIN, KÈM NÚT XÓA */}
                            {newCustomer ? (
                                <Tag 
                                    closable 
                                    onClose={() => setNewCustomer(null)} 
                                    color="blue" 
                                    style={{ padding: '6px 12px', fontSize: 14, width: '100%' }}
                                >
                                    <b>Khách mới:</b> {newCustomer.fullName} - {newCustomer.phone}
                                </Tag>
                            ) : (
                                /* NẾU KHÔNG THÌ HIỆN Ô TÌM KIẾM KHÁCH CŨ NHƯ BÌNH THƯỜNG */
                                <Space.Compact style={{ width: '100%' }}>
                                    <Select
                                        showSearch
                                        allowClear
                                        placeholder="Chọn hoặc tìm tên, sđt khách hàng (Để trống nếu khách vãng lai)"
                                        style={{ width: '100%' }}
                                        value={selectedCustomer}
                                        onChange={setSelectedCustomer}
                                        optionFilterProp="label"
                                        options={customers.map(c => ({ value: c.id, label: `${c.fullName} - ${c.phone}` }))}
                                    />
                                    <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsCustomerModalOpen(true)} />
                                </Space.Compact>
                            )}
                        </div>

                        {/* Bảng Giỏ hàng */}
                        <Table 
                            dataSource={cart} 
                            columns={cartColumns} 
                            rowKey="variantId" 
                            pagination={false} 
                            size="small"
                            scroll={{ y: 300 }}
                        />

                        <Divider />

                        {/* Khu vực Tính tiền */}
                        <Row gutter={[0, 12]}>
                            <Col span={12}><span style={{ fontSize: 16 }}>Tổng tiền hàng:</span></Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                                <b style={{ fontSize: 18, color: '#1890ff' }}>{totalAmount.toLocaleString('vi-VN')} đ</b>
                            </Col>
                            
                            <Col span={12} style={{ lineHeight: '32px' }}>Khách thanh toán:</Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                                <InputNumber 
                                    style={{ width: '100%' }} 
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    value={paidAmount} 
                                    onChange={setPaidAmount} 
                                    min={0}
                                />
                            </Col>

                            <Col span={12} style={{ lineHeight: '32px' }}>Hình thức:</Col>
                            <Col span={12}>
                                <Select value={paymentMethod} onChange={setPaymentMethod} style={{ width: '100%' }}>
                                    <Select.Option value="CASH">Tiền mặt</Select.Option>
                                    <Select.Option value="TRANSFER">Chuyển khoản</Select.Option>
                                </Select>
                            </Col>

                            <Col span={12} style={{ color: totalAmount - paidAmount > 0 ? '#f5222d' : '#52c41a', fontWeight: 'bold' }}>
                                {totalAmount - paidAmount > 0 ? 'Khách còn nợ:' : 'Tiền thừa trả khách:'}
                            </Col>
                            <Col span={12} style={{ textAlign: 'right', fontWeight: 'bold', color: totalAmount - paidAmount > 0 ? '#f5222d' : '#52c41a' }}>
                                {Math.abs(totalAmount - paidAmount).toLocaleString('vi-VN')} đ
                            </Col>
                        </Row>

                        <Button type="primary" size="large" block style={{ marginTop: 24, height: 50, fontSize: 18 }} onClick={handleSubmitInvoice} loading={submitting}>
                            HOÀN TẤT THANH TOÁN
                        </Button>
                    </Card>
                </Col>
            </Row>

            {/* POPUP TẠO KHÁCH HÀNG NHANH */}
            <Modal title="Thêm khách hàng mới" open={isCustomerModalOpen} onOk={() => customerForm.submit()} onCancel={() => setIsCustomerModalOpen(false)} okText="Lưu lại" cancelText="Hủy">
                <Form form={customerForm} layout="vertical" onFinish={handleCreateCustomer}>
                    <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Nhập tên khách hàng!' }]}>
                        <Input placeholder="Ví dụ: Nguyễn Văn A" />
                    </Form.Item>
                    <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Nhập số điện thoại!' }]}>
                        <Input placeholder="Ví dụ: 0912345678" />
                    </Form.Item>
                </Form>
            </Modal>
        </Drawer>
    );
};

export default CreateInvoiceDrawer;