import React, { useState, useEffect } from 'react';
import { Table, Card, Space, Tag, Input, Drawer, Descriptions, Divider, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { customerApi } from '../../services/customerApi';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    
    // State quản lý Drawer chi tiết
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });

    // Hàm lấy danh sách khách hàng
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

    // Hàm xử lý khi click vào Tên khách hàng để xem chi tiết
    const handleOpenDetail = async (id) => {
        setIsDrawerOpen(true);
        setDetailLoading(true);
        try {
            const response = await customerApi.getDetail(id);
            if (response.success) {
                setSelectedCustomer(response.data); // Nhận DTO chi tiết gồm thông tin + list hóa đơn
            }
        } catch (error) {
            message.error('Không thể tải chi tiết khách hàng!');
            setIsDrawerOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
        { 
            title: 'Họ và tên', 
            dataIndex: 'fullName', 
            key: 'fullName',
            fontWeight: 'bold',
            // Biến tên thành nút bấm để xem chi tiết
            render: (text, record) => (
                <a style={{ fontWeight: '600' }} onClick={() => handleOpenDetail(record.id)}>
                    {text}
                </a>
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

    // Định nghĩa các cột cho bảng Hóa đơn phụ bên trong Drawer chi tiết
    const invoiceColumns = [
        { title: 'Mã HĐ', dataIndex: 'invoiceCode', key: 'invoiceCode' },
        { title: 'Ngày mua', dataIndex: 'createdAt', key: 'createdAt' },
        { 
            title: 'Tổng tiền', 
            dataIndex: 'totalAmount', 
            key: 'totalAmount',
            render: (val) => `${val?.toLocaleString('vi-VN')} đ`
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => (
                <Tag color={status === 'PAID' ? 'green' : 'orange'}>
                    {status === 'PAID' ? 'Đã trả' : 'Ghi nợ'}
                </Tag>
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

            {/* THANH TRƯỢT HIỂN THỊ CHI TIẾT KHÁCH HÀNG */}
            <Drawer
                title="Hồ sơ chi tiết Khách hàng"
                placement="right"
                width={650}
                onClose={() => {
                    setIsDrawerOpen(false);
                    setSelectedCustomer(null);
                }}
                open={isDrawerOpen}
                loading={detailLoading}
            >
                {selectedCustomer && (
                    <>
                        <Descriptions title="Thông tin cơ bản" column={2} bordered>
                            <Descriptions.Item label="Họ và tên" span={2}>
                                <strong>{selectedCustomer.fullName}</strong>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {selectedCustomer.phone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng nợ hiện tại">
                                <span style={{ color: selectedCustomer.totalDebt > 0 ? '#f5222d' : '#52c41a', fontWeight: 'bold' }}>
                                    {selectedCustomer.totalDebt?.toLocaleString('vi-VN')} đ
                                </span>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">Lịch sử mua hàng & Hóa đơn</Divider>
                        
                        <Table 
                            dataSource={selectedCustomer.invoices || []} 
                            columns={invoiceColumns} 
                            rowKey="id"
                            size="small"
                            bordered
                            pagination={{ pageSize: 5 }}
                        />
                    </>
                )}
            </Drawer>
        </Card>
    );
};

export default Customers;