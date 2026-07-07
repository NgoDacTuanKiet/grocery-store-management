import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, Dropdown, message } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    TeamOutlined,
    ShoppingCartOutlined,
    FileTextOutlined,
    DashboardOutlined,
    LogoutOutlined,
    AppstoreOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    const fullName = localStorage.getItem('fullName') || 'Người dùng';
    const userRole = localStorage.getItem('role') || 'STAFF';

    const allMenuItems = [
        { key: '/', icon: <DashboardOutlined />, label: 'Tổng quan' },
        { key: '/users', icon: <TeamOutlined />, label: 'Quản lý Nhân viên' },
        { key: '/customers', icon: <UserOutlined />, label: 'Khách hàng' },
        { key: '/products', icon: <ShoppingCartOutlined />, label: 'Sản phẩm' },
        { key: '/categories', icon: <AppstoreOutlined />, label: 'Danh mục' },
        { key: '/invoices', icon: <FileTextOutlined />, label: 'Hóa đơn' },
    ];

    const allowedMenuItems = allMenuItems.filter(item => {
        if (userRole === 'STAFF' && item.key === '/users') {
            return false;
        }
        return true;
    });

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    useEffect(() => {
        let timeoutId;

        const resetTimer = () => {
            clearTimeout(timeoutId);
            // Đặt thời gian: 1 giờ = 3.600.000 ms
            timeoutId = setTimeout(() => {
                localStorage.clear(); // Xóa sạch dữ liệu
                message.warning('Phiên đăng nhập hết hạn!');
                navigate('/login'); // Đá văng ra trang Login
            }, 3600000); 
        };

        // Lắng nghe các hành động của người dùng
        const events = ['mousemove', 'keydown', 'scroll', 'click'];
        events.forEach(event => window.addEventListener(event, resetTimer));

        // Bắt đầu đếm ngược ngay khi vừa mở trang
        resetTimer();

        // Dọn dẹp khi chuyển trang khác
        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [navigate]);
    // -------------------------------------------------------------

    return (
        <Layout style={{ minHeight: '100vh', width: '100vw' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
                <div style={{ height: 64, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 18, fontWeight: 'bold', borderBottom: '1px solid #f0f0f0' }}>
                    {collapsed ? 'App' : 'Grocery'}
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    onClick={(item) => navigate(item.key)}
                    items={allowedMenuItems} 
                />
            </Sider>

            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />
                    
                    <Dropdown menu={{ items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: handleLogout }] }} placement="bottomRight">
                        <Button type="text" icon={<UserOutlined />}>{fullName}</Button>
                    </Dropdown>
                </Header>

                <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;