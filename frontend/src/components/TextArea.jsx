export default function TextArea({
  label,
  className = "",
  containerClassName = "",
  ...props
}) {
  const id = props.id || props.name;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[#D7C3A5]">
          {label}
        </label>
      )}

      <textarea
        id={id}
        {...props}
        className={`min-h-32 w-full resize-y rounded-lg border border-[#4B7079] bg-[#12343B] px-3 py-2.5
          text-[#F8F8F6] placeholder:text-[#7E9AA2] transition focus:border-[#C89666] focus:outline-none
          disabled:opacity-50 ${className}`}
      />
    </div>
  );
}
