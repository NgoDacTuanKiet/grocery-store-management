import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Input, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { categoryApi } from '../../services/categoryApi';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });

    const fetchCategories = async (page = 1, size = 5, search = searchText) => {
        setLoading(true);
        try {
            const params = {
                page: page - 1, 
                size: size,
            };
            if (search) params.search = search;

            const response = await categoryApi.getAll(params);
            if (response.success) {
                // Tùy thuộc vào Backend trả về Page hay List, bóc tách cho an toàn
                const pageData = response.data;
                const dataList = pageData.content || pageData || [];
                const totalItems = pageData.totalElements || dataList.length || 0;

                setCategories(dataList);
                setPagination(prev => ({
                    ...prev,
                    current: page,
                    pageSize: size,
                    total: totalItems,
                }));
            }
        } catch (error) {
            message.error(error.message || 'Lỗi tải danh sách danh mục!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories(1, pagination.pageSize);
    }, []);

    const handleTableChange = (newPagination) => {
        fetchCategories(newPagination.current, newPagination.pageSize, searchText);
    };

    const handleSearch = () => {
        fetchCategories(1, pagination.pageSize, searchText);
    };

    const handleDelete = async (id) => {
        try {
            const res = await categoryApi.delete(id);
            if (res.success) {
                message.success('Đã xóa danh mục thành công!');
                fetchCategories(pagination.current, pagination.pageSize, searchText);
            }
        } catch (error) {
            message.error(error.message || 'Xóa thất bại!');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80, align: 'center' },
        { title: 'Tên danh mục', dataIndex: 'name', key: 'name', fontWeight: 'bold' },
        { title: 'Mô tả', dataIndex: 'description', key: 'description' },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" icon={<EditOutlined />} size="small" ghost onClick={() => message.info('Đang phát triển form sửa')} />
                    <Button type="primary" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.id)} />
                </Space>
            ),
        },
    ];

    return (
        <Card 
            title="Quản lý Danh mục Sản phẩm" 
            extra={
                <Space size="large">
                    <Input
                        placeholder="Tìm danh mục..."
                        prefix={<SearchOutlined />}
                        style={{ width: 250 }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('Đang phát triển form thêm')}>
                        Thêm Danh mục
                    </Button>
                </Space>
            }
        >
            <Table 
                dataSource={categories} 
                columns={columns} 
                rowKey="id" 
                loading={loading}
                bordered
                pagination={pagination} 
                onChange={handleTableChange} 
            />
        </Card>
    );
};

export default Categories;