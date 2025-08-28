import ComponentHeader from '@/components/componentHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { List, TableIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'tables/edit',
        href: '/tables/edit',
    },
];

interface Table {
    id: number;
    name: string;
}

export default function Tables({ table }: { table: Table }) {
    const { data, setData, put, processing, reset, errors } = useForm({
        name: table.name,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/tables/${table.id}`, {
            onSuccess: () => {
                reset();
                router.visit('/tables');
            },
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tables" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <ComponentHeader
                    titleIcon={<TableIcon className="h-6 w-6" />}
                    title="Edit Table"
                    btnRoute="/tables"
                    btnIcon={<List className="h-4 w-4" />}
                    btnTitle="See Table"
                />
                <form method="POST" action="/tables" onSubmit={handleSubmit} className="max-w-md space-y-4">
                    <div>
                        <label htmlFor="name" className="mb-1 block font-medium">
                            Table Name
                        </label>
                        <Input
                            id="name"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter table name"
                        />
                        {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                    </div>
                    <Button disabled={processing} className="cursor-pointer">
                        Update Table
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
