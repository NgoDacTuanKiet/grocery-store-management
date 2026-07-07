package com.grocery_app.service;

import com.grocery_app.model.dto.request.CreateCustomerRequest;
import com.grocery_app.model.dto.request.InvoiceItemRequest;
import com.grocery_app.model.dto.request.InvoiceRequest;
import com.grocery_app.model.dto.response.InvoiceResponse;
import com.grocery_app.model.entity.Customer;
import com.grocery_app.model.entity.Invoice;
import com.grocery_app.model.entity.InvoiceItem;
import com.grocery_app.model.entity.ProductDetail;
import com.grocery_app.model.entity.User;
import com.grocery_app.model.enums.InvoiceStatus;
import com.grocery_app.repository.CustomerRepository;
import com.grocery_app.repository.InvoiceRepository;
import com.grocery_app.repository.ProductDetailRepository;
import com.grocery_app.repository.UserRepository;

import org.modelmapper.Converter;
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
    private final ProductDetailRepository productDetailRepository;
    private final ModelMapper modelMapper;

    public InvoiceService(InvoiceRepository invoiceRepository, 
                          UserRepository userRepository,
                          CustomerRepository customerRepository,
                          ProductDetailRepository productDetailRepository,
                          ModelMapper modelMapper) {
        super(invoiceRepository, modelMapper, InvoiceResponse.class);
        this.invoiceRepository = invoiceRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.productDetailRepository = productDetailRepository;
        this.modelMapper = modelMapper;

        // 1. Tạo bộ quy tắc bóc tách tên Khách hàng
        Converter<Customer, String> customerConverter = context -> 
                context.getSource() == null ? "Khách vãng lai" : context.getSource().getFullName();
                
        // 2. Tạo bộ quy tắc bóc tách tên Nhân viên
        Converter<User, String> staffConverter = context -> 
                context.getSource() == null ? "Không xác định" : context.getSource().getFullName();

        // 3. Áp dụng quy tắc vào ModelMapper (Chỉ tạo nếu chưa có để tránh lỗi)
        if (this.modelMapper.getTypeMap(Invoice.class, InvoiceResponse.class) == null) {
            this.modelMapper.createTypeMap(Invoice.class, InvoiceResponse.class).addMappings(mapper -> {
                mapper.using(customerConverter).map(Invoice::getCustomer, InvoiceResponse::setCustomerName);
                mapper.using(staffConverter).map(Invoice::getStaff, InvoiceResponse::setStaffName);
            });
        }
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

        // 2. Map dữ liệu khách hàng (Xử lý cả Khách cũ và Khách mới)
        if (request.getCustomerId() != null) {
            // Trường hợp 1: Chọn khách cũ từ danh sách
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
            invoice.setCustomer(customer);
            
        } else if (request.getNewCustomer() != null) {
            // Trường hợp 2: Khách mới hoàn toàn (Lưu xuống DB ngay tại đây)
            CreateCustomerRequest newCusReq = request.getNewCustomer();
            
            // Kiểm tra trùng số điện thoại (Giống hệt logic bên CustomerService)
            if (customerRepository.findByPhone(newCusReq.getPhone()).isPresent()) {
                throw new RuntimeException("Số điện thoại khách hàng đã tồn tại!");
            }
            
            Customer newCustomer = new Customer();
            newCustomer.setFullName(newCusReq.getFullName());
            newCustomer.setPhone(newCusReq.getPhone());
            newCustomer.setTotalDebt(0.0);
            
            // Hibernate sẽ lưu khách hàng này trước, lấy ID, rồi mới gắn vào Hóa đơn
            Customer savedCustomer = customerRepository.save(newCustomer); 
            invoice.setCustomer(savedCustomer);
        }

        double totalAmount = 0.0;
        List<InvoiceItem> items = new ArrayList<>();

        for (InvoiceItemRequest itemReq : request.getItems()) {
            
            // BƯỚC 3.1: Vẫn phải gọi DB để lấy giá và tên chuẩn xác (Chống Frontend gửi giá ảo)
            ProductDetail productDetail = productDetailRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm có ID: " + itemReq.getProductId()));

            InvoiceItem item = new InvoiceItem();
            item.setInvoice(invoice);
            
            // BƯỚC 3.2: LƯU SNAPSHOT (Chép dữ liệu tĩnh vào Hóa đơn)
            item.setProductId(productDetail.getId());
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(productDetail.getPrice()); // Chốt cứng giá bán tại thời điểm này
            
            // Ghép tên Sản phẩm cha + Thuộc tính phân loại để lưu cứng vào hóa đơn
            // Ví dụ: "Dây điện Trần Phú - Phân loại: 0.5 ly"
            String baseName = productDetail.getProduct().getName();
            String variantName = productDetail.getAttributes().containsKey("Phân loại") 
                                 ? productDetail.getAttributes().get("Phân loại") 
                                 : "Mặc định";
            item.setProductName(baseName + " (" + variantName + ")");
            
            // BƯỚC 3.3: Tính thành tiền
            double subTotal = productDetail.getPrice() * itemReq.getQuantity();
            item.setSubTotal(subTotal);

            productDetail.setStockQuantity(productDetail.getStockQuantity() - itemReq.getQuantity());
            
            // Thêm vào danh sách tổng và cộng tiền
            totalAmount += subTotal;
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

        if (savedInvoice.getCustomer() != null) {
            Customer customer = savedInvoice.getCustomer();
            
            // Tính số nợ mới: Nợ cũ + (Tổng tiền - Đã trả)
            double currentDebt = customer.getTotalDebt() != null ? customer.getTotalDebt() : 0.0;
            double invoiceDebt = savedInvoice.getTotalAmount() - savedInvoice.getPaidAmount();
            
            customer.setTotalDebt(currentDebt + invoiceDebt);
            
            // Lưu lại thông tin khách hàng đã cập nhật
            customerRepository.save(customer);
        }
        
        return mapToResponse(savedInvoice);
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        return modelMapper.map(invoice, InvoiceResponse.class);
    }
}