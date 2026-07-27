export default function Button({
  children,
  disabled = false,
  loading = false,
  loadingText,
  className = "",
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none
        focus:ring-2 focus:ring-[#C89666]/40 disabled:opacity-50 disabled:cursor-not-allowed ${className}
      `}
      {...props}
    >
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
