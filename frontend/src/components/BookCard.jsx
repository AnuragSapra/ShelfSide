import { Link } from "react-router-dom";

export default function BookCard({ book }) {
  return (
    <Link
      to={`/books/${book.isbn}`}
      className=" group flex flex-col overflow-hidden rounded-xl border border-[#35606B] bg-[#2D545E] transition duration-300 
       hover:-translate-y-1 hover:border-[#C89666] hover:bg-[#315B66] hover:shadow-xl cursor-pointer"
    >
      <div className="bg-[#1D3C44] p-4">
        <img
          src={book.coverImage}
          alt={book.title}
          className="h-72 w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4 flex flex-col gap-1">
        <h3 className="min-h-12 font-semibold text-[#F8F8F6] line-clamp-2">
          {book.title}
        </h3>
        <p className="text-sm text-[#9DB1B7]">{book.author}</p>
        <p className="text-xs mt-1">
          {book.availableCopies > 0 ? (
            <span className="inline-flex w-fit rounded-full bg-green-500/15 px-2 py-1 text-xs font-medium text-green-400">
              Available
            </span>
          ) : (
            <span className="inline-flex w-fit rounded-full bg-red-500/15 px-2 py-1 text-xs font-medium text-red-400">
              Checked out
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
