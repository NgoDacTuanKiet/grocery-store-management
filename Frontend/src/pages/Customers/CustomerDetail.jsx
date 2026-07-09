import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Spin, message, Divider, Space, Switch, Form, InputNumber, Input, Select, Modal } from 'antd';
import { ArrowLeftOutlined, DollarOutlined } from '@ant-design/icons';
import { customerApi } from '../../services/customerApi';
import { invoiceApi } from '../../services/invoiceApi';
import { paymentReceiptApi } from '../../services/paymentReceiptApi';

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

    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [receiptForm] = Form.useForm();
    const [creatingReceipt, setCreatingReceipt] = useState(false);

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
                customerId: id,
                sort: 'createdAt,desc'
            };

            const response = await invoiceApi.getAll(params);

            if (response.success) {
                const pageData = response.data;
                const dataList = pageData.content || pageData || [];
                const totalItems = response.metaData?.totalItems || dataList.length || 0;

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

    const handleCreateReceipt = async (values) => {
        setCreatingReceipt(true);
        try {
            const payload = {
                customerId: id,
                amount: values.amount,
                paymentMethod: values.paymentMethod,
                note: values.note
            };
            const res = await paymentReceiptApi.create(payload);
            if (res.success) {
                message.success('Tạo phiếu thu thành công!');
                setIsReceiptModalOpen(false);
                receiptForm.resetFields();
                // Reload data
                fetchDetail();
                fetchInvoices(1, pagination.pageSize, statusFilter);
            } else {
                message.error(res.message || 'Lỗi tạo phiếu thu');
            }
        } catch (error) {
            message.error(error.message || 'Lỗi tạo phiếu thu');
        } finally {
            setCreatingReceipt(false);
        }
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

            <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Button type="primary" size="large" icon={<DollarOutlined />} onClick={() => setIsReceiptModalOpen(true)} disabled={customer?.totalDebt <= 0}>
                    Tạo Phiếu Thu
                </Button>
            </div>

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

            <Modal
                title="Tạo Phiếu Thu"
                open={isReceiptModalOpen}
                onCancel={() => setIsReceiptModalOpen(false)}
                footer={null}
            >
                <Form layout="vertical" form={receiptForm} onFinish={handleCreateReceipt} initialValues={{ paymentMethod: 'CASH' }}>
                    <Form.Item label="Khách hàng">
                        <Input value={customer?.fullName} disabled />
                    </Form.Item>
                    <Form.Item label="Tổng nợ hiện tại">
                        <InputNumber
                            value={customer?.totalDebt}
                            disabled
                            formatter={value => `${value} đ`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '').replace(/ đ/g, '')}
                            style={{ width: '100%', color: 'red', fontWeight: 'bold' }}
                        />
                    </Form.Item>
                    <Form.Item label="Số tiền thu" name="amount" rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}>
                        <InputNumber
                            min={1000}
                            max={customer?.totalDebt || 0}
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/,/g, '')}
                            placeholder="Nhập số tiền khách trả..."
                        />
                    </Form.Item>
                    <Form.Item label="Hình thức thanh toán" name="paymentMethod" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="CASH">Tiền mặt</Select.Option>
                            <Select.Option value="TRANSFER">Chuyển khoản</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Ghi chú" name="note">
                        <Input.TextArea rows={3} placeholder="Ví dụ: Khách trả nợ tháng 7..." />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsReceiptModalOpen(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={creatingReceipt}>Xác nhận thu tiền</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default CustomerDetail;