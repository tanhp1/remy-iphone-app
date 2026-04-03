export default function BottomSheet({ isOpen, onClose, title, children }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 z-40 bg-black transition-opacity duration-300
          ${isOpen ? 'opacity-60 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-50 bg-s1 rounded-t-3xl border-t border-s3
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-s3 rounded-full" />
        </div>
        {title && (
          <div className="px-5 pb-3 border-b border-s3">
            <h3 className="text-t1 font-semibold text-base">{title}</h3>
          </div>
        )}
        <div className="max-h-[70vh] overflow-y-auto scrollbar-none">
          {children}
        </div>
      </div>
    </>
  );
}
