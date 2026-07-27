import { ChevronDown } from "lucide-react";

export default function Select({
  label,
  children,
  className = "",
  containerClassName = "",
  ...props
}) {
  const id = props.id || props.name;

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[#E1B382]">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={id}
          {...props}
          className={`w-full appearance-none rounded-lg border border-[#4B7079] bg-[#12343B] text-[#F8F8F6] px-4
            py-3 pr-11 shadow-sm transition-all duration-200 focus:border-[#C89666] focus:ring-2 focus:ring-[#C89666]/30
            focus:outline-none hover:border-[#C89666] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
          {children}
        </select>

        <ChevronDown
          size={18}
          strokeWidth={2.2}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#C89666] transition-colors"
        />
      </div>
    </div>
  );
}
