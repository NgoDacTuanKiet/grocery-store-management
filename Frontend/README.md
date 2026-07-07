# Grocery Store Management - Frontend

Đây là phần giao diện người dùng (Client-side) của dự án Quản lý Cửa hàng Tạp hóa, cung cấp một trải nghiệm Web hiện đại, mượt mà và trực quan để người dùng tương tác với hệ thống.

## Công nghệ sử dụng
- **React.js**: Thư viện UI cốt lõi.
- **Vite**: Công cụ build siêu tốc dành cho Frontend, mang lại trải nghiệm Hot Module Replacement (HMR) cực nhanh.
- **Ant Design (antd)**: Bộ thư viện UI Components mạnh mẽ và đẹp mắt để xây dựng các bảng, biểu mẫu, nút bấm, v.v.
- **React Router (v7)**: Quản lý điều hướng (Routing) giữa các trang.
- **Axios**: HTTP Client để gọi RESTful API từ Backend.

## Yêu cầu hệ thống
- Node.js (phiên bản khuyến nghị: 18.x trở lên)
- NPM hoặc Yarn

## Hướng dẫn cài đặt

1. Di chuyển vào thư mục Frontend:
   ```bash
   cd Frontend
   ```

2. Cài đặt các thư viện phụ thuộc (Dependencies):
   ```bash
   npm install
   ```

3. Khởi chạy ứng dụng trong môi trường phát triển (Development):
   ```bash
   npm run dev
   ```

4. Truy cập ứng dụng:
   Sau khi chạy lệnh trên, ứng dụng sẽ khởi chạy và có thể truy cập thông qua trình duyệt ở địa chỉ mặc định thường là `http://localhost:5173`.

## Build ứng dụng cho môi trường Production
Để tạo bản build tối ưu phục vụ cho việc deploy (triển khai):
```bash
npm run build
```
Bản build sẽ được tạo ra trong thư mục `dist`.
