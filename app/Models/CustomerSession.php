<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CustomerSession extends Model
{
    protected $fillable = [
        'session_token',
        'table_id',
        'customer_name',
        'customer_phone',
        'is_active',
        'expires_at'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function orders()
    {
        return Order::where('table_id', $this->table_id)
            ->where('created_at', '>=', $this->created_at);
    }

    public static function generateToken()
    {
        return Str::random(32);
    }
}
