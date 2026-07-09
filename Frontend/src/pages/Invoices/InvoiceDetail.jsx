import React, { useEffect, useState } from 'react';
import { Modal, Descriptions, Table, Tag, Typography, Divider, Button, message, Spin } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { invoiceApi } from '../../services/invoiceApi';
import dayjs from 'dayjs';
import { printInvoiceData } from '../../utils/printUtils';

const { Title, Text } = Typography;

const InvoiceDetailDrawer = ({ open, onClose, invoiceId }) => {
    const [loading, setLoading] = useState(false);
    const [invoice, setInvoice] = useState(null);

    useEffect(() => {
        if (open && invoiceId) {
            fetchInvoiceDetail(invoiceId);
        } else {
            setInvoice(null);
        }
    }, [open, invoiceId]);

    const fetchInvoiceDetail = async (id) => {
        setLoading(true);
        try {
            const res = await invoiceApi.getById(id);
            if (res.success) {
                setInvoice(res.data);
            } else {
                message.error('Không thể lấy thông tin hóa đơn');
            }
        } catch (error) {
            message.error(error.message || 'Lỗi lấy chi tiết hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (invoice) {
            printInvoiceData(invoice);
        }
    };

    const itemColumns = [
        { title: 'STT', key: 'index', width: 60, align: 'center', render: (_, __, index) => index + 1 },
        { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
        { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', align: 'center' },
        { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'unitPrice', align: 'right', render: (val) => `${val?.toLocaleString('vi-VN')} đ` },
        { title: 'Thành tiền', dataIndex: 'subTotal', key: 'subTotal', align: 'right', render: (val) => <Text strong>{val?.toLocaleString('vi-VN')} đ</Text> },
    ];

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}>Chi tiết hóa đơn {invoice?.invoiceCode}</Title>}
            width={720}
            onCancel={onClose}
            open={open}
            footer={[
                <Button key="close" onClick={onClose}>Đóng</Button>,
                <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
                    In Hóa Đơn
                </Button>
            ]}
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin size="large" />
                </div>
            ) : invoice ? (
                <div id="printable-invoice">
                    <Descriptions title="Thông tin chung" bordered column={2} size="small">
                        <Descriptions.Item label="Mã Hóa Đơn"><Text strong>{invoice.invoiceCode}</Text></Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">{invoice.createdAt ? dayjs(invoice.createdAt).format('DD/MM/YYYY HH:mm') : ''}</Descriptions.Item>
                        <Descriptions.Item label="Khách hàng">{invoice.customerName || 'Khách vãng lai'}</Descriptions.Item>
                        <Descriptions.Item label="Thu ngân">{invoice.staffName}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={invoice.status === 'PAID' ? 'success' : 'error'}>
                                {invoice.status === 'PAID' ? 'Đã thanh toán' : 'Ghi nợ'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Hình thức">
                            <Tag color={invoice.paymentMethod === 'CASH' ? 'green' : 'blue'}>
                                {invoice.paymentMethod === 'CASH' ? 'Tiền mặt' : invoice.paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : invoice.paymentMethod}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider dashed />

                    <Title level={5}>Danh sách sản phẩm</Title>
                    <Table
                        columns={itemColumns}
                        dataSource={invoice.items || []}
                        pagination={false}
                        rowKey="id"
                        size="middle"
                        bordered
                    />

                    <Divider dashed />

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: 300 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text>Tổng tiền hàng:</Text>
                                <Text strong style={{ fontSize: 16 }}>{invoice.totalAmount?.toLocaleString('vi-VN')} đ</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text>Khách đã trả:</Text>
                                <Text strong style={{ color: '#52c41a' }}>{invoice.paidAmount?.toLocaleString('vi-VN')} đ</Text>
                            </div>
                            {(invoice.totalAmount - invoice.paidAmount) > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text type="danger">Còn nợ:</Text>
                                    <Text type="danger" strong>{(invoice.totalAmount - invoice.paidAmount)?.toLocaleString('vi-VN')} đ</Text>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}
        </Modal>
    );
};

export default InvoiceDetailDrawer;
