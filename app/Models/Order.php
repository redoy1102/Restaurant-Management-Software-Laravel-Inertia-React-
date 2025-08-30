<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'table_id',
        'status',
        'chef_id',
        'preparation_time',
        'customer_name',
        'customer_phone',
        'total_amount',
        'notes'
    ];

    protected $casts = [
        'preparation_time' => 'integer',
        'total_amount' => 'decimal:2',
    ];

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function chef()
    {
        return $this->belongsTo(User::class, 'chef_id');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }
}
