import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Input, Badge, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { productApi } from '../../services/productApi';
import CreateProductModal from './CreateProductModal';

const Products = () => {
    // STATE QUẢN LÝ DỮ LIỆU
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });

    // HÀM FETCH DỮ LIỆU TỪ BACKEND
    const fetchProducts = async (page = 1, size = 5, search = searchText) => {
        setLoading(true);
        try {
            const params = {
                page: page - 1, // Spring Boot đếm từ trang 0
                size: size,
            };
            
            if (search) {
                params.search = search;
            }

            const response = await productApi.getAll(params);
            
            if (response.success) {
                const pageData = response.data;
                const dataList = pageData.content || pageData || [];
                const totalItems = pageData.totalElements || dataList.length || 0;

                setProducts(dataList);
                setPagination(prev => ({
                    ...prev,
                    current: page,
                    pageSize: size,
                    total: totalItems,
                }));
            }
        } catch (error) {
            message.error(error.message || 'Lỗi tải danh sách sản phẩm!');
        } finally {
            setLoading(false);
        }
    };

    // Chạy lần đầu khi mở trang
    useEffect(() => {
        fetchProducts(1, pagination.pageSize);
    }, []);

    // Bắt sự kiện chuyển trang
    const handleTableChange = (newPagination) => {
        fetchProducts(newPagination.current, newPagination.pageSize, searchText);
    };

    // Bắt sự kiện gõ phím Enter ở ô tìm kiếm
    const handleSearch = () => {
        fetchProducts(1, pagination.pageSize, searchText);
    };

    // 1. CỘT CHO BẢNG CHÍNH (SẢN PHẨM)
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
        { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name', fontWeight: 'bold' },
        { 
            title: 'Danh mục', 
            dataIndex: 'categoryName', 
            key: 'categoryName',
            render: (text) => text || 'Chưa phân loại'
        },
        { 
            title: 'Mô tả', 
            dataIndex: 'description', 
            key: 'description',
            ellipsis: true, 
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" icon={<EditOutlined />} size="small" ghost onClick={() => message.info(`Tính năng sửa đang phát triển`)} />
                    <Button type="primary" danger icon={<DeleteOutlined />} size="small" onClick={() => message.info(`Tính năng xóa đang phát triển`)} />
                </Space>
            ),
        },
    ];

    // 2. HÀM RENDER BẢNG PHỤ (PHÂN LOẠI) KHI BẤM DẤU +
    const expandedRowRender = (record) => {
        const variantColumns = [
            { title: 'Mã CT', dataIndex: 'id', key: 'id', width: 80, align: 'center' },
            { 
                title: 'Phân loại (Thuộc tính)', 
                dataIndex: 'attributes', 
                key: 'attributes',
                render: (attrs) => {
                    if (!attrs || Object.keys(attrs).length === 0) {
                        return <Tag>Mặc định</Tag>;
                    }
                    return (
                        <Space size={[0, 4]} wrap>
                            {Object.entries(attrs).map(([key, value]) => (
                                <Tag color="blue" key={key}>
                                    {key}: <b>{value}</b>
                                </Tag>
                            ))}
                        </Space>
                    );
                }
            },
            { 
                title: 'Giá vốn', 
                dataIndex: 'costPrice', 
                key: 'costPrice',
                render: (price) => <span style={{ color: '#8c8c8c' }}>{price?.toLocaleString('vi-VN')} đ</span>
            },
            { 
                title: 'Giá bán', 
                dataIndex: 'price', 
                key: 'price',
                render: (price) => <span style={{ color: '#f5222d', fontWeight: 600 }}>{price?.toLocaleString('vi-VN')} đ</span>
            },
            { 
                title: 'Tồn kho', 
                dataIndex: 'stockQuantity', 
                key: 'stockQuantity',
                render: (stock) => (
                    <Badge 
                        status={stock > 0 ? 'success' : 'error'} 
                        text={stock > 0 ? `${stock} sản phẩm` : 'Hết hàng'} 
                    />
                )
            },
        ];

        // Lệnh return bắt buộc phải có để vẽ ra Bảng phụ
        return (
            <Table 
                columns={variantColumns} 
                dataSource={record.productDetails || []} 
                pagination={false} 
                rowKey="id"
                size="small"
                style={{ margin: '10px 0', backgroundColor: '#fafafa' }}
                locale={{ emptyText: 'Sản phẩm này chưa có thông tin chi tiết.' }}
            />
        );
    };

    return (
        <Card 
            title="Quản lý Sản phẩm & Phân loại" 
            extra={
                <Space size="large">
                    <Input
                        placeholder="Tìm tên sản phẩm..."
                        prefix={<SearchOutlined />}
                        style={{ width: 250 }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={handleSearch} 
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
                        Thêm Sản phẩm mới
                    </Button>
                </Space>
            }
        >
            <Table 
                dataSource={products} 
                columns={columns} 
                rowKey="id" 
                loading={loading}
                bordered
                pagination={pagination} 
                onChange={handleTableChange} 
                expandable={{ expandedRowRender }} 
            />
            <CreateProductModal 
                open={isCreateModalOpen} 
                onCancel={() => setIsCreateModalOpen(false)} 
                onSuccess={() => fetchProducts(1, pagination.pageSize, searchText)} 
            />
        </Card>
    );
};

export default Products;