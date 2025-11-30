import { X, PlayCircle, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MediaViewerProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'video' | 'image' | null;
    path: string;
    title: string;
}

export default function MediaViewer({ isOpen, onClose, type, path, title }: MediaViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setIsLoading(true);
            setHasError(false);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, path]);

    if (!isOpen || !type) return null;

    const safePath = path.startsWith('http') ? path : path.startsWith('/') ? path : `/${path}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog">
            {/* Fond sombre flouté */}
            <div 
                className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl transition-opacity duration-300"
                onClick={onClose}
            />

            {/* MODIFICATION ICI : max-w-3xl au lieu de max-w-5xl pour réduire la largeur */}
            <div className="relative w-full max-w-3xl bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 animate-zoom-in flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                            {type === 'video' ? <PlayCircle className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                        </div>
                        <h3 className="font-bold text-lg tracking-wide drop-shadow-md">{title}</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all hover:rotate-90 border border-white/10"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Zone de Contenu */}
                <div className="flex-1 flex items-center justify-center bg-black relative min-h-[300px]">
                    
                    {isLoading && !hasError && (
                        <div className="absolute inset-0 flex items-center justify-center z-0">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        </div>
                    )}

                    {hasError ? (
                        <div className="text-center p-6 text-white/80 z-10">
                            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
                            <p className="font-medium">Impossible de charger le média.</p>
                            <p className="text-xs text-white/40 mt-2 font-mono break-all">{safePath}</p>
                        </div>
                    ) : (
                        type === 'video' ? (
                            <video 
                                controls 
                                autoPlay 
                                playsInline
                                // MODIFICATION ICI : max-h-[60vh] pour limiter la hauteur de la vidéo
                                className="max-w-full max-h-[60vh] w-auto h-auto object-contain shadow-2xl z-10"
                                onLoadedData={() => setIsLoading(false)}
                                onError={() => { setIsLoading(false); setHasError(true); }}
                                key={safePath}
                            >
                                <source src={safePath} type="video/mp4" />
                                <source src={safePath} type="video/webm" />
                                Votre navigateur ne supporte pas la lecture de vidéo.
                            </video>
                        ) : (
                            <img 
                                src={safePath} 
                                alt={title} 
                                className="max-w-full max-h-[60vh] object-contain shadow-2xl z-10"
                                onLoad={() => setIsLoading(false)}
                                onError={() => { setIsLoading(false); setHasError(true); }}
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
}