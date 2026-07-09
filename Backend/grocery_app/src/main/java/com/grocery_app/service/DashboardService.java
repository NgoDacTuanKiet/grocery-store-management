package com.grocery_app.service;

import com.grocery_app.model.dto.response.DashboardResponse;
import com.grocery_app.model.entity.Customer;
import com.grocery_app.model.entity.Invoice;
import com.grocery_app.model.entity.ProductDetail;
import com.grocery_app.repository.CustomerRepository;
import com.grocery_app.repository.InvoiceRepository;
import com.grocery_app.repository.ProductDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final ProductDetailRepository productDetailRepository;

    public DashboardResponse getDashboardData() {
        // 1. Thống kê nhanh
        Double todayRevenue = invoiceRepository.getTodayRevenue();
        Long todayOrders = invoiceRepository.countTodayOrders();
        Double totalDebt = customerRepository.getTotalDebt();
        Long lowStockCount = productDetailRepository.countByStockQuantityLessThanEqual(10);

        // 2. Biểu đồ doanh thu 7 ngày
        List<Object[]> rawRevenue = invoiceRepository.getLast7DaysRevenue();
        List<DashboardResponse.DailyRevenue> last7DaysRevenue = new ArrayList<>();
        
        // Điền dữ liệu mặc định 0 cho 7 ngày gần nhất để đảm bảo biểu đồ không bị gãy
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = 6; i >= 0; i--) {
            String dateStr = LocalDate.now().minusDays(i).format(formatter);
            double rev = 0.0;
            
            // Tìm trong kết quả query
            for (Object[] row : rawRevenue) {
                if (row[0].toString().equals(dateStr)) {
                    rev = ((Number) row[1]).doubleValue();
                    break;
                }
            }
            
            last7DaysRevenue.add(DashboardResponse.DailyRevenue.builder()
                    .date(dateStr)
                    .revenue(rev)
                    .build());
        }

        // 3. Khách nợ nhiều nhất
        List<DashboardResponse.CustomerDebt> topDebtors = customerRepository.findTop5ByOrderByTotalDebtDesc()
                .stream()
                .filter(c -> c.getTotalDebt() > 0)
                .map(c -> DashboardResponse.CustomerDebt.builder()
                        .customerId(c.getId())
                        .customerName(c.getFullName())
                        .phone(c.getPhone())
                        .debt(c.getTotalDebt())
                        .build())
                .collect(Collectors.toList());

        // 4. Sản phẩm sắp hết hàng
        List<DashboardResponse.LowStockProduct> lowStockProducts = productDetailRepository.findTop5ByStockQuantityLessThanEqualOrderByStockQuantityAsc(10)
                .stream()
                .map(pd -> DashboardResponse.LowStockProduct.builder()
                        .productId(pd.getProduct().getId())
                        .productName(pd.getProduct().getName())
                        .stockQuantity(pd.getStockQuantity())
                        .build())
                .collect(Collectors.toList());

        // 5. Hoạt động gần đây (5 hóa đơn mới nhất)
        List<DashboardResponse.RecentActivity> recentActivities = invoiceRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(inv -> DashboardResponse.RecentActivity.builder()
                        .id(inv.getInvoiceCode())
                        .type("INVOICE")
                        .description("Bán hàng cho " + (inv.getCustomer() != null ? inv.getCustomer().getFullName() : "Khách lẻ"))
                        .amount(inv.getTotalAmount())
                        .time(inv.getCreatedAt() != null ? inv.getCreatedAt().toString() : "")
                        .build())
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .todayRevenue(todayRevenue)
                .todayOrders(todayOrders)
                .totalDebt(totalDebt)
                .lowStockCount(lowStockCount)
                .last7DaysRevenue(last7DaysRevenue)
                .topDebtors(topDebtors)
                .lowStockProducts(lowStockProducts)
                .recentActivities(recentActivities)
                .build();
    }
}
