// components/loading-spinner.tsx
import React from 'react';
import {Loader2} from 'lucide-react';

const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default LoadingSpinner;