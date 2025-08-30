import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

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
    const [cart, setCart] = useState<CartItem[]>([]);

    orders.map(order => console.log(typeof order.table_id));

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
        items: [] as Array<{ food_id: number; quantity: number }>,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.table_id) {
            alert('Please select a table');
            return;
        }

        if (cart.length === 0) {
            alert('Please add items to cart');
            return;
        }

        if (orders.some(order => order.table_id === parseInt(data.table_id))) {
            alert('Table is already occupied! Please select a different table.');
            return;
        }

        // Create the order data with current cart
        const formData = {
            table_id: data.table_id,
            items: cart.map((item) => ({
                food_id: item.food.id,
                quantity: item.quantity,
            })),
        };

        // Submit using router.post for better control
        router.post('/place-order', formData, {
            onSuccess: () => {
                alert('Order placed successfully!');
                setCart([]);
                reset();
            },
            onError: (errors: Record<string, string>) => {
                console.log('Order submission errors:', errors);
                const errorMessage = Object.values(errors).join(', ') || 'Failed to place order';
                alert(`Error: ${errorMessage}`);
            },
        });
    };

    return (
        <>
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
                                            <div>
                                                <h3 className="font-medium">{food.name}</h3>
                                                <p className="text-sm text-gray-600">{food.description}</p>
                                                <p className="text-lg font-bold">${food.price}</p>
                                            </div>
                                            <Button onClick={() => addToCart(food)} size="sm">
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
                                                    {tables.map((table) => (
                                                        <SelectItem key={table.id} value={table.id.toString()}>
                                                            {table.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.table_id && <span className="text-sm text-red-500">{errors.table_id}</span>}
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
                                                    <Button onClick={() => removeFromCart(item.food.id)} size="sm" className="cursor-pointer">
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
                                <Button type="submit" disabled={cart.length === 0 || !data.table_id || processing} className="w-full" size="lg">
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
