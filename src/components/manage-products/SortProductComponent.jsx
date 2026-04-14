"use client";

import { ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
	{ value: "name-asc", label: "Name (A-Z)" },
	{ value: "name-desc", label: "Name (Z-A)" },
];

export default function SortProductComponent({ value, onChange }) {
	return (
		<label className="flex items-center gap-3 text-sm text-gray-500">
			<span>Sort</span>
			<div className="relative">
				<select
					value={value}
					onChange={(event) => onChange(event.target.value)}
					className="h-11 appearance-none rounded-full border border-gray-200 bg-white px-4 pr-11 text-sm font-medium text-gray-700 shadow-[0_6px_18px_rgba(15,23,42,0.06)] outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
				>
					{SORT_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				<ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
			</div>
		</label>
	);
}
