export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        bg-(--card-color)
        text-(--text-color)
        rounded-xl shadow-md p-6
        transition-colors duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
}