<?php

use App\Models\Food;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Table;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FoodController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\OrderItemController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'foods' => Food::all(),
        'tables' => Table::all(),
        'orders' => Order::all(),
    ]);
})->name('home');

// Public API endpoint for placing orders (no auth required)
// Route::post('/api/orders', [OrderController::class, 'store'])->name('api.orders.store');

// Public route for placing orders via Inertia (no auth required)
Route::post('/place-order', [OrderController::class, 'store'])->name('orders.store.public');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $orders = Order::with(['table', 'orderItems.food', 'chef'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('dashboard', [
            'orders' => $orders
        ]);
    })->name('dashboard');

    Route::resource('tables', TableController::class);
    Route::resource('foods', FoodController::class);
    Route::resource('orders', OrderController::class);
    Route::resource('invoices', InvoiceController::class);
    Route::resource('order_items', OrderItemController::class);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
