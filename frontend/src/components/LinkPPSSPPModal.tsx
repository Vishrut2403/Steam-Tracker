import { useState } from 'react';
import axios from 'axios';

interface LinkPPSSPPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: () => void;
  userId: string;
}

const LinkPPSSPPModal: React.FC<LinkPPSSPPModalProps> = ({ isOpen, onClose, onLink, userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [linkResult, setLinkResult] = useState<{
    total: number;
    linked: number;
    notFound: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleLink = async () => {
    setIsLoading(true);
    setError('');
    setLinkResult(null);

    try {
      console.log('Starting PPSSPP serial linking...');
      
      const response = await axios.post('http://localhost:3001/api/ppsspp/link-serials', { userId });
      
      console.log('Linking complete:', response.data);
      setLinkResult(response.data.summary);
      
      setTimeout(() => {
        onLink();
        onClose();
      }, 2000);
      
    } catch (err: any) {
      console.error('PPSSPP linking failed:', err);
      setError(err.response?.data?.error || 'Failed to link PPSSPP serials. Make sure PPSSPP is installed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70"
      onClick={onClose}
    >
      <div 
        className="bg-[#000000] border border-[#333333] rounded-lg p-6 max-w-md w-full shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-[#e5e5e5] mb-4">Sync PPSSPP Playtime</h2>
        
        {!linkResult && !isLoading && (
          <>
            <p className="text-[#a0a0a0] mb-6">
              This will scan PPSSPP config and sync playtime for your PSP games.
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-[#4a3a3a] border border-[#5a4a4a] rounded text-[#a0a0a0] text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleLink}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-[#5a7fa3] border border-[#5a7fa3] text-[#e5e5e5] rounded font-semibold hover:bg-[#7a9fc3] transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? 'Syncing...' : 'Sync Playtime'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#1a1a1a] border border-[#333333] text-[#a0a0a0] rounded font-semibold hover:bg-[#333333] transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block w-12 h-12 border-4 border-[#5a7fa3] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[#a0a0a0]">Syncing PPSSPP playtime...</p>
          </div>
        )}

        {linkResult && (
          <div className="mb-4 p-4 bg-[#3a4a3a] border border-[#5a7fa3] rounded">
            <h3 className="text-[#7a9fc3] font-semibold mb-2">✅ Sync Complete!</h3>
            <div className="text-sm text-[#a0a0a0] space-y-1">
              <p>PSP Games Found: {linkResult.total}</p>
              <p>Linked: {linkResult.linked}</p>
              <p>Not Found: {linkResult.notFound}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkPPSSPPModal;