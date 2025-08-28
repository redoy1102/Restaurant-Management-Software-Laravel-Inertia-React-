import ComponentHeader from '@/components/componentHeader';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Edit, Plus, TableIcon, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '/tables',
        href: '/tables',
    },
];

interface Table {
    id: number;
    name: string;
}

interface TablesProps {
    tables: Table[];
}

export default function Tables({ tables }: TablesProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tables" />
            <div className="flex flex-col gap-4 p-4">
                <ComponentHeader
                    titleIcon={<TableIcon className="h-6 w-6" />}
                    title="Tables"
                    btnRoute="/tables/create"
                    btnIcon={<Plus className="h-4 w-4" />}
                    btnTitle="Add Table"
                />
                <div className="overflow-x-auto rounded-xl border">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {tables.map((table) => (
                                <tr key={table.id}>
                                    <td className="px-6 py-4 font-semibold">{table.id}</td>
                                    <td className="px-6 py-4 font-semibold">{table.name}</td>
                                    <td className="flex gap-2 px-6 py-4">
                                        <Button
                                            onClick={() => router.visit(`/tables/${table.id}/edit`)}
                                            size="sm"
                                            variant="outline"
                                            className="flex items-center gap-1 cursor-pointer"
                                        >
                                            <Edit className="h-4 w-4" /> Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex items-center gap-1 border-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this table?')) {
                                                    router.delete(`/tables/${table.id}`);
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" /> Delete
                                        </Button>
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
