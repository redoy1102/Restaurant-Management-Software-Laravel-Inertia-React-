<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Food;
use App\Models\Table;
use App\Models\CustomerSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['table', 'orderItems.food', 'chef'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_id' => 'required|exists:tables,id',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'string|max:20',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.food_id' => 'required|exists:foods,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();

        try {
            // Calculate total amount
            $totalAmount = 0;
            $orderItems = [];

            foreach ($validated['items'] as $item) {
                $food = Food::findOrFail($item['food_id']);
                $itemTotal = $food->price * $item['quantity'];
                $totalAmount += $itemTotal;

                $orderItems[] = [
                    'food_id' => $item['food_id'],
                    'quantity' => $item['quantity'],
                    'price' => $itemTotal,
                ];
            }

            // Create or get customer session
            $customerSession = CustomerSession::create([
                'session_token' => CustomerSession::generateToken(),
                'table_id' => $validated['table_id'],
                'customer_name' => $validated['customer_name'] ?? null,
                'customer_phone' => $validated['customer_phone'] ?? null,
                'expires_at' => now()->addHours(6), // Session expires in 6 hours
            ]);

            // Create order
            $order = Order::create([
                'table_id' => $validated['table_id'],
                'customer_name' => $validated['customer_name'] ?? null,
                'customer_phone' => $validated['customer_phone'] ?? null,
                'status' => 'pending',
                'total_amount' => $totalAmount,
                'notes' => $validated['notes'] ?? null,
                'customer_session_id' => $customerSession->id,
            ]);

            // Create order items
            foreach ($orderItems as $orderItem) {
                $orderItem['order_id'] = $order->id;
                OrderItem::create($orderItem);
            }

            DB::commit();

            // Check if this is an Inertia request or API request
            if ($request->header('X-Inertia')) {
                // For Inertia requests, redirect to customer dashboard
                return redirect()->route('customer.dashboard', ['sessionToken' => $customerSession->session_token])
                    ->with('success', 'Order placed successfully!');
            }

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully!',
                'order_id' => $order->id,
                'customer_dashboard_url' => route('customer.dashboard', ['sessionToken' => $customerSession->session_token]),
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Order creation failed: ' . $e->getMessage());

            // Check if this is an Inertia request or API request
            if ($request->header('X-Inertia')) {
                return redirect()->back()->withErrors(['error' => 'Failed to place order. Please try again.']);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to place order. Please try again.',
            ], 500);
        }
    }

    public function show(Order $order)
    {
        $order->load(['table', 'orderItems.food']);

        return Inertia::render('Orders/Show', [
            'order' => $order,
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,preparing,ready,served,cancelled,completed',
            'preparation_time' => 'nullable|integer|min:1',
            'chef_id' => 'nullable|exists:users,id',
        ]);

        $oldStatus = $order->status;
        $order->update($validated);

        // Generate invoice when order is marked as completed
        if ($validated['status'] === 'completed' && $oldStatus !== 'completed') {
            $invoice = InvoiceController::generateInvoiceForOrder($order);

            // return response()->json([
            //     'success' => true,
            //     'message' => 'Order completed and invoice generated!',
            //     'invoice_id' => $invoice->id,
            //     'invoice_url' => route('invoice.show', $invoice->id),
            // ]);
        }

        // return response()->json([
        //     'success' => true,
        //     'message' => 'Order updated successfully!',
        // ]);
    }

    public function destroy(Order $order)
    {
        $order->orderItems()->delete();
        $order->delete();

        return redirect()->route('orders.index')->with('success', 'Order deleted successfully!');
    }
}
