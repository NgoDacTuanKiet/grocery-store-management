import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Input, message } from 'antd';
import { SearchOutlined, EyeOutlined, PrinterOutlined, PlusOutlined } from '@ant-design/icons';
import { invoiceApi } from '../../services/invoiceApi';
import CreateInvoiceDrawer from './CreateInvoice';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10, // Hóa đơn thường để 10 dòng/trang cho dễ nhìn
        total: 0,
    });

    const fetchInvoices = async (page = 1, size = 10, search = searchText) => {
        setLoading(true);
        try {
            const params = {
                page: page - 1, 
                size: size,
            };
            if (search) params.search = search;

            const response = await invoiceApi.getAll(params);
            if (response.success) {
                const pageData = response.data;
                const dataList = pageData.content || pageData || [];
                const totalItems = pageData.totalElements || dataList.length || 0;

                setInvoices(dataList);
                setPagination(prev => ({
                    ...prev,
                    current: page,
                    pageSize: size,
                    total: totalItems,
                }));
            }
        } catch (error) {
            message.error(error.message || 'Lỗi tải danh sách hóa đơn!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices(1, pagination.pageSize);
    }, []);

    const handleTableChange = (newPagination) => {
        fetchInvoices(newPagination.current, newPagination.pageSize, searchText);
    };

    const handleSearch = () => {
        fetchInvoices(1, pagination.pageSize, searchText);
    };

    // 1. CỘT CHO BẢNG CHÍNH (HÓA ĐƠN)
    const columns = [
        { title: 'Mã HĐ', dataIndex: 'invoiceCode', key: 'invoiceCode', fontWeight: 'bold' },
        { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName', render: (text) => text || 'Khách vãng lai' },
        { title: 'Thu ngân', dataIndex: 'staffName', key: 'staffName' },
        { 
            title: 'Tổng tiền', 
            dataIndex: 'totalAmount', 
            key: 'totalAmount',
            render: (val) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{val?.toLocaleString('vi-VN')} đ</span>
        },
        { 
            title: 'Đã thanh toán', 
            dataIndex: 'paidAmount', 
            key: 'paidAmount',
            render: (val) => `${val?.toLocaleString('vi-VN')} đ`
        },
        {
            title: 'Hình thức',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            align: 'center',
            render: (method) => (
                <Tag color={method === 'CASH' ? 'green' : 'blue'}>
                    {method === 'CASH' ? 'Tiền mặt' : method === 'TRANSFER' ? 'Chuyển khoản' : method}
                </Tag>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => (
                <Tag color={status === 'PAID' ? 'success' : 'error'}>
                    {status === 'PAID' ? 'Đã thanh toán' : 'Ghi nợ'}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" icon={<EyeOutlined />} size="small" ghost onClick={() => message.info('Xem chi tiết')} />
                    <Button type="default" icon={<PrinterOutlined />} size="small" onClick={() => message.info('In hóa đơn')} />
                </Space>
            ),
        },
    ];

    // 2. BẢNG PHỤ (DANH SÁCH MẶT HÀNG TRONG HÓA ĐƠN)
    const expandedRowRender = (record) => {
        const itemColumns = [
            { title: 'Mã SP', dataIndex: 'productId', key: 'productId', width: 80, align: 'center' },
            { title: 'Tên sản phẩm', dataIndex: 'productName', key: 'productName' },
            { 
                title: 'Đơn giá', 
                dataIndex: 'unitPrice', 
                key: 'unitPrice',
                render: (val) => `${val?.toLocaleString('vi-VN')} đ`
            },
            { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', align: 'center' },
            { 
                title: 'Thành tiền', 
                dataIndex: 'subTotal', 
                key: 'subTotal',
                render: (val) => <span style={{ color: '#f5222d', fontWeight: 600 }}>{val?.toLocaleString('vi-VN')} đ</span>
            },
        ];

        return (
            <Table 
                columns={itemColumns} 
                dataSource={record.items || []} 
                pagination={false} 
                rowKey="id"
                size="small"
                style={{ margin: '10px 0', backgroundColor: '#fafafa', border: '1px dashed #d9d9d9' }}
                locale={{ emptyText: 'Hóa đơn này không có chi tiết mặt hàng.' }}
            />
        );
    };

    return (
        <Card 
            title="Lịch sử Hóa đơn Bán hàng" 
            extra={
                <Space size="large">
                    <Input
                        placeholder="Tìm theo mã HĐ, tên khách..."
                        prefix={<SearchOutlined />}
                        style={{ width: 280 }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateDrawerOpen(true)}>
                        Tạo Hóa đơn mới
                    </Button>
                </Space>
            }
        >
            <Table 
                dataSource={invoices} 
                columns={columns} 
                rowKey="id" 
                loading={loading}
                bordered
                pagination={pagination} 
                onChange={handleTableChange} 
                expandable={{ expandedRowRender }} 
            />
            <CreateInvoiceDrawer 
                open={isCreateDrawerOpen} 
                onClose={() => setIsCreateDrawerOpen(false)} 
                onSuccess={() => fetchInvoices(1, pagination.pageSize, searchText)} 
            />
        </Card>
    );
};

export default Invoices;