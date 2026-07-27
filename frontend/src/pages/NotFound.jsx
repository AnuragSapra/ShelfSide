import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#12343B] text-center px-6">
      <h1 className="text-8xl font-bold text-[#E1B382]">404</h1>

      <p className="mt-4 text-2xl text-[#F8F8F6]">Page Not Found</p>

      <p className="mt-2 text-[#B7C3C7] max-w-md">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <Link
        to="/"
        className="mt-8 rounded-lg bg-[#C89666] px-6 py-3 font-semibold text-[#12343B] transition hover:bg-[#B78355]"
      >
        Return to Library
      </Link>
    </div>
  );
}
