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
        title: 'foods/create',
        href: '/foods/create',
    },
];

export default function Foods() {
    const {data, setData, post, processing, reset, errors} = useForm({
        name: '',
        description: '',
        price: '',
        image: null as File | null,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/foods', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                router.visit('/foods');
            }
        })
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Food" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <ComponentHeader
                    titleIcon={<TableIcon className="h-6 w-6" />}
                    title="Add Food"
                    btnRoute="/foods"
                    btnIcon={<List className="h-4 w-4" />}
                    btnTitle="See Foods"
                />
                <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                    <div>
                        <label htmlFor="name" className="block mb-1 font-medium flex items-center gap-1">
                            <FileText className="h-4 w-4" /> Name
                        </label>
                        <Input
                            id="name"
                            name="name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="Enter food name"
                        />
                        {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                    </div>
                    <div>
                        <label htmlFor="description" className="block mb-1 font-medium flex items-center gap-1">
                            <FileText className="h-4 w-4" /> Description
                        </label>
                        <Textarea
                            id="description"
                            name="description"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            placeholder="Enter food description"
                        />
                        {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
                    </div>
                    <div>
                        <label htmlFor="price" className="block mb-1 font-medium flex items-center gap-1">
                            <DollarSign className="h-4 w-4" /> Price
                        </label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            value={data.price}
                            onChange={e => setData('price', e.target.value)}
                            placeholder="Enter price"
                        />
                        {errors.price && <span className="text-red-500 text-sm">{errors.price}</span>}
                    </div>
                    <div>
                        <label htmlFor="image" className="block mb-1 font-medium flex items-center gap-1">
                            <Image className="h-4 w-4" /> Image
                        </label>
                        <Input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={e => setData('image', e.target.files?.[0] || null)}
                        />
                        {errors.image && <span className="text-red-500 text-sm">{errors.image}</span>}
                    </div>
                    <Button type="submit" disabled={processing}>
                        Add Food
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
