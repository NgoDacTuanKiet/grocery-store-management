package com.grocery_app.service;

import com.grocery_app.model.dto.request.InvoiceItemRequest;
import com.grocery_app.model.dto.request.InvoiceRequest;
import com.grocery_app.model.dto.response.InvoiceResponse;
import com.grocery_app.model.entity.Customer;
import com.grocery_app.model.entity.Invoice;
import com.grocery_app.model.entity.InvoiceItem;
import com.grocery_app.model.entity.User;
import com.grocery_app.model.enums.InvoiceStatus;
import com.grocery_app.repository.CustomerRepository;
import com.grocery_app.repository.InvoiceRepository;
import com.grocery_app.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class InvoiceService extends GetListPageableService<Invoice, InvoiceResponse> {

    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final ModelMapper modelMapper;

    public InvoiceService(InvoiceRepository invoiceRepository, 
                          UserRepository userRepository,
                          CustomerRepository customerRepository,
                          ModelMapper modelMapper) {
        super(invoiceRepository, modelMapper, InvoiceResponse.class);
        this.invoiceRepository = invoiceRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    protected List<String> getSearchFields() {
        return List.of("invoiceCode"); // Tìm kiếm hóa đơn theo mã
    }

    //Lấy chi tiết hóa đơn
    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn!"));
        return mapToResponse(invoice);
    }

    //Tạo hóa đơn mới (Bán hàng)
    @Transactional(rollbackFor = Exception.class)
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        Invoice invoice = new Invoice();

        // 1. Tự động lấy nhân viên đang đăng nhập (Người tạo hóa đơn)
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User staff = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Lỗi xác thực nhân viên"));
        invoice.setStaff(staff);

        // 2. Map dữ liệu khách hàng (Nếu có)
        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
            invoice.setCustomer(customer);
        }

        // 3. Xử lý danh sách hàng hóa và tính toán tiền bạc
        double totalAmount = 0.0;

        List<InvoiceItem> items = new ArrayList<>();
        for (InvoiceItemRequest itemReq : request.getItems()) {
            
            //Chuyển đổi dữ liệu từ dto sang bản Entity
            InvoiceItem item = modelMapper.map(itemReq, InvoiceItem.class);
            
            //Backend tự tính Thành tiền = Đơn giá * Số lượng
            double subTotal = item.getUnitPrice() * item.getQuantity();
            item.setSubTotal(subTotal);
            
            //Gắn mối quan hệ ngược lại với hóa đơn cha (Bắt buộc để lưu Cascade)
            item.setInvoice(invoice);
            
            //Thêm phần tử đã xử lý xong vào danh sách tổng
            items.add(item);
        }

        // 4. Cộng dồn tổng tiền
        totalAmount = items.stream().mapToDouble(InvoiceItem::getSubTotal).sum();
        
        // 5. Gán các thông tin còn lại
        invoice.setItems(items);
        invoice.setTotalAmount(totalAmount);
        invoice.setPaidAmount(request.getPaidAmount() != null ? request.getPaidAmount() : 0.0);
        invoice.setPaymentMethod(request.getPaymentMethod());
        
        // Tạo mã hóa đơn ngẫu nhiên (VD: INV-8F92A)
        invoice.setInvoiceCode("INV-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());

        // Xác định trạng thái thanh toán
        if (invoice.getPaidAmount() >= invoice.getTotalAmount()) {
            invoice.setStatus(InvoiceStatus.PAID); // Giả định bạn có Enum này
        } else {
            invoice.setStatus(InvoiceStatus.UNPAID); // Hoặc PARTIAL (Thanh toán 1 phần)
        }

        // 6. Lưu vào DB
        Invoice savedInvoice = invoiceRepository.save(invoice);
        return mapToResponse(savedInvoice);
    }

    // Hàm Map tùy chỉnh để lấy tên Nhân viên và Khách hàng
    private InvoiceResponse mapToResponse(Invoice invoice) {
        InvoiceResponse response = modelMapper.map(invoice, InvoiceResponse.class);
        if (invoice.getStaff() != null) {
            response.setStaffName(invoice.getStaff().getFullName());
        }
        if (invoice.getCustomer() != null) {
            response.setCustomerName(invoice.getCustomer().getFullName());
        } else {
            response.setCustomerName("Khách vãng lai");
        }
        return response;
    }
}