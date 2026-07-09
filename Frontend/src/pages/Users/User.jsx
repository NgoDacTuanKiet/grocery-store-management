import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Space, Tag, message, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { userApi } from '../../services/userApi';
import CreateUserModal from './CreateUserModal';
import UpdateUserModal from './UpdateUserModal';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // 1. STATE BỘ LỌC: Mặc định khi vào trang sẽ hiển thị danh sách ACTIVE
    const [statusFilter, setStatusFilter] = useState('ACTIVE');

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });

    // 2. HÀM FETCH: Lấy dữ liệu và tự động kẹp thêm statusFilter
    const fetchUsers = async (page = 1, size = 5, status = statusFilter) => {
        setLoading(true);
        try {
            const params = {
                page: page - 1, 
                size: size,
                status: status
            };

            const response = await userApi.getAll(params);
            
            if (response.success) {
                const pageData = response.data; 
                const dataList = pageData.content || pageData || [];
                const totalItems = response.metaData?.totalItems || dataList.length || 0;

                setUsers(dataList);
                
                setPagination(prev => ({
                    ...prev,
                    current: page,
                    pageSize: size,
                    total: totalItems, 
                }));
            }
        } catch (error) {
            message.error(error.message || 'Lỗi tải danh sách nhân viên!');
        } finally {
            setLoading(false);
        }
    };

    // Chạy lần đầu khi mở trang
    useEffect(() => {
        fetchUsers(1, 5, statusFilter);
    }, []);

    // 3. SỰ KIỆN NÚT GẠT: Chuyển đổi qua lại giữa danh sách ACTIVE và INACTIVE
    const handleSwitchFilter = (checked) => {
        const newStatus = checked ? 'ACTIVE' : 'INACTIVE';
        setStatusFilter(newStatus);
        
        // Khi gạt nút lọc, luôn tự động quay về trang 1 để xem từ đầu
        fetchUsers(1, pagination.pageSize, newStatus); 
    };

    const handleTableChange = (newPagination) => {
        fetchUsers(newPagination.current, newPagination.pageSize, statusFilter);
    };

    const handleDelete = async (id) => {
        try {
            const res = await userApi.delete(id);
            if (res.success) {
                message.success('Đã vô hiệu hóa nhân viên!');
                fetchUsers(pagination.current, pagination.pageSize, statusFilter); 
            }
        } catch (error) {
            message.error(error.message || 'Xóa thất bại!');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
        { title: 'Họ và tên', dataIndex: 'fullName', key: 'fullName', fontWeight: 'bold' },
        { title: 'Tên đăng nhập', dataIndex: 'username', key: 'username' },
        {
            title: 'Quyền',
            dataIndex: 'role',
            key: 'role',
            render: (role) => <Tag color={role === 'OWNER' ? 'red' : 'blue'}>{role}</Tag>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            // TRẢ LẠI DẠNG TAG CHO BẢNG
            render: (status) => (
                <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
                    {status}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                     <Button
                        type="primary" 
                        icon={<EditOutlined />} 
                        size="small" 
                        ghost 
                        onClick={() => {
                            setEditingUser(record);
                            setIsUpdateModalOpen(true);
                        }} 
                    />
                    <Button type="primary" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.id)} />
                </Space>
            ),
        },
    ];

    return (
        <Card 
            title="Danh sách Nhân viên" 
            extra={
                <Space size="large">
                    {/* KHU VỰC BỘ LỌC SWITCH */}
                    <Space size="small">
                        <span style={{ fontWeight: 500 }}>Chế độ xem:</span>
                        <Switch
                            checkedChildren="ACTIVE"
                            unCheckedChildren="INACTIVE"
                            checked={statusFilter === 'ACTIVE'} 
                            onChange={handleSwitchFilter}
                            style={{ 
                                backgroundColor: statusFilter === 'ACTIVE' ? '#52c41a' : '#f5222d',
                                minWidth: '80px' 
                            }}
                        />
                    </Space>

                    {/* SỬA LẠI SỰ KIỆN ONCLICK Ở ĐÂY */}
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                        Thêm nhân viên mới
                    </Button>
                </Space>
            }
        >
            <Table 
                dataSource={users} 
                columns={columns} 
                rowKey="id" 
                loading={loading}
                bordered
                pagination={pagination} 
                onChange={handleTableChange} 
            />

            {/* NHÚNG COMPONENT POPUP VÀO ĐÂY */}
            <CreateUserModal 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                onSuccess={() => fetchUsers(1, pagination.pageSize, statusFilter)} 
            />

            <UpdateUserModal
                open={isUpdateModalOpen}
                userData={editingUser} // Truyền dữ liệu nhân viên cần sửa vào
                onCancel={() => {
                    setIsUpdateModalOpen(false);
                    setEditingUser(null);
                }}
                // Sửa thành công thì load lại đúng trang hiện tại
                onSuccess={() => fetchUsers(pagination.current, pagination.pageSize, statusFilter)} 
            />
        </Card>
    );
};

export default Users;