import dayjs from 'dayjs';

export const printInvoiceData = (invoice) => {
    if (!invoice) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Vui lòng cho phép popup để in hóa đơn");
        return;
    }

    const itemsHtml = (invoice.items || []).map((item, index) => `
        <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td>${item.productName}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${item.unitPrice?.toLocaleString('vi-VN')} đ</td>
            <td style="text-align: right; font-weight: bold;">${item.subTotal?.toLocaleString('vi-VN')} đ</td>
        </tr>
    `).join('');

    const html = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>In Hóa Đơn - ${invoice.invoiceCode}</title>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h2 { margin: 0; padding: 0; }
                    .info-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
                    .info-table td { padding: 5px; vertical-align: top; }
                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .items-table th, .items-table td { border: 1px solid #ccc; padding: 8px; }
                    .items-table th { background: #f0f0f0; }
                    .total-section { float: right; width: 300px; }
                    .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .total-row.bold { font-weight: bold; font-size: 16px; }
                    @media print {
                        @page { margin: 0; }
                        body { margin: 1.6cm; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>HÓA ĐƠN BÁN HÀNG</h2>
                    <p>Mã HĐ: <strong>${invoice.invoiceCode}</strong></p>
                </div>

                <table class="info-table">
                    <tr>
                        <td><strong>Khách hàng:</strong> ${invoice.customerName || 'Khách vãng lai'}</td>
                        <td><strong>Ngày tạo:</strong> ${invoice.createdAt ? dayjs(invoice.createdAt).format('DD/MM/YYYY HH:mm') : ''}</td>
                    </tr>
                    <tr>
                        <td><strong>Thu ngân:</strong> ${invoice.staffName}</td>
                        <td><strong>Trạng thái:</strong> ${invoice.status === 'PAID' ? 'Đã thanh toán' : 'Ghi nợ'}</td>
                    </tr>
                    <tr>
                        <td><strong>Hình thức:</strong> ${invoice.paymentMethod === 'CASH' ? 'Tiền mặt' : invoice.paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : invoice.paymentMethod}</td>
                        <td></td>
                    </tr>
                </table>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="total-section">
                    <div class="total-row bold">
                        <span>Tổng tiền hàng:</span>
                        <span>${invoice.totalAmount?.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div class="total-row">
                        <span>Khách đã trả:</span>
                        <span>${invoice.paidAmount?.toLocaleString('vi-VN')} đ</span>
                    </div>
                    ${(invoice.totalAmount - invoice.paidAmount) > 0 ? `
                    <div class="total-row bold" style="color: red;">
                        <span>Còn nợ:</span>
                        <span>${(invoice.totalAmount - invoice.paidAmount)?.toLocaleString('vi-VN')} đ</span>
                    </div>
                    ` : ''}
                </div>

                <div style="clear: both; margin-top: 50px; text-align: center;">
                    <div style="float: left; width: 50%;">
                        <strong>Khách hàng</strong><br/>
                        <span style="font-size: 12px; color: #666;">(Ký, ghi rõ họ tên)</span>
                    </div>
                    <div style="float: right; width: 50%;">
                        <strong>Người lập phiếu</strong><br/>
                        <span style="font-size: 12px; color: #666;">(Ký, ghi rõ họ tên)</span>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    }
                </script>
            </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
};
