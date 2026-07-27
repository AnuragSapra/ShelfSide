export default function Input({
  label,
  className = "",
  containerClassName = "",
  ...props
}) {
  const id = props.id || props.name;

  return (
    <div className={`flex w-full flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[#E1B382]">
          {label}
        </label>
      )}

      <input
        id={id}
        {...props}
        className={`
          w-full rounded-lg
          border border-[#4B7079]
          bg-[#12343B]
          text-[#F8F8F6]
          placeholder:text-[#7E9AA1]
          px-3 py-2.5
          transition
          focus:border-[#C89666]
          focus:ring-1
          focus:ring-[#C89666]
          focus:outline-none
          disabled:bg-[#274850]
          disabled:text-[#8FA6AC]
          ${className}
        `}
      />
    </div>
  );
}
