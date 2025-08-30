// import ComponentHeader from '@/components/componentHeader';
import ComponentHeader from '@/components/componentHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { DollarSign, FileText, Image, List, TableIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'foods/edit',
        href: '/foods/edit',
    },
];

interface Food {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string | null;
}

export default function Foods({ food }: { food: Food }) {
    const { data, setData, processing, errors } = useForm({
        name: food.name,
        description: food.description,
        price: food.price,
        image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('name', data.name || food.name);
        formData.append('description', data.description || '');
        formData.append('price', data.price ? String(data.price) : String(food.price));
        if (data.image) {
            formData.append('image', data.image);
        }
        router.post(`/foods/${food.id}`, formData, {
            onSuccess: () => {
                router.visit('/foods', {
                    method: 'get',
                    preserveState: false,
                    preserveScroll: false,
                });
            },
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Food" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <ComponentHeader
                    titleIcon={<TableIcon className="h-6 w-6" />}
                    title="Edit Food"
                    btnRoute="/foods"
                    btnIcon={<List className="h-4 w-4" />}
                    btnTitle="See Foods"
                />
                <form onSubmit={handleSubmit} className="max-w-md space-y-4">
                    <div>
                        <label htmlFor="name" className="mb-1 block flex items-center gap-1 font-medium">
                            <FileText className="h-4 w-4" /> Name
                        </label>
                        <Input
                            id="name"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter food name"
                        />
                        {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                    </div>
                    <div>
                        <label htmlFor="description" className="mb-1 block flex items-center gap-1 font-medium">
                            <FileText className="h-4 w-4" /> Description
                        </label>
                        <Textarea
                            id="description"
                            name="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Enter food description"
                        />
                        {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
                    </div>
                    <div>
                        <label htmlFor="price" className="mb-1 block flex items-center gap-1 font-medium">
                            <DollarSign className="h-4 w-4" /> Price
                        </label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            value={data.price}
                            onChange={(e) => setData('price', parseFloat(e.target.value))}
                            placeholder="Enter price"
                        />
                        {errors.price && <span className="text-sm text-red-500">{errors.price}</span>}
                    </div>
                    <div>
                        <label htmlFor="image" className="mb-1 block flex items-center gap-1 font-medium">
                            <Image className="h-4 w-4" /> Image
                        </label>
                        <Input id="image" name="image" type="file" accept="image/*" onChange={(e) => setData('image', e.target.files?.[0] || null)} />
                        {errors.image && <span className="text-sm text-red-500">{errors.image}</span>}
                    </div>
                    <Button type="submit" disabled={processing} className="cursor-pointer">
                        Update Food
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
