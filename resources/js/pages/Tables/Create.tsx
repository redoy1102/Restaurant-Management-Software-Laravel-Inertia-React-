import ComponentHeader from '@/components/componentHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { List, TableIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'tables/create',
        href: '/tables/create',
    },
];

export default function Tables() {
    const {data, setData, post, processing, reset, errors} = useForm({
        name: 'Table-',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/tables', {
            onSuccess: () => {
                reset();
                router.visit('/tables');
            }
        })
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tables" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <ComponentHeader
                    titleIcon={<TableIcon className="h-6 w-6" />}
                    title="Add Tables"
                    btnRoute="/tables"
                    btnIcon={<List className="h-4 w-4" />}
                    btnTitle="See Table"
                />
                <form method="POST" action="/tables" onSubmit={handleSubmit} className="space-y-4 max-w-md">
                    <div>
                        <label htmlFor="name" className="block mb-1 font-medium">Table Name</label>
                        <Input
                            id="name"
                            name="name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="Enter table name"
                        />
                        {errors.name && (
                            <span className="text-red-500 text-sm">{errors.name}</span>
                        )}
                    </div>
                    <Button disabled={processing} className='cursor-pointer'>
                        Add Table
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
