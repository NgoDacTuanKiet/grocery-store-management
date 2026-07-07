# Grocery Store Management

Dự án **Quản lý Cửa hàng Tạp hóa** (Grocery Store Management) là một ứng dụng Web Full-stack giúp quản lý toàn diện các hoạt động kinh doanh của cửa hàng như: quản lý nhân viên, quản lý khách hàng, quản lý sản phẩm và quản lý hóa đơn (bán hàng).

## Cấu trúc dự án

Dự án được chia thành hai module chính, hoạt động độc lập và giao tiếp với nhau thông qua RESTful API:

1. **[Frontend](./Frontend/README.md)**: Giao diện người dùng, được xây dựng bằng **React.js** (kết hợp với Vite và Ant Design).
2. **[Backend](./Backend/README.md)**: Hệ thống máy chủ xử lý logic và cơ sở dữ liệu, được xây dựng bằng **Java Spring Boot**.

## Hướng dẫn cài đặt và chạy ứng dụng

Để hệ thống hoạt động, bạn cần khởi chạy cả Backend (để cung cấp API) và Frontend (để hiển thị giao diện).

1. Vui lòng xem hướng dẫn chi tiết khởi chạy máy chủ Backend tại: [Backend README](./Backend/README.md)
2. Vui lòng xem hướng dẫn chi tiết khởi chạy giao diện Frontend tại: [Frontend README](./Frontend/README.md)

## Các chức năng nổi bật
- Phân quyền người dùng (Chủ cửa hàng & Nhân viên).
- Quản lý danh sách khách hàng và theo dõi công nợ.
- Quản lý kho sản phẩm.
- Tạo hóa đơn, tính tiền, và theo dõi lịch sử thanh toán (Paid / Unpaid).
