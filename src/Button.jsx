export default function Button({ className, children, ...props }) {
  return (
    <button
      {...props}
      className={`border border-black rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 hover:bg-gray-200 disabled:border-gray-400 disabled:text-gray-400 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  )
}
