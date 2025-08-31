<?php

namespace App\Http\Controllers;

use App\Models\CustomerSession;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerDashboardController extends Controller
{
    public function show(Request $request, $sessionToken)
    {
        // Find the customer session
        $session = CustomerSession::where('session_token', $sessionToken)
            ->where('is_active', true)
            ->with('table')
            ->first();

        if (!$session) {
            return redirect()->route('home')->with('error', 'Invalid or expired session');
        }

        // Get orders for this table from the time the session started
        $orders = Order::where('table_id', $session->table_id)
            ->where('created_at', '>=', $session->created_at)
            ->with(['orderItems.food', 'table', 'invoice'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('CustomerDashboard', [
            'session' => $session,
            'orders' => $orders,
        ]);
    }

    public function refresh(Request $request, $sessionToken)
    {
        $session = CustomerSession::where('session_token', $sessionToken)
            ->where('is_active', true)
            ->first();

        if (!$session) {
            return response()->json(['error' => 'Invalid session'], 404);
        }

        $orders = Order::where('table_id', $session->table_id)
            ->where('created_at', '>=', $session->created_at)
            ->with(['orderItems.food', 'table', 'invoice'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['orders' => $orders]);
    }
}
