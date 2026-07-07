# Grocery Store Management - Backend

Đây là phần máy chủ (Server-side) của dự án Quản lý Cửa hàng Tạp hóa, chịu trách nhiệm xử lý logic nghiệp vụ, xác thực người dùng và tương tác với cơ sở dữ liệu.

## Công nghệ sử dụng
- **Java 17**: Phiên bản Java cốt lõi.
- **Spring Boot**: Framework mạnh mẽ giúp phát triển các ứng dụng Java nhanh chóng (bao gồm Spring Web, Spring Data JPA).
- **Spring Security & JWT (JSON Web Token)**: Xử lý bảo mật, đăng nhập và phân quyền (Owner, Staff).
- **MySQL**: Hệ quản trị cơ sở dữ liệu quan hệ lưu trữ dữ liệu.
- **Maven**: Công cụ quản lý thư viện và quá trình build dự án.
- **Lombok**: Thư viện giúp giảm thiểu code thừa (getter, setter, constructor).
- **ModelMapper**: Thư viện hỗ trợ ánh xạ (map) dữ liệu giữa các đối tượng Entity và DTO.

## Yêu cầu hệ thống
- Java Development Kit (JDK) 17.
- Cơ sở dữ liệu MySQL (có thể cài qua XAMPP, Docker hoặc cài trực tiếp).
- Maven (nếu không dùng Maven Wrapper có sẵn).

## Hướng dẫn cài đặt và cấu hình

1. **Cấu hình Cơ sở dữ liệu**:
   Tạo một database trong MySQL (ví dụ: `grocery_store_db`).
   Sau đó, mở file cấu hình `application.properties` (hoặc `application.yml`) trong `grocery_app/src/main/resources/` và thiết lập kết nối đến Database của bạn (URL, Username, Password).

2. **Chạy ứng dụng**:
   Di chuyển vào thư mục `grocery_app` (nơi chứa file `pom.xml`):
   ```bash
   cd Backend/grocery_app
   ```
   
   Bạn có thể chạy dự án thông qua IDE (IntelliJ IDEA, Eclipse, VS Code) bằng cách chạy class Main, hoặc thông qua Maven Wrapper trên Terminal:
   
   - Trên Windows:
     ```bash
     mvnw.cmd spring-boot:run
     ```
   - Trên macOS/Linux:
     ```bash
     ./mvnw spring-boot:run
     ```

3. Ứng dụng Backend mặc định thường khởi chạy ở cổng `http://localhost:8080`.
