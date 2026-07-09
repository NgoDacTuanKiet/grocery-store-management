package com.grocery_app.exception;

import com.grocery_app.model.dto.ResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<ResponseDto<Object>> handleBadCredentialsException(org.springframework.security.authentication.BadCredentialsException ex) {
        log.error("BadCredentialsException: ", ex);
        return new ResponseEntity<>(ResponseDto.builder().success(false).message("Tài khoản hoặc mật khẩu không chính xác!").build(), HttpStatus.UNAUTHORIZED);
    }

    // Lỗi liên quan đến quyền truy cập (Spring Security)
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ResponseDto<Object>> handleAccessDeniedException(org.springframework.security.access.AccessDeniedException ex) {
        log.error("AccessDeniedException: ", ex);
        return new ResponseEntity<>(ResponseDto.builder().success(false).message("Bạn không có quyền thực hiện hành động này!").build(), HttpStatus.FORBIDDEN);
    }

    // Lỗi vi phạm ràng buộc dữ liệu (Ví dụ: Trùng Unique Key, Lỗi khóa ngoại)
    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<ResponseDto<Object>> handleDataIntegrityViolationException(org.springframework.dao.DataIntegrityViolationException ex) {
        log.error("DataIntegrityViolationException: ", ex);
        String message = "Dữ liệu không hợp lệ hoặc đã tồn tại trong hệ thống (Trùng lặp hoặc bị ràng buộc).";
        return new ResponseEntity<>(ResponseDto.builder().success(false).message(message).build(), HttpStatus.CONFLICT);
    }

    // Lỗi gửi sai định dạng JSON hoặc thiếu Body
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ResponseDto<Object>> handleHttpMessageNotReadableException(org.springframework.http.converter.HttpMessageNotReadableException ex) {
        log.error("HttpMessageNotReadableException: ", ex);
        return new ResponseEntity<>(ResponseDto.builder().success(false).message("Dữ liệu gửi lên không đúng định dạng (Lỗi cú pháp JSON).").build(), HttpStatus.BAD_REQUEST);
    }
    
    // Lỗi gọi sai HTTP Method (VD: API yêu cầu POST nhưng gọi GET)
    @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ResponseDto<Object>> handleHttpRequestMethodNotSupportedException(org.springframework.web.HttpRequestMethodNotSupportedException ex) {
        log.error("HttpRequestMethodNotSupportedException: ", ex);
        return new ResponseEntity<>(ResponseDto.builder().success(false).message("Phương thức gọi API không được hỗ trợ.").build(), HttpStatus.METHOD_NOT_ALLOWED);
    }

    // Lỗi NotFound do truy cập sai đường dẫn API (Dành cho Spring Boot 3)
    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public ResponseEntity<ResponseDto<Object>> handleNoResourceFoundException(org.springframework.web.servlet.resource.NoResourceFoundException ex) {
        log.error("NoResourceFoundException: ", ex);
        return new ResponseEntity<>(ResponseDto.builder().success(false).message("Đường dẫn API không tồn tại.").build(), HttpStatus.NOT_FOUND);
    }

    // Các lỗi nghiệp vụ (Business Logic) do lập trình viên chủ động ném ra
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ResponseDto<Object>> handleRuntimeException(RuntimeException ex) {
        log.error("RuntimeException: ", ex);
        return new ResponseEntity<>(ResponseDto.builder().success(false).message(ex.getMessage()).build(), HttpStatus.BAD_REQUEST);
    }

    // Lỗi chung (Bắt tất cả những Exception chưa được xử lý ở trên)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseDto<Object>> handleGlobalException(Exception ex) {
        log.error("Exception caught in GlobalExceptionHandler: ", ex);
        return new ResponseEntity<>(ResponseDto.builder().success(false).message("Đã có lỗi xảy ra từ hệ thống máy chủ.").build(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
