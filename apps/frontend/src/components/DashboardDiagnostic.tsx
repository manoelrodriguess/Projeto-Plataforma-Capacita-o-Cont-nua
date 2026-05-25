import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

const interactiveCard = 'border border-[#d5dce5] shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.10)]';

export function DashboardDiagnostic({ onStart }: { onStart: () => void }) {
  return (
    <Card className={`bg-white/70 backdrop-blur-sm ${interactiveCard} p-4 md:p-6`}>
      <div className="flex h-full flex-col justify-between gap-3 md:gap-4">
        <div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#008AF4] to-[#173DB7] rounded-lg flex items-center justify-center mb-3 md:mb-4 text-white">
            {/* Check icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xs md:text-sm font-semibold text-[#008AF4] mb-1">DIAGNÓSTICO</p>
          <h3 className="text-base md:text-xl font-bold leading-tight text-gray-900">Descubra a trilha ideal</h3>
        </div>
        <Button type="button" onClick={onStart} className="w-full bg-gradient-to-r from-[#008AF4] to-[#173DB7] px-2 text-xs text-white md:text-sm">
          Fazer diagnóstico
          <ChevronRight size={16} />
        </Button>
      </div>
    </Card>
  );
}
