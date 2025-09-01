import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

// Extend Window interface to include Echo
declare global {
    interface Window {
        Echo?: {
            channel: (channelName: string) => EchoChannel;
            leaveChannel: (channelName: string) => void;
            connector?: {
                pusher?: {
                    connection: {
                        state: string;
                        bind: (event: string, callback: (data: unknown) => void) => void;
                    };
                };
            };
        };
    }
}

interface EchoChannel {
    listen: (event: string, callback: (data: unknown) => void) => void;
    stopListening: (event: string) => void;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '/dashboard',
        href: '/dashboard',
    },
];

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
}

interface DashboardProps {
    orders: Order[];
}

export default function Dashboard() {
    const [isEchoConnected, setIsEchoConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string>('');

    // Listen for OrderPlaced event and reload orders for real-time updates
    useEffect(() => {
        console.log('Dashboard: Setting up Echo listener');
        console.log('Echo available:', !!window.Echo);
        console.log('VITE_PUSHER_APP_KEY:', import.meta.env.VITE_PUSHER_APP_KEY);

        let retryTimeout: NodeJS.Timeout;
        let pollInterval: NodeJS.Timeout;
        let channel: EchoChannel | null = null;

        const updateTimestamp = () => {
            setLastUpdate(new Date().toLocaleTimeString());
        };

        const startPolling = () => {
            if (pollInterval) return; // Don't start multiple intervals

            console.log('Dashboard: Starting polling backup mechanism (every 2 seconds)');
            pollInterval = setInterval(() => {
                console.log('Dashboard: Polling backup update...');
                updateTimestamp();
                router.reload({ only: ['orders'] });
            }, 2000); // Poll every 2 seconds as backup
        };

        const setupEchoListener = () => {
            console.log('Dashboard: Attempting to setup Echo listener...');
            if (window.Echo) {
                console.log('Dashboard: Echo is available, checking connector...');
                try {
                    // Check if Echo is connected
                    if (window.Echo.connector?.pusher) {
                        const pusher = window.Echo.connector.pusher;
                        console.log('Dashboard: Pusher connector found, current state:', pusher.connection.state);

                        // Handle connection events
                        pusher.connection.bind('connected', () => {
                            console.log('Dashboard: Pusher connected successfully!');
                            setIsEchoConnected(true);

                            // Keep polling as a backup even when Echo is working
                            if (!pollInterval) {
                                console.log('Dashboard: Starting polling as backup to Echo');
                                startPolling();
                            }

                            // Set up the channel listener after connection is established
                            if (window.Echo) {
                                channel = window.Echo.channel('orders');
                                console.log('Dashboard: Subscribed to orders channel successfully');

                                channel.listen('OrderPlaced', (e: unknown) => {
                                    console.log('Dashboard: *** OrderPlaced event received! ***', e);
                                    updateTimestamp();
                                    // Add a small delay to ensure the order is saved in the database
                                    setTimeout(() => {
                                        console.log('Dashboard: Reloading orders after Echo event');
                                        router.reload({ only: ['orders'] });
                                    }, 100);
                                });
                            }
                        });

                        pusher.connection.bind('disconnected', () => {
                            console.log('Dashboard: Pusher disconnected, ensuring polling backup is active');
                            setIsEchoConnected(false);
                            // Ensure polling is running when disconnected
                            if (!pollInterval) {
                                startPolling();
                            }
                        });

                        pusher.connection.bind('error', (error: unknown) => {
                            console.error('Dashboard: Pusher connection error:', error);
                            setIsEchoConnected(false);
                            // Ensure polling is running on error
                            if (!pollInterval) {
                                startPolling();
                            }
                        });

                        // If already connected, set up the listener immediately
                        if (pusher.connection.state === 'connected') {
                            console.log('Dashboard: Pusher is already connected, setting up listener now');
                            setIsEchoConnected(true);
                            channel = window.Echo.channel('orders');
                            console.log('Dashboard: Subscribed to orders channel (already connected)');

                            channel.listen('OrderPlaced', (e: unknown) => {
                                console.log('Dashboard: *** OrderPlaced event received (already connected)! ***', e);
                                updateTimestamp();
                                setTimeout(() => {
                                    console.log('Dashboard: Reloading orders after Echo event (already connected)');
                                    router.reload({ only: ['orders'] });
                                }, 100);
                            });
                        } else {
                            console.log('Dashboard: Pusher not connected yet, state:', pusher.connection.state);
                        }
                    } else {
                        console.log('Dashboard: No pusher connector found');
                    }
                } catch (error) {
                    console.error('Dashboard: Error setting up Echo listener:', error);
                    // Retry after 2 seconds
                    retryTimeout = setTimeout(setupEchoListener, 2000);
                }
            } else {
                console.log('Dashboard: Echo not available, retrying in 1 second...');
                // Retry if Echo is not available
                retryTimeout = setTimeout(setupEchoListener, 1000);
            }
        };

        // Always start polling as a reliable fallback first
        startPolling();
        // Then try to setup Echo for potentially faster updates
        setupEchoListener();

        return () => {
            if (retryTimeout) {
                clearTimeout(retryTimeout);
            }
            if (pollInterval) {
                clearInterval(pollInterval);
            }
            if (channel) {
                console.log('Dashboard: Leaving orders channel');
                try {
                    channel.stopListening('OrderPlaced');
                } catch (error) {
                    console.error('Dashboard: Error stopping listener:', error);
                }
            }
            if (window.Echo) {
                try {
                    window.Echo.leaveChannel('orders');
                } catch (error) {
                    console.error('Dashboard: Error leaving channel:', error);
                }
            }
        };
    }, []); // Remove isEchoConnected dependency to prevent re-runs

    const { orders } = usePage<SharedData & DashboardProps>().props;
    const [editingOrder, setEditingOrder] = useState<number | null>(null);
    const [preparationTime, setPreparationTime] = useState<string>('');
    const [processing, setProcessing] = useState<boolean>(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'preparing':
                return 'bg-blue-100 text-blue-800';
            case 'ready':
                return 'bg-purple-100 text-purple-800';
            case 'served':
                return 'bg-gray-100 text-gray-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-gree-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleStatusUpdate = (orderId: number, newStatus: string) => {
        setProcessing(true);
        const updateData: { status: string; preparation_time?: number } = { status: newStatus };

        if (editingOrder === orderId && preparationTime) {
            updateData.preparation_time = parseInt(preparationTime);
        }

        router.patch(`/orders/${orderId}`, updateData, {
            onSuccess: () => {
                setEditingOrder(null);
                setPreparationTime('');
                setProcessing(false);
                router.reload({ only: ['orders'] });
            },
            onError: (errors) => {
                console.error('Error updating order:', errors);
                setProcessing(false);
                alert('Failed to update order');
            },
        });
    };

    const startEditingPreparationTime = (orderId: number, currentTime: number | null) => {
        setEditingOrder(orderId);
        setPreparationTime(currentTime ? currentTime.toString() : '');
    };

    const cancelEditing = () => {
        setEditingOrder(null);
        setPreparationTime('');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chef Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Chef Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">Total Orders: {orders.length}</div>
                    </div>
                </div>

                <div className="grid gap-10">
                    {orders.length === 0 ? (
                        <Card>
                            <CardContent className="p-6 text-center">
                                <p className="text-gray-500">No orders found</p>
                            </CardContent>
                        </Card>
                    ) : (
                        orders.map((order) => (
                            <Card key={order.id} className="w-full">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">
                                            Order #{order.id} - {order.table.name}
                                        </CardTitle>
                                        <Badge className={getStatusColor(order.status)}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">Placed: {new Date(order.created_at).toLocaleString()}</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-8 md:grid-cols-2">
                                        {/* Order Items */}
                                        <div className="rounded-lg border-1 border-slate-300 p-4">
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

                                        {/* Order Management */}
                                        <div className="space-y-4 rounded-lg border-1 border-slate-700 p-4">
                                            {/* Preparation Time */}
                                            <div>
                                                <label className="mb-1 block text-sm font-medium">Preparation Time (minutes)</label>
                                                {editingOrder === order.id ? (
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="number"
                                                            value={preparationTime}
                                                            onChange={(e) => setPreparationTime(e.target.value)}
                                                            placeholder="Enter minutes"
                                                            min="1"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleStatusUpdate(order.id, order.status)}
                                                            disabled={processing}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={cancelEditing}>
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm">
                                                            {order.preparation_time ? `${order.preparation_time} minutes` : 'Not set'}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => startEditingPreparationTime(order.id, order.preparation_time)}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Status Management */}
                                            <div>
                                                <label className="mb-1 block text-sm font-medium">Status</label>
                                                <Select value={order.status} onValueChange={(value) => handleStatusUpdate(order.id, value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="preparing">Preparing</SelectItem>
                                                        <SelectItem value="ready">Ready</SelectItem>
                                                        <SelectItem value="served">Served</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
