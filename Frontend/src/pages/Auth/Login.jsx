import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { authApi } from '../../services/authApi';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // Gọi API Login
            const response = await authApi.login(values);
            
            if (response.success) {
                message.success('Đăng nhập thành công!');
                // Lưu token vào localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('fullName', response.data.fullName);
                localStorage.setItem('role', response.data.role);
                // Điều hướng vào trang Dashboard
                navigate('/'); 
            }
        } catch (error) {
            message.error(error.message || 'Sai tài khoản hoặc mật khẩu!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', background: '#f0f2f5' }}>
            <Card title="Đăng nhập hệ thống" style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item 
                        label="Tên đăng nhập" 
                        name="username" 
                        rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
                    >
                        <Input placeholder="Nhập username" />
                    </Form.Item>

                    <Form.Item 
                        label="Mật khẩu" 
                        name="password" 
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Đăng nhập
                        </Button>
                        <div style={{ textAlign: 'center', marginTop: 10 }}>
                            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;