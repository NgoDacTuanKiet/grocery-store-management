package com.grocery_app.service;

import com.grocery_app.model.dto.request.PaymentReceiptRequest;
import com.grocery_app.model.dto.response.PaymentReceiptResponse;
import com.grocery_app.model.entity.Customer;
import com.grocery_app.model.entity.Invoice;
import com.grocery_app.model.entity.PaymentReceipt;
import com.grocery_app.model.entity.User;
import com.grocery_app.model.enums.InvoiceStatus;
import com.grocery_app.repository.CustomerRepository;
import com.grocery_app.repository.InvoiceRepository;
import com.grocery_app.repository.PaymentReceiptRepository;
import com.grocery_app.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentReceiptService {

    private final PaymentReceiptRepository paymentReceiptRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;

    public PaymentReceiptService(PaymentReceiptRepository paymentReceiptRepository,
                                 CustomerRepository customerRepository,
                                 InvoiceRepository invoiceRepository,
                                 UserRepository userRepository) {
        this.paymentReceiptRepository = paymentReceiptRepository;
        this.customerRepository = customerRepository;
        this.invoiceRepository = invoiceRepository;
        this.userRepository = userRepository;
    }

    @Transactional(rollbackFor = Exception.class)
    public PaymentReceiptResponse createReceipt(PaymentReceiptRequest request) {
        // 1. Get logged-in staff
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User staff = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Lỗi xác thực nhân viên"));

        // 2. Validate customer
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        if (request.getAmount() <= 0) {
            throw new RuntimeException("Số tiền thu phải lớn hơn 0");
        }

        // 3. Create receipt
        PaymentReceipt receipt = new PaymentReceipt();
        receipt.setReceiptCode("PR-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        receipt.setCustomer(customer);
        receipt.setStaff(staff);
        receipt.setAmount(request.getAmount());
        receipt.setPaymentMethod(request.getPaymentMethod());
        receipt.setNote(request.getNote());

        PaymentReceipt savedReceipt = paymentReceiptRepository.save(receipt);

        // 4. Waterfall debt deduction
        double amountToDistribute = request.getAmount();

        // Fetch unpaid invoices sorted by oldest first
        List<Invoice> unpaidInvoices = invoiceRepository.findByCustomerIdAndStatusOrderByCreatedAtAsc(
                customer.getId(), InvoiceStatus.UNPAID);

        for (Invoice invoice : unpaidInvoices) {
            if (amountToDistribute <= 0) break;

            double remainingDebtOnInvoice = invoice.getTotalAmount() - invoice.getPaidAmount();

            if (amountToDistribute >= remainingDebtOnInvoice) {
                // Pay off this invoice entirely
                invoice.setPaidAmount(invoice.getTotalAmount());
                invoice.setStatus(InvoiceStatus.PAID);
                amountToDistribute -= remainingDebtOnInvoice;
            } else {
                // Partial payment
                invoice.setPaidAmount(invoice.getPaidAmount() + amountToDistribute);
                amountToDistribute = 0; // All money distributed
            }

            invoiceRepository.save(invoice);
        }

        // 5. Update customer total debt
        double newTotalDebt = customer.getTotalDebt() - request.getAmount();
        if (newTotalDebt < 0) {
            newTotalDebt = 0.0; // Avoid negative debt if they overpay slightly, or could be handled as credit
        }
        customer.setTotalDebt(newTotalDebt);
        customerRepository.save(customer);

        return mapToResponse(savedReceipt);
    }

    public List<PaymentReceiptResponse> getReceiptsByCustomer(Long customerId) {
        return paymentReceiptRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PaymentReceiptResponse mapToResponse(PaymentReceipt receipt) {
        PaymentReceiptResponse res = new PaymentReceiptResponse();
        res.setId(receipt.getId());
        res.setReceiptCode(receipt.getReceiptCode());
        if (receipt.getCustomer() != null) {
            res.setCustomerId(receipt.getCustomer().getId());
            res.setCustomerName(receipt.getCustomer().getFullName());
        }
        if (receipt.getStaff() != null) {
            res.setStaffName(receipt.getStaff().getFullName());
        }
        res.setAmount(receipt.getAmount());
        res.setPaymentMethod(receipt.getPaymentMethod());
        res.setNote(receipt.getNote());
        res.setCreatedAt(receipt.getCreatedAt());
        return res;
    }
}
