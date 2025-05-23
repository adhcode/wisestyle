import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    onValueChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, onValueChange, ...props }, ref) => {
        return (
            <select
                className={cn(
                    "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                onChange={(e) => {
                    props.onChange?.(e);
                    onValueChange?.(e.target.value);
                }}
                {...props}
            />
        );
    }
);

Select.displayName = "Select";

export { Select }; 