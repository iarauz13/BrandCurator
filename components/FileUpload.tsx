import React, { useState, useCallback, useRef } from 'react';
import { Store } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { parseCSV } from '../utils/csvParser';
import { CollectionTemplate } from '../collectionTemplates';

interface FileUploadProps {
  onFileUpload: (stores: Omit<Store, 'collectionId' | 'addedBy' | 'favoritedBy' | 'privateNotes'>[]) => void;
  template: CollectionTemplate;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, template }) => {
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
          setError('Invalid file type. Please upload a CSV file.');
          setFileName('');
          return;
      }
      setFileName(file.name);
      setError('');
      setIsProcessing(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // Offloading to background/idle to simulate the same chunked feel as ImportModal
        const scheduler = (window as any).requestIdleCallback || setTimeout;
        
        scheduler(() => {
          try {
            // Clean template to POJO to ensure no function serialization issues if moved to worker later
            const cleanTemplate = JSON.parse(JSON.stringify(template));
            const { stores: parsedStores } = parseCSV(text, cleanTemplate);
            onFileUpload(parsedStores);
          } catch (err) {
              if (err instanceof Error) {
                  setError(err.message);
              } else {
                  setError("An unknown error occurred during parsing.");
              }
            setFileName('');
          } finally {
            setIsProcessing(false);
          }
        });
      };
      reader.readAsText(file);
    }
  }, [onFileUpload, template]);

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };
  
  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (isProcessing) return;
    const files = event.dataTransfer.files;
    if (fileInputRef.current) {
        fileInputRef.current.files = files;
        const changeEvent = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(changeEvent);
    }
  };

  return (
    <div className="w-full max-w-[200px]">
      <label 
        className={`flex items-center justify-start cursor-pointer group ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex items-center space-x-2">
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          ) : (
             <UploadIcon />
          )}
          <span className="font-medium text-brand-text-secondary text-sm text-left group-hover:text-brand-primary transition-colors group-hover:underline">
            {isProcessing ? 'Curating...' : (fileName || 'Drop CSV or browse')}
          </span>
        </div>
        <input 
          disabled={isProcessing}
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          className="hidden" 
          ref={fileInputRef}
        />
      </label>
      {error && <p className="mt-2 text-[10px] text-red-500 font-bold">{error}</p>}
    </div>
  );
};

export default FileUpload;