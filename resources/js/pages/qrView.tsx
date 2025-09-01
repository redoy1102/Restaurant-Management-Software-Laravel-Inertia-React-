import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Toaster, toast } from 'sonner';

interface Food {
    id: number;
    name: string;
    description: string;
    image: string;
    price: number;
}

interface Table {
    id: number;
    name: string;
}

interface CartItem {
    food: Food;
    quantity: number;
}

interface Order {
    id: number;
    table_id: number;
    customer_phone: string;
    status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'completed';
    created_at: string;
    updated_at: string;
}

interface WelcomeProps {
    foods: Food[];
    tables: Table[];
    orders: Order[];
}

export default function Welcome() {
    const { foods, tables, orders } = usePage<SharedData & WelcomeProps>().props;
    console.log('Tables: ', tables);
    console.log('Orders:', orders);
    const [cart, setCart] = useState<CartItem[]>([]);

    orders.map((order) => console.log(typeof order.table_id));

    const addToCart = (food: Food) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.food.id === food.id);
            if (existing) {
                return prev.map((item) => (item.food.id === food.id ? { ...item, quantity: item.quantity + 1 } : item));
            }
            return [...prev, { food, quantity: 1 }];
        });
    };

    const removeFromCart = (foodId: number) => {
        setCart((prev) => prev.filter((item) => item.food.id !== foodId));
    };

    const getTotal = () => {
        return cart.reduce((total, item) => total + item.food.price * item.quantity, 0);
    };

    const { data, setData, processing, reset, errors } = useForm({
        table_id: '',
        customer_phone: '',
        items: [] as Array<{ food_id: number; quantity: number }>,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.table_id) {
            toast.error('Please select a table');
            return;
        }

        if (cart.length === 0) {
            toast.error('Please add items to cart');
            return;
        }

        if (orders.some((order) => order.table_id === parseInt(data.table_id) && order.status !== 'completed' && order.status !== 'cancelled')) {
            toast.info('Table is already occupied! Please select a different table.');
            console.log(orders.some((order) => order.table_id === parseInt(data.table_id)));
            return;
        }

        // Create the order data with current cart
        const formData = {
            table_id: data.table_id,
            customer_phone: data.customer_phone,
            items: cart.map((item) => ({
                food_id: item.food.id,
                quantity: item.quantity,
            })),
        };

        // Submit using router.post for better control
        router.post('/place-order', formData, {
            onSuccess: () => {
                toast.success('Order placed successfully!');
                setCart([]);
                reset();
                // Reload orders to update table availability
                router.reload({ only: ['orders'] });
            },
            onError: (errors: Record<string, string>) => {
                console.log('Order submission errors:', errors);
                const errorMessage = Object.values(errors).join(', ') || 'Failed to place order';
                toast.error(`Error: ${errorMessage}`);
            },
            onFinish: () => {
                console.log('QR View: Order submission completed');
            },
        });
    };

    return (
        <>
            <Toaster richColors position="top-right" />
            <Head title="Food Ordering - Jolshiri Restaurant" />

            <div className="min-h-screen bg-gray-50 p-4">
                <div className="mx-auto max-w-6xl">
                    <h1 className="mb-8 text-center text-3xl font-bold">Jolshiri Restaurant</h1>

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Menu Section */}
                        <div>
                            <h2 className="mb-4 text-xl font-semibold">Menu</h2>
                            <div className="space-y-4">
                                {foods.map((food) => (
                                    <Card key={food.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarImage src={`/storage/${food.image}`} alt="Food" className="h-12 w-12 rounded-md" />
                                                    <AvatarFallback>{food.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-medium">{food.name}</h3>
                                                    <p className="text-sm text-gray-600">{food.description}</p>
                                                    <p className="text-lg font-bold">${food.price}</p>
                                                </div>
                                            </div>
                                            <Button onClick={() => addToCart(food)} size="sm" className="cursor-pointer">
                                                Add
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Order Section */}
                        <div>
                            <h2 className="mb-4 text-xl font-semibold">Your Order</h2>

                            <form onSubmit={handleSubmit}>
                                <Card className="mb-4 p-4">
                                    <div className="space-y-4">
                                        {/* Table Selection */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Select Table</label>
                                            <Select value={data.table_id} onValueChange={(value) => setData('table_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose a table" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tables.map((table) => {
                                                        const isOccupied = orders.some(
                                                            (order) =>
                                                                order.table_id === table.id &&
                                                                order.status !== 'completed' &&
                                                                order.status !== 'cancelled',
                                                        );
                                                        return (
                                                            <SelectItem key={table.id} value={table.id.toString()} disabled={isOccupied}>
                                                                {table.name}
                                                                {isOccupied && ' (Booked)'}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            {errors.table_id && <span className="text-sm text-red-500">{errors.table_id}</span>}
                                        </div>
                                        <div>
                                            <label htmlFor="customer_phone" className="mb-1 block font-medium">
                                                Customer Phone
                                            </label>
                                            <Input
                                                id="customer_phone"
                                                name="customer_phone"
                                                value={data.customer_phone}
                                                onChange={(e) => setData('customer_phone', e.target.value)}
                                                placeholder="Enter your phone number"
                                            />
                                            {errors.customer_phone && <span className="text-sm text-red-500">{errors.customer_phone}</span>}
                                        </div>
                                    </div>
                                </Card>

                                {/* Cart Items */}
                                <Card className="mb-4 p-4">
                                    <h3 className="mb-3 font-medium">Cart Items</h3>
                                    {cart.length === 0 ? (
                                        <p className="text-gray-500">No items in cart</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {cart.map((item) => (
                                                <div key={item.food.id} className="flex items-center justify-between border-b py-2">
                                                    <div>
                                                        <span className="font-medium">{item.food.name}</span>
                                                        <span className="ml-2 text-sm text-gray-600">
                                                            ${item.food.price} x {item.quantity}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        onClick={() => removeFromCart(item.food.id)}
                                                        size="sm"
                                                        className="cursor-pointer border-1 border-red-500 bg-white text-red-500 hover:bg-red-500 hover:text-white"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}
                                            <div className="border-t pt-2">
                                                <div className="flex items-center justify-between font-bold">
                                                    <span>Total: ${getTotal().toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Card>

                                {/* Place Order Button */}
                                <Button
                                    type="submit"
                                    disabled={cart.length === 0 || !data.table_id || processing}
                                    className="w-full cursor-pointer"
                                    size="lg"
                                >
                                    {processing ? 'Placing Order...' : `Place Order - $${getTotal().toFixed(2)}`}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
