export default function Button({ className, children, ...props }) {
  return (
    <button
      {...props}
      className={`border border-black dark:border-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-sky-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:border-gray-400 disabled:text-gray-400 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  )
}
