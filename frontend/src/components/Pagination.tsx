interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className="
        flex
        justify-center
        mt-8
        gap-2
        flex-wrap
      "
    >
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
        const isActive = currentPage === n;

        return (
          <button
            key={n}
            onClick={() => onPageChange(n)}
            className={`
              px-4
              py-2
              rounded-lg
              cursor-pointer
              font-medium
              transition-all
              duration-200
              shadow-sm

              hover:-translate-y-0.5
              hover:scale-105
              hover:shadow-md
              active:scale-95

              ${
                isActive
                  ? `
                    bg-[#1E40AF]
                    text-white
                  `
                  : `
                    bg-white
                    text-gray-900
                    border border-gray-200

                    dark:bg-[#2E3553]
                    dark:text-gray-100
                    dark:border-white/10

                    hover:bg-gray-100
                    dark:hover:bg-gray-800
                  `
              }
            `}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}