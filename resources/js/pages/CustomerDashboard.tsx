import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Food {
    id: number;
    name: string;
    price: number;
}

interface Table {
    id: number;
    name: string;
}

interface OrderItem {
    id: number;
    food_id: number;
    quantity: number;
    price: number;
    food: Food;
}

interface Order {
    id: number;
    table_id: number;
    status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'completed';
    preparation_time: number | null;
    total_amount: number;
    created_at: string;
    table: Table;
    order_items: OrderItem[];
    invoice?: {
        id: number;
        invoice_number: string;
    };
}

interface CustomerSession {
    id: number;
    session_token: string;
    table_id: number;
    customer_name: string | null;
    customer_phone: string | null;
    is_active: boolean;
    table: Table;
}

interface CustomerDashboardProps {
    session: CustomerSession;
    orders: Order[];
}

export default function CustomerDashboard() {
    const { session, orders } = usePage<SharedData & CustomerDashboardProps>().props;
    const [currentOrders, setCurrentOrders] = useState<Order[]>(orders);
    const [timers, setTimers] = useState<Record<number, number>>({});

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'preparing':
                return 'bg-blue-100 text-blue-800';
            case 'ready':
                return 'bg-green-100 text-green-800';
            case 'served':
                return 'bg-gray-100 text-gray-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Initialize timers for orders with preparation time
    useEffect(() => {
        const newTimers: Record<number, number> = {};

        currentOrders.forEach((order) => {
            if (order.preparation_time && order.status === 'preparing') {
                newTimers[order.id] = order.preparation_time * 60; // Convert minutes to seconds
            }
        });

        setTimers(newTimers);
    }, [currentOrders]);

    // Countdown timer effect
    useEffect(() => {
        const interval = setInterval(() => {
            setTimers((prev) => {
                const updated = { ...prev };
                Object.keys(updated).forEach((orderId) => {
                    if (updated[parseInt(orderId)] > 0) {
                        updated[parseInt(orderId)] -= 1;
                    }
                });
                return updated;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Refresh orders periodically
    useEffect(() => {
        const refreshInterval = setInterval(() => {
            fetch(`/customer-dashboard/${session.session_token}/refresh`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.orders) {
                        setCurrentOrders(data.orders);
                    }
                })
                .catch((error) => console.error('Error refreshing orders:', error));
        }, 5000); // Refresh every 5 seconds

        return () => clearInterval(refreshInterval);
    }, [session.session_token]);

    const handleBackToMenu = () => {
        router.get('/');
    };

    return (
        <>
            <Head title="Customer Dashboard - Jolshiri Restaurant" />

            <div className="min-h-screen bg-gray-50 p-4">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Your Order Status</h1>
                            <p className="text-gray-600">Table: {session.table.name}</p>
                            {session.customer_name && <p className="text-gray-600">Welcome, {session.customer_name}!</p>}
                        </div>
                        <Button onClick={handleBackToMenu} variant="outline">
                            Back to Menu
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {currentOrders.length === 0 ? (
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <p className="text-gray-500">No orders found for your table</p>
                                </CardContent>
                            </Card>
                        ) : (
                            currentOrders.map((order) => (
                                <Card key={order.id} className="w-full">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                                            <Badge className={getStatusColor(order.status)}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">Placed: {new Date(order.created_at).toLocaleString()}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {/* Order Items */}
                                            <div>
                                                <h4 className="mb-2 font-medium">Items:</h4>
                                                <div className="space-y-2">
                                                    {order.order_items.map((item) => (
                                                        <div key={item.id} className="flex items-center justify-between text-sm">
                                                            <span>{item.food.name}</span>
                                                            <span>Qty: {item.quantity}</span>
                                                            <span>${item.price}</span>
                                                        </div>
                                                    ))}
                                                    <div className="border-t pt-2 font-medium">Total: ${order.total_amount}</div>
                                                </div>
                                            </div>

                                            {/* Order Status & Timer */}
                                            <div className="space-y-4">
                                                {/* Preparation Timer */}
                                                {order.preparation_time && order.status === 'preparing' && (
                                                    <div className="text-center">
                                                        <h4 className="mb-2 font-medium">Preparation Time</h4>
                                                        <div className="text-2xl font-bold text-blue-600">
                                                            {timers[order.id] !== undefined
                                                                ? formatTime(timers[order.id])
                                                                : formatTime(order.preparation_time * 60)}
                                                        </div>
                                                        <p className="text-sm text-gray-600">Estimated time remaining</p>
                                                    </div>
                                                )}

                                                {order.preparation_time && order.status !== 'preparing' && (
                                                    <div className="text-center">
                                                        <h4 className="mb-2 font-medium">Preparation Time</h4>
                                                        <div className="text-lg text-gray-600">{order.preparation_time} minutes</div>
                                                    </div>
                                                )}

                                                {!order.preparation_time && (
                                                    <div className="text-center">
                                                        <h4 className="mb-2 font-medium">Preparation Time</h4>
                                                        <p className="text-sm text-gray-600">Chef will set preparation time soon</p>
                                                    </div>
                                                )}

                                                {/* Status Information */}
                                                <div className="text-center">
                                                    <h4 className="mb-2 font-medium">Current Status</h4>
                                                    <Badge className={`${getStatusColor(order.status)} px-4 py-2 text-lg`}>
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </Badge>

                                                    {order.status === 'ready' && (
                                                        <p className="mt-2 text-sm text-green-600">Your order is ready for pickup!</p>
                                                    )}

                                                    {order.status === 'completed' && order.invoice && (
                                                        <div className="mt-4 space-y-2">
                                                            <p className="text-sm font-medium text-green-600 ">Order completed!</p>
                                                            <Button onClick={() => router.get(`/invoice/${order.invoice?.id}`)} className="w-full">
                                                                View Invoice
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>This page will automatically refresh to show the latest updates</p>
                        <p>Order updates are refreshed every 5 seconds</p>
                    </div>
                </div>
            </div>
        </>
    );
}
