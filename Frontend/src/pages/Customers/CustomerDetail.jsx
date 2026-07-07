import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Spin, message, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { customerApi } from '../../services/customerApi';

const CustomerDetail = () => {
    const { id } = useParams(); // Lấy ID từ URL
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchDetail();
    }, [id]);

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

            <Divider orientation="left">Lịch sử giao dịch</Divider>
            <Table 
                dataSource={customer?.invoices || []} 
                rowKey="id"
                columns={[
                    { title: 'Mã HĐ', dataIndex: 'invoiceCode' },
                    { title: 'Tổng tiền', dataIndex: 'totalAmount', render: val => val?.toLocaleString() + ' đ' },
                    { title: 'Trạng thái', dataIndex: 'status', render: s => <Tag color={s === 'PAID' ? 'green' : 'red'}>{s}</Tag> }
                ]}
            />
        </Card>
    );
};

export default CustomerDetail;