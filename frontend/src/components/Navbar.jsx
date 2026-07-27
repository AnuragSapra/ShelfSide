import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext, useState, useEffect, useRef } from "react";
import { logout } from "../api/auth";
import { ChevronDown, BookOpen } from "lucide-react";

export default function Navbar() {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  async function handleLogout() {
    try {
      await logout();
      setIsOpen(false);
      await refreshUser();
      navigate("/");
    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[#2D545E] bg-[#12343B]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="flex items-center gap-3 text-2xl font-bold text-[#E1B382]"
        >
          <BookOpen size={26} />
          <span>ShelfSide</span>
        </Link>

        <div className="flex items-center gap-8 text-[#F8F8F6]">
          {user ? (
            <>
              <Link to="/browse" className="transition hover:text-[#E1B382]">
                Browse
              </Link>

              {user.role === "admin" ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="transition hover:text-[#E1B382]"
                  >
                    Admin Dashboard
                  </Link>

                  <Link
                    to="/admin/member-list"
                    className="transition hover:text-[#E1B382]"
                  >
                    Members
                  </Link>
                </>
              ) : (
                <Link
                  to="/member/dashboard"
                  className="transition hover:text-[#E1B382]"
                >
                  Dashboard
                </Link>
              )}

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-[#2D545E] hover:text-[#E1B382]"
                  aria-expanded={isOpen}
                >
                  <span>{user.name}</span>

                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    className="
                    absolute right-0 mt-3 w-48
                    overflow-hidden rounded-xl
                    border border-[#35606B]
                    bg-[#2D545E]
                    shadow-xl
                  "
                  >
                    <button
                      onClick={handleLogout}
                      className="
                      block w-full px-4 py-3 text-left
                      text-red-300
                      transition
                      hover:bg-red-500/15
                      hover:text-red-200
                    "
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/browse" className="transition hover:text-[#E1B382]">
                Browse
              </Link>

              <Link
                to="/login"
                className="
                rounded-lg
                bg-[#C89666]
                px-5 py-2.5
                font-semibold
                text-[#12343B]
                transition
                hover:bg-[#B78355]
              "
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
