import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Table, Typography, Tag, List, Avatar } from 'antd';
import { 
    DollarCircleOutlined, 
    ShoppingCartOutlined, 
    WarningOutlined, 
    AlertOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import CountUp from 'react-countup';
import { 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip,
    Legend
} from 'recharts';
import { dashboardApi } from '../../services/dashboardApi';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const { Title, Text } = Typography;

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await dashboardApi.getOverview();
                if (res.success) {
                    setData(res.data);
                }
            } catch (err) {
                message.error('Lỗi tải dữ liệu tổng quan!');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;
    if (!data) return null;

    // Custom formatter for React-CountUp
    const formatter = (value) => <CountUp end={value} separator="," />;

    // Cột bảng Khách nợ nhiều
    const debtColumns = [
        { title: 'Khách hàng', dataIndex: 'customerName', key: 'name' },
        { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
        { 
            title: 'Đang nợ', 
            dataIndex: 'debt', 
            key: 'debt',
            render: (val) => <span style={{ color: '#f5222d', fontWeight: 'bold' }}>{val?.toLocaleString()} đ</span>
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => <a onClick={() => navigate(`/customers/${record.customerId}`)}>Chi tiết</a>
        }
    ];

    // Cột bảng Hàng sắp hết
    const stockColumns = [
        { title: 'Sản phẩm', dataIndex: 'productName', key: 'name' },
        { 
            title: 'Tồn kho', 
            dataIndex: 'stockQuantity', 
            key: 'stock',
            render: (val) => <Tag color="error">{val}</Tag>
        }
    ];

    return (
        <div className="dashboard-container">
            <Title level={3} style={{ marginBottom: 24 }}>Tổng Quan Kinh Doanh</Title>

            {/* Thẻ thống kê */}
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card revenue">
                        <div className="stat-title">Doanh thu hôm nay</div>
                        <div className="stat-value">
                            <CountUp end={data.todayRevenue || 0} separator="," suffix=" đ" />
                        </div>
                        <DollarCircleOutlined className="stat-icon" style={{ color: '#52c41a' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card orders">
                        <div className="stat-title">Đơn hàng hôm nay</div>
                        <div className="stat-value">
                            <CountUp end={data.todayOrders || 0} separator="," />
                        </div>
                        <ShoppingCartOutlined className="stat-icon" style={{ color: '#1890ff' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card debt">
                        <div className="stat-title">Tiền khách đang nợ</div>
                        <div className="stat-value">
                            <CountUp end={data.totalDebt || 0} separator="," suffix=" đ" />
                        </div>
                        <WarningOutlined className="stat-icon" style={{ color: '#f5222d' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card stock">
                        <div className="stat-title">Sản phẩm sắp hết</div>
                        <div className="stat-value">
                            <CountUp end={data.lowStockCount || 0} separator="," />
                        </div>
                        <AlertOutlined className="stat-icon" style={{ color: '#faad14' }} />
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ 7 ngày */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card title="Doanh thu 7 ngày gần nhất" className="chart-card">
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart data={data.last7DaysRevenue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" />
                                    <YAxis tickFormatter={(val) => `${(val/1000).toLocaleString()}k`} />
                                    <Tooltip 
                                        formatter={(value) => [`${value.toLocaleString()} đ`, 'Doanh thu']}
                                        labelFormatter={(label) => `Ngày: ${label}`}
                                        cursor={{fill: '#f5f5f5'}}
                                    />
                                    <Bar dataKey="revenue" fill="#1890ff" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Cảnh báo & Hoạt động */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={8}>
                    <Card title="Cảnh báo: Khách nợ nhiều" className="alert-card" extra={<a onClick={() => navigate('/customers')}>Xem tất cả</a>}>
                        <Table 
                            columns={debtColumns} 
                            dataSource={data.topDebtors} 
                            rowKey="customerId"
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Cảnh báo: Hàng sắp hết (<10)" className="alert-card" extra={<a onClick={() => navigate('/products')}>Nhập hàng</a>}>
                        <Table 
                            columns={stockColumns} 
                            dataSource={data.lowStockProducts} 
                            rowKey="productId"
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Giao dịch mới nhất" className="activity-card" style={{ height: '100%' }}>
                        <List
                            itemLayout="horizontal"
                            dataSource={data.recentActivities}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                                        title={<Text strong>{item.description}</Text>}
                                        description={
                                            <div>
                                                <div><Text type="secondary" style={{ fontSize: '12px' }}>{new Date(item.time).toLocaleString('vi-VN')}</Text></div>
                                                <div style={{ color: '#52c41a', fontWeight: 'bold' }}>+ {item.amount?.toLocaleString()} đ</div>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
