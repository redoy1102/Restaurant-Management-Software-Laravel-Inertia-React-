<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'order_id',
        'table_id',
        'invoice_number',
        'total_amount',
        'preparation_time',
        'status',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'payment_method',
        'issued_at'
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'total_amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public static function generateInvoiceNumber()
    {
        $lastInvoice = self::latest('id')->first();
        $number = $lastInvoice ? $lastInvoice->id + 1 : 1;
        return 'INV-' . date('Y') . '-' . str_pad($number, 6, '0', STR_PAD_LEFT);
    }
}
