import ComponentHeader from '@/components/componentHeader';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { DollarSign, Edit, Image as ImageIcon, Plus, Trash2, Utensils } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '/foods',
        href: '/foods',
    },
];

interface Food {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string | null;
}

interface FoodsIndexProps {
    foods: Food[];
}

export default function FoodsIndex({ foods }: FoodsIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Foods" />
            <div className="flex flex-col gap-4 p-4">
                <ComponentHeader
                    titleIcon={<Utensils className="h-6 w-6" />}
                    title="Foods"
                    btnRoute="/foods/create"
                    btnIcon={<Plus className="h-4 w-4" />}
                    btnTitle="Add Food"
                />
                <div className="overflow-x-auto rounded-xl border">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {foods.map((food) => (
                                <tr key={food.id}>
                                    <td className="px-6 py-4">
                                        {food.image ? (
                                            <img src={`/storage/${food.image}`} alt={food.name} className="h-16 w-16 rounded border" />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-gray-400" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-semibold">{food.name}</td>
                                    <td className="px-6 py-4">{food.description}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-4 w-4 text-green-500" />
                                            {food.price}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => router.visit(`/foods/${food.id}/edit`)}
                                                size="sm"
                                                variant="outline"
                                                className="flex cursor-pointer items-center gap-1"
                                            >
                                                <Edit className="h-4 w-4" /> Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex cursor-pointer items-center gap-1 border-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this food item?')) {
                                                        router.delete(`/foods/${food.id}`, {
                                                            onSuccess: () => {
                                                                router.reload({
                                                                    only: ['foods'],
                                                                });
                                                            },
                                                        });
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" /> Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
