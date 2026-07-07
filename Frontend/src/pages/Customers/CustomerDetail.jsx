import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Spin, message, Divider, Space, Switch } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { customerApi } from '../../services/customerApi';
import { invoiceApi } from '../../services/invoiceApi';

const CustomerDetail = () => {
    const { id } = useParams(); // Lấy ID từ URL
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    const [invoices, setInvoices] = useState([]);
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('UNPAID');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });

    const fetchDetail = async () => {
        try {
            const res = await customerApi.getDetail(id);
            if (res.success) setCustomer(res.data);
        } catch (err) {
            message.error('Không tìm thấy thông tin khách hàng!');
        } finally {
            setLoading(false);
        }
    };

    const fetchInvoices = async (page = 1, size = 5, status = statusFilter) => {
        setInvoiceLoading(true);
        try {
            const params = {
                page: page - 1, 
                size: size,
                status: status,
                customerId: id
            };

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
            message.error('Lỗi tải danh sách hóa đơn!');
        } finally {
            setInvoiceLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
        fetchInvoices(1, 5, statusFilter);
    }, [id]);

    const handleSwitchFilter = (checked) => {
        const newStatus = checked ? 'PAID' : 'UNPAID';
        setStatusFilter(newStatus);
        fetchInvoices(1, pagination.pageSize, newStatus); 
    };

    const handleTableChange = (newPagination) => {
        fetchInvoices(newPagination.current, newPagination.pageSize, statusFilter);
    };

    if (loading) return <Spin size="large" style={{ display: 'block', marginTop: 100 }} />;

    return (
        <Card title={<span><Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" /> Hồ sơ Khách hàng</span>}>
            <Descriptions bordered column={2}>
                <Descriptions.Item label="Họ tên">{customer?.fullName}</Descriptions.Item>
                <Descriptions.Item label="SĐT">{customer?.phone}</Descriptions.Item>
                <Descriptions.Item label="Tổng nợ" span={2}>
                    <span style={{ color: 'red', fontWeight: 'bold' }}>{customer?.totalDebt?.toLocaleString()} đ</span>
                </Descriptions.Item>
            </Descriptions>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <Divider orientation="left" style={{ margin: 0, width: 'auto', minWidth: 'auto' }}>Lịch sử giao dịch</Divider>
                <Space size="small">
                    <span style={{ fontWeight: 500 }}>Trạng thái:</span>
                    <Switch
                        checkedChildren="PAID"
                        unCheckedChildren="UNPAID"
                        checked={statusFilter === 'PAID'} 
                        onChange={handleSwitchFilter}
                        style={{ 
                            backgroundColor: statusFilter === 'PAID' ? '#52c41a' : '#f5222d',
                            minWidth: '80px' 
                        }}
                    />
                </Space>
            </div>
            
            <Table 
                style={{ marginTop: '20px' }}
                dataSource={invoices} 
                rowKey="id"
                loading={invoiceLoading}
                pagination={pagination}
                onChange={handleTableChange}
                columns={[
                    { title: 'Mã HĐ', dataIndex: 'invoiceCode' },
                    { title: 'Thời gian tạo', dataIndex: 'createdAt', render: val => val ? new Date(val).toLocaleString('vi-VN') : '' },
                    { title: 'Tổng tiền', dataIndex: 'totalAmount', render: val => val?.toLocaleString() + ' đ' },
                    { title: 'Đã trả', dataIndex: 'paidAmount', render: val => val?.toLocaleString() + ' đ' },
                    { title: 'Trạng thái', dataIndex: 'status', render: s => <Tag color={s === 'PAID' ? 'green' : 'red'}>{s}</Tag> }
                ]}
            />
        </Card>
    );
};

export default CustomerDetail;