<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function show($invoiceId)
    {
        $invoice = Invoice::with(['order.orderItems.food', 'order.table', 'table'])
            ->findOrFail($invoiceId);

        return Inertia::render('Invoice', [
            'invoice' => $invoice,
        ]);
    }

    public function downloadPdf($invoiceId)
    {
        $invoice = Invoice::with(['order.orderItems.food', 'order.table', 'table'])
            ->findOrFail($invoiceId);

        // For now, return a simple HTML view that can be printed as PDF
        return view('invoice-pdf', compact('invoice'));
    }

    public static function generateInvoiceForOrder(Order $order)
    {
        // Check if invoice already exists
        if ($order->invoice) {
            return $order->invoice;
        }

        // Calculate invoice details
        $subtotal = $order->total_amount;
        $taxRate = 0.10; // 10% tax
        $taxAmount = $subtotal * $taxRate;
        $totalAmount = $subtotal + $taxAmount;

        // Create invoice
        $invoice = Invoice::create([
            'order_id' => $order->id,
            'table_id' => $order->table_id,
            'invoice_number' => Invoice::generateInvoiceNumber(),
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'discount_amount' => 0,
            'total_amount' => $totalAmount,
            'preparation_time' => $order->preparation_time ?? 0,
            'status' => 'unpaid',
            'issued_at' => now(),
        ]);

        return $invoice;
    }
}
