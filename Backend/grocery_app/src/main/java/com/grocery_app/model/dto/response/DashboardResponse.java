package com.grocery_app.model.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardResponse {
    // Thẻ thống kê
    private Double todayRevenue;
    private Long todayOrders;
    private Double totalDebt;
    private Long lowStockCount;

    // Biểu đồ
    private List<DailyRevenue> last7DaysRevenue;

    // Cảnh báo & Công việc
    private List<CustomerDebt> topDebtors;
    private List<LowStockProduct> lowStockProducts;

    // Hoạt động gần đây
    private List<RecentActivity> recentActivities;

    @Data
    @Builder
    public static class DailyRevenue {
        private String date;
        private Double revenue;
    }

    @Data
    @Builder
    public static class CustomerDebt {
        private Long customerId;
        private String customerName;
        private String phone;
        private Double debt;
    }

    @Data
    @Builder
    public static class LowStockProduct {
        private Long productId;
        private String productName;
        private Integer stockQuantity;
    }

    @Data
    @Builder
    public static class RecentActivity {
        private String id; // Invoice code or receipt code
        private String type; // INVOICE, RECEIPT
        private String description;
        private Double amount;
        private String time;
    }
}
