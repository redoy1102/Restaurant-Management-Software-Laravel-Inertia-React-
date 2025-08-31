import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronLeftIcon, FileDown, PrinterCheckIcon } from 'lucide-react';

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
    status: string;
    preparation_time: number | null;
    total_amount: number;
    created_at: string;
    customer_name: string | null;
    customer_phone: string | null;
    table: Table;
    order_items: OrderItem[];
}

interface Invoice {
    id: number;
    order_id: number;
    table_id: number;
    invoice_number: string;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    preparation_time: number;
    status: 'paid' | 'unpaid';
    issued_at: string;
    order: Order;
    table: Table;
}

interface InvoiceProps {
    invoice: Invoice;
}

export default function Invoice() {
    const { invoice } = usePage<SharedData & InvoiceProps>().props;

    const handleDownloadPdf = () => {
        window.open(`/invoice/${invoice.id}/pdf`, '_blank');
    };

    const handlePrint = () => {
        window.print();
    };

    const handleBackToDashboard = () => {
        router.get('/');
    };

    return (
        <>
            <Head title={`Invoice ${invoice.invoice_number} - Jolshiri Restaurant`} />

            <div className="min-h-screen bg-gray-50 p-4">
                <div className="mx-auto max-w-4xl">
                    {/* Header Actions */}
                    <div className="mb-6 flex items-center justify-between print:hidden">
                        <h1 className="text-2xl font-bold">Invoice Details</h1>
                        <div className="flex gap-2">
                            <Button onClick={handleBackToDashboard} variant="secondary" className="cursor-pointer">
                                <ChevronLeftIcon />
                                Back to Order
                            </Button>
                            <Button onClick={handlePrint} variant="outline" className="cursor-pointer">
                                <PrinterCheckIcon />
                                Print Invoice
                            </Button>
                            <Button onClick={handleDownloadPdf} className="cursor-pointer">
                                <FileDown />
                                Download PDF
                            </Button>
                        </div>
                    </div>

                    {/* Invoice Card */}
                    <Card className="w-full">
                        <CardHeader className="border-b text-center">
                            <CardTitle className="text-3xl font-bold text-primary">Jolshiri Restaurant</CardTitle>
                            <p className="text-gray-600 mb-6">
                                123 Restaurant Street, Food City, FC 12345
                                <br />
                                Phone: (555) 123-4567 | Email: info@jolshiri.com
                            </p>
                        </CardHeader>

                        <CardContent className="p-6">
                            {/* Invoice Header */}
                            <div className="mb-8 grid gap-4 md:grid-cols-2">
                                <div>
                                    <h2 className="mb-4 text-xl font-bold">Invoice</h2>
                                    <div className="space-y-2">
                                        <p>
                                            <strong>Invoice Number:</strong> {invoice.invoice_number}
                                        </p>
                                        <p>
                                            <strong>Order Number:</strong> #{invoice.order.id}
                                        </p>
                                        <p>
                                            <strong>Issue Date:</strong> {new Date(invoice.issued_at).toLocaleDateString()}
                                        </p>
                                        <p>
                                            <strong>Table:</strong> {invoice.order.table.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="space-y-2">
                                        <p>
                                            <strong>Status:</strong>
                                            <Badge
                                                className={`ml-2 ${
                                                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                            </Badge>
                                        </p>
                                        {invoice.order.customer_name && (
                                            <p>
                                                <strong>Customer:</strong> {invoice.order.customer_name}
                                            </p>
                                        )}
                                        {invoice.order.customer_phone && (
                                            <p>
                                                <strong>Phone:</strong> {invoice.order.customer_phone}
                                            </p>
                                        )}
                                        {invoice.preparation_time > 0 && (
                                            <p>
                                                <strong>Preparation Time:</strong> {invoice.preparation_time} minutes
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Order Items Table */}
                            <div className="mb-8">
                                <h3 className="mb-4 text-lg font-semibold">Order Items</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                                                <th className="border border-gray-300 px-4 py-2 text-center">Quantity</th>
                                                <th className="border border-gray-300 px-4 py-2 text-right">Unit Price</th>
                                                <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoice.order.order_items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="border border-gray-300 px-4 py-2">{item.food.name}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-right">
                                                        ${(item.price / item.quantity).toFixed(2)}
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-2 text-right">{Number(item.price).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Invoice Summary */}
                            <div className="flex justify-end">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>${Number(invoice.subtotal).toFixed(2)}</span>
                                    </div>
                                    {invoice.discount_amount > 0 && (
                                        <div className="flex justify-between">
                                            <span>Discount:</span>
                                            <span>-${Number(invoice.discount_amount).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Tax (10%):</span>
                                        <span>${Number(invoice.tax_amount).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-2">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total Amount:</span>
                                            <span>${Number(invoice.total_amount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 border-t pt-4 text-center text-sm text-gray-600">
                                <p>Thank you for dining with us!</p>
                                <p>Please come again.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </>
    );
}
