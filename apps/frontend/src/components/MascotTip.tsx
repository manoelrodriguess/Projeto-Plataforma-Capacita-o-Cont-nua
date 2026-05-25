import { type ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { MascotAvatar } from './MascotAvatar';

const pageMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
};

export function MascotTip({
  title,
  children,
  compact = false,
  className = '',
}: {
  title: string;
  children: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <motion.div
      {...pageMotion}
      className={`pointer-events-auto relative flex items-center ${compact ? 'gap-3 rounded-lg p-3 pr-9 shadow-md' : 'gap-4 rounded-lg p-4 pr-10 shadow-xl'} border border-[#bfe3ff] bg-white/95 backdrop-blur ${className}`}
    >
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-2 top-2 rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        aria-label="Fechar dica"
      >
        <X size={14} />
      </button>
      <MascotAvatar size={compact ? 'sm' : 'md'} />
      <div>
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{children}</p>
      </div>
    </motion.div>
  );
}
