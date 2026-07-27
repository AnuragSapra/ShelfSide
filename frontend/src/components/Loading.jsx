import { BookOpen } from "lucide-react";
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#12343B] text-[#F8F8F6]">
      <div className="rounded-2xl bg-[#2D545E] p-8 shadow-xl flex flex-col items-center">
        <BookOpen className="h-14 w-24 text-[#E1B382]" />

        <h1 className="mt-5 text-3xl font-bold text-[#E1B382]">ShelfSide</h1>

        <p className="mt-2 text-sm text-[#B7C3C7]">Loading library...</p>

        <div className="mt-6 h-10 w-10 animate-spin rounded-full border-4 border-[#C89666] border-t-transparent"></div>
      </div>
    </div>
  );
}
