import React, { useState, useEffect } from 'react';
import { Table, Card, Space, Input, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { customerApi } from '../../services/customerApi';
import { Link } from 'react-router-dom'; // Sử dụng Link để chuyển trang

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });

    const fetchCustomers = async (page = 1, size = 5, search = searchText) => {
        setLoading(true);
        try {
            const params = { page: page - 1, size, search };
            const response = await customerApi.getAll(params);
            if (response.success) {
                const pageData = response.data;
                setCustomers(pageData.content || pageData || []);
                setPagination(prev => ({
                    ...prev,
                    current: page,
                    pageSize: size,
                    total: pageData.totalElements || 0,
                }));
            }
        } catch (error) {
            message.error(error.message || 'Lỗi tải danh sách khách hàng!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers(1, 5);
    }, []);

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
        { 
            title: 'Họ và tên', 
            dataIndex: 'fullName', 
            key: 'fullName',
            // Sử dụng Link thay vì <a> để chuyển trang mượt mà
            render: (text, record) => (
                <Link to={`/customers/${record.id}`} style={{ fontWeight: '600' }}>
                    {text}
                </Link>
            )
        },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
        { 
            title: 'Tổng tiền nợ', 
            dataIndex: 'totalDebt', 
            key: 'totalDebt',
            render: (debt) => (
                <span style={{ color: debt > 0 ? '#f5222d' : '#52c41a', fontWeight: 'bold' }}>
                    {debt?.toLocaleString('vi-VN')} đ
                </span>
            )
        },
    ];

    return (
        <Card 
            title="Quản lý Khách hàng" 
            extra={
                <Input
                    placeholder="Tìm tên hoặc số điện thoại..."
                    prefix={<SearchOutlined />}
                    style={{ width: 250 }}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={() => fetchCustomers(1, pagination.pageSize)}
                />
            }
        >
            <Table 
                dataSource={customers} 
                columns={columns} 
                rowKey="id" 
                loading={loading}
                bordered
                pagination={pagination} 
                onChange={(p) => fetchCustomers(p.current, p.pageSize)} 
            />
            {/* Đã xóa hoàn toàn Drawer ở đây */}
        </Card>
    );
};

export default Customers;