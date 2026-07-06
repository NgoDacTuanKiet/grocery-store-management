import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { authApi } from '../../services/authApi';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // Loại bỏ trường confirmPassword trước khi gửi xuống Backend
            const { confirmPassword, ...registerData } = values;
            
            const response = await authApi.register(registerData);
            
            if (response.success) {
                message.success('Đăng ký thành công! Vui lòng đăng nhập.');
                // Đẩy người dùng về trang đăng nhập
                navigate('/login'); 
            }
        } catch (error) {
            message.error(error.message || 'Tên đăng nhập đã tồn tại hoặc có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', background: '#f0f2f5' }}>
            <Card title="Đăng ký tài khoản mới" style={{ width: 450, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <Form layout="vertical" onFinish={onFinish}>
                    
                    <Form.Item 
                        label="Họ và tên" 
                        name="fullName" 
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                        <Input placeholder="Nhập họ và tên của bạn" />
                    </Form.Item>

                    <Form.Item 
                        label="Tên đăng nhập" 
                        name="username" 
                        rules={[
                            { required: true, message: 'Vui lòng nhập username!' },
                            { min: 4, message: 'Username phải có ít nhất 4 ký tự!' }
                        ]}
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

                    <Form.Item 
                        label="Xác nhận mật khẩu" 
                        name="confirmPassword" 
                        dependencies={['password']} // Ràng buộc với trường password
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu nhập lại không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Nhập lại mật khẩu" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Đăng ký
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center', marginTop: 10 }}>
                        Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Register;