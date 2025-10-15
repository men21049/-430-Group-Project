// src/app/ui/loading-spinner.tsx
export default function LoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-gray-600">
      <div className="w-8 h-8 border-4 border-gray-300 border-t-amber-500 rounded-full animate-spin"></div>
      {text && <p className="mt-3 text-sm">{text}</p>}
    </div>
  );
}
