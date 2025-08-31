<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .company-name {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }

        .company-info {
            color: #666;
            font-size: 14px;
        }

        .invoice-details {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }

        .invoice-left,
        .invoice-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }

        .invoice-right {
            text-align: right;
        }

        .invoice-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .detail-row {
            margin-bottom: 8px;
        }

        .detail-label {
            font-weight: bold;
        }

        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }

        .badge-paid {
            background-color: #dcfce7;
            color: #166534;
        }

        .badge-unpaid {
            background-color: #fef3c7;
            color: #92400e;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .items-table th,
        .items-table td {
            border: 1px solid #ddd;
            padding: 12px;
        }

        .items-table th {
            background-color: #f9fafb;
            font-weight: bold;
            text-align: left;
        }

        .items-table td.text-center {
            text-align: center;
        }

        .items-table td.text-right {
            text-align: right;
        }

        .summary {
            float: right;
            width: 300px;
            margin-bottom: 30px;
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }

        .summary-total {
            border-top: 1px solid #333;
            padding-top: 8px;
            font-weight: bold;
            font-size: 18px;
        }

        .footer {
            clear: both;
            text-align: center;
            border-top: 1px solid #ddd;
            padding-top: 20px;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>

<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="company-name">Jolshiri Restaurant</div>
            <div class="company-info">
                123 Restaurant Street, Food City, FC 12345<br>
                Phone: (555) 123-4567 | Email: info@jolshiri.com
            </div>
        </div>

        <!-- Invoice Details -->
        <div class="invoice-details">
            <div class="invoice-left">
                <div class="invoice-title">Invoice</div>
                <div class="detail-row">
                    <span class="detail-label">Invoice Number:</span> {{ $invoice->invoice_number }}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Order Number:</span> #{{ $invoice->order->id }}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Issue Date:</span> {{ $invoice->issued_at->format('M d, Y') }}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Table:</span> {{ $invoice->order->table->name }}
                </div>
            </div>
            <div class="invoice-right">
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="badge {{ $invoice->status === 'paid' ? 'badge-paid' : 'badge-unpaid' }}">
                        {{ ucfirst($invoice->status) }}
                    </span>
                </div>
                @if ($invoice->order->customer_name)
                    <div class="detail-row">
                        <span class="detail-label">Customer:</span> {{ $invoice->order->customer_name }}
                    </div>
                @endif
                @if ($invoice->order->customer_phone)
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span> {{ $invoice->order->customer_phone }}
                    </div>
                @endif
                @if ($invoice->preparation_time > 0)
                    <div class="detail-row">
                        <span class="detail-label">Preparation Time:</span> {{ $invoice->preparation_time }} minutes
                    </div>
                @endif
            </div>
        </div>

        <!-- Order Items -->
        <h3>Order Items</h3>
        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="text-center">Quantity</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($invoice->order->orderItems as $item)
                    <tr>
                        <td>{{ $item->food->name }}</td>
                        <td class="text-center">{{ $item->quantity }}</td>
                        <td class="text-right">${{ number_format($item->price / $item->quantity, 2) }}</td>
                        <td class="text-right">${{ number_format($item->price, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Invoice Summary -->
        <div class="summary">
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>${{ number_format($invoice->subtotal, 2) }}</span>
            </div>
            @if ($invoice->discount_amount > 0)
                <div class="summary-row">
                    <span>Discount:</span>
                    <span>-${{ number_format($invoice->discount_amount, 2) }}</span>
                </div>
            @endif
            <div class="summary-row">
                <span>Tax (10%):</span>
                <span>${{ number_format($invoice->tax_amount, 2) }}</span>
            </div>
            <div class="summary-row summary-total">
                <span>Total Amount:</span>
                <span>${{ number_format($invoice->total_amount, 2) }}</span>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Thank you for dining with us!</p>
            <p>Please come again.</p>
        </div>
    </div>
</body>

</html>
