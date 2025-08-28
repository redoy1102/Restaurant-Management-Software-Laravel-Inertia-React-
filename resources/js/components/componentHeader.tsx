import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import React from 'react';

type ComponentHeaderProps = {
    titleIcon: React.ReactNode;
    title: string;
    btnRoute: string;
    btnIcon: React.ReactNode;
    btnTitle: string;
};

const ComponentHeader = ({ titleIcon, title, btnRoute, btnIcon, btnTitle }: ComponentHeaderProps) => {
    return (
        <div className="mb-4 flex items-center justify-between">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
                {titleIcon}
                {title}
            </h1>
            <Button onClick={() => router.visit(`${btnRoute}`)} variant="default" className="flex items-center gap-2">
                {btnIcon}
                {btnTitle}
            </Button>
        </div>
    );
};

export default ComponentHeader;
