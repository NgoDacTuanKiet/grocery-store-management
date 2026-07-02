package com.grocery_app.service;

import org.modelmapper.ModelMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grocery_app.model.dto.request.CreateUserRequest;
import com.grocery_app.model.dto.response.UserResponse;
import com.grocery_app.model.entity.User;
import com.grocery_app.model.enums.Role;
import com.grocery_app.model.enums.UserStatus;
import com.grocery_app.repository.UserRepository;


@Service
public class UserService extends GetListPageableService <User, UserResponse> {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, ModelMapper modelMapper, PasswordEncoder passwordEncoder) {
        
        super(userRepository, modelMapper, UserResponse.class);

        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
        this.passwordEncoder = passwordEncoder;
    }

     //Hàm lấy thông tin Profile của người dùng đang đăng nhập
    public UserResponse getCurrentUserProfile() {
        // 1. Lấy thông tin chứng minh thư (Authentication) từ Security Context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Kiểm tra xem người dùng đã đăng nhập chưa (đề phòng lọt qua filter)
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn (Lỗi 401)");
        }

        // 2. Lấy username từ Authentication
        String username = authentication.getName();

        // 3. Truy vấn Database để lấy toàn bộ thông tin User
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dữ liệu người dùng trong hệ thống"));

        // 4. Chuyển đổi Entity sang DTO (Bỏ mật khẩu đi)
        return modelMapper.map(user, UserResponse.class);
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));
        
        return modelMapper.map(user, UserResponse.class);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteUser(Long id) {
        // 1. Tìm user theo ID
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));

        // 2. Chốt chặn bảo mật: Không cho phép tự xóa chính mình
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (user.getUsername().equals(currentUsername)) {
            throw new RuntimeException("Lỗi: Bạn không thể tự khóa/xóa tài khoản của chính mình!");
        }

        // 3. Thực hiện xóa mềm
        user.setStatus(UserStatus.INACTIVE); // Đảm bảo bạn đã import Enum UserStatus
        
        // 4. Lưu lại vào DB
        userRepository.save(user);
    }
    
    
     //Hàm Khôi phục tài khoản
    @Transactional(rollbackFor = Exception.class)
    public void restoreUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }
    
    public UserResponse saveUser(User user) {
        User savedUser = userRepository.save(user);
        return modelMapper.map(savedUser, UserResponse.class);
    }

    
     //Tạo tài khoản nhân viên mới (Mặc định Role = STAFF, Status = ACTIVE)
    @Transactional(rollbackFor = Exception.class)
    public UserResponse createStaff(CreateUserRequest request) {
        // 1. Kiểm tra trùng lặp trùng tên tài khoản trùng
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Tài khoản (Username) này đã tồn tại trong hệ thống!");
        }

        // 2. Map dữ liệu thô từ Request sang Entity User
        User user = modelMapper.map(request, User.class);

        // 3. Ép buộc các giá trị mặc định theo nghiệp vụ bảo mật
        user.setPassword(passwordEncoder.encode(request.getPassword())); // Bắt buộc băm mật khẩu
        user.setRole(Role.STAFF);
        user.setStatus(UserStatus.ACTIVE);

        // 4. Lưu dữ liệu
        User savedUser = userRepository.save(user);

        // 5. Chuyển đổi và trả về kết quả định dạng Response sạch (ẩn pass)
        return modelMapper.map(savedUser, UserResponse.class);
    }
}
