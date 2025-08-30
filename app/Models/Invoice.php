<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'order_id',
        'invoice_number',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'payment_status',
        'payment_method',
        'issued_at'
    ];

    protected $casts = [
        'issued_at' => 'datetime'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
