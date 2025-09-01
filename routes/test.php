<?php

use Illuminate\Support\Facades\Route;
use App\Events\OrderPlaced;
use App\Models\Order;

Route::get('/test-broadcast', function () {
    // Get the latest order to test broadcasting
    $order = Order::with(['table', 'orderItems.food'])->latest()->first();

    if ($order) {
        event(new OrderPlaced($order));
        return response()->json([
            'success' => true,
            'message' => 'OrderPlaced event broadcasted for order #' . $order->id,
            'order_id' => $order->id
        ]);
    }

    return response()->json([
        'success' => false,
        'message' => 'No orders found to test with'
    ]);
});
