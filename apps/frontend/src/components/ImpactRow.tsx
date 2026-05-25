export function ImpactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#d9efff] pb-3 last:border-b-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-xl font-bold text-[#008AF4]">{value}</span>
    </div>
  );
}
