import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Dropdown } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    TeamOutlined,
    ShoppingCartOutlined,
    FileTextOutlined,
    DashboardOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    // 1. Lấy thông tin người dùng đang đăng nhập
    const fullName = localStorage.getItem('fullName') || 'Người dùng';
    const userRole = localStorage.getItem('role') || 'STAFF';

    // 2. Định nghĩa toàn bộ Menu
    const allMenuItems = [
        { key: '/', icon: <DashboardOutlined />, label: 'Tổng quan' },
        { key: '/users', icon: <TeamOutlined />, label: 'Quản lý Nhân viên' },
        { key: '/customers', icon: <UserOutlined />, label: 'Khách hàng' },
        { key: '/products', icon: <ShoppingCartOutlined />, label: 'Sản phẩm' },
        { key: '/invoices', icon: <FileTextOutlined />, label: 'Hóa đơn' },
    ];

    // 3. Lọc Menu: Nếu là STAFF thì ẩn chức năng Quản lý Nhân viên (/users)
    const allowedMenuItems = allMenuItems.filter(item => {
        if (userRole === 'STAFF' && item.key === '/users') {
            return false; // Bỏ qua không hiển thị
        }
        return true; // Các chức năng khác hiển thị bình thường
    });

    const handleLogout = () => {
        localStorage.clear(); // Xóa sạch token, role, fullName
        navigate('/login');
    };

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
                    items={allowedMenuItems} // TRUYỀN DANH SÁCH ĐÃ LỌC VÀO ĐÂY
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
                        {/* HIỂN THỊ TÊN NGƯỜI DÙNG Ở ĐÂY */}
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