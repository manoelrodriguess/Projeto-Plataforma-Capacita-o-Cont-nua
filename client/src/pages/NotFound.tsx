import { Button } from '@/components/ui/button';

export default function NotFound() {
  const handleGoHome = () => {
    window.history.pushState(null, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f0f5ff] to-[#e8f0ff] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-lg border border-[#e8f0ff] bg-white/80 p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-[#1351b4] mb-2">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Página não encontrada</h1>
        <p className="text-gray-600 mb-6">O caminho acessado não existe neste protótipo.</p>
        <Button type="button" onClick={handleGoHome} className="bg-gradient-to-r from-[#1351b4] to-[#1145a0] text-white">
          Voltar ao início
        </Button>
      </div>
    </div>
  );
}
