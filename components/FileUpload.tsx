import React, { useState, useCallback, useRef } from 'react';
import type { FileData } from '../types';
import { UploadIcon, TextIcon } from './icons';

interface FileUploadProps {
  onGenerate: (data: FileData) => void;
  disabled: boolean;
}

const ALLOWED_MIMETYPES = [
  'text/plain', 'text/markdown',
  'image/png', 'image/jpeg',
  'audio/mpeg', 'audio/wav', 'audio/mp3',
  'application/pdf',
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
];

export const FileUpload: React.FC<FileUploadProps> = ({ onGenerate, disabled }) => {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFile = useCallback((selectedFile: File | null) => {
    if (!selectedFile) return;

    setError(null);

    if (!ALLOWED_MIMETYPES.includes(selectedFile.type)) {
      setError(`Unsupported file type. Please use text, png, jpg, audio, pdf, or ppt.`);
      return;
    }
    
    setInputText('');
    setFile(selectedFile);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files ? e.target.files[0] : null);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFile(e.dataTransfer.files ? e.dataTransfer.files[0] : null);
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };
  
  const handleSubmit = async () => {
    if (disabled) return;
    setError(null);
    if (file) {
      try {
        const base64Content = await fileToBase64(file);
        let fileType: FileData['type'] = 'text';
        const mimeType = file.type;

        if (mimeType.startsWith('image')) fileType = 'image';
        else if (mimeType.startsWith('audio')) fileType = 'audio';
        else if (mimeType === 'application/pdf') fileType = 'pdf';
        else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) fileType = 'ppt';
        
        onGenerate({ name: file.name, type: fileType, content: base64Content, mimeType: file.type });
      } catch (err) {
        setError("Could not read the file. Please try again.");
      }
    } else if (inputText.trim()) {
      onGenerate({ name: 'Text Input', type: 'text', content: inputText.trim() });
    } else {
      setError('Please provide text or upload a file.');
    }
  };

  const clearInput = () => {
    setFile(null);
    setInputText('');
    setError(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row gap-4">
        <div 
          className={`flex-1 p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center transition-colors duration-200 ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'}`}
          onDrop={handleDrop}
          onDragEnter={handleDragEvents}
          onDragOver={handleDragEvents}
          onDragLeave={handleDragEvents}
        >
          <UploadIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2"/>
          <p className="text-gray-600 dark:text-gray-300">Drag & drop a file here or</p>
          <button onClick={() => fileInputRef.current?.click()} className="mt-2 font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Browse files
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept={ALLOWED_MIMETYPES.join(',')}/>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">PDF, PPT, Text, PNG, JPG, MP3.</p>
        </div>
        <div className="md:w-1/3 flex flex-col">
            <div className="flex items-center gap-2 mb-2 text-gray-600 dark:text-gray-300">
                <TextIcon className="w-5 h-5" />
                <span>Or paste your text</span>
            </div>
            <textarea
                value={inputText}
                onChange={(e) => { setInputText(e.target.value); setFile(null); }}
                placeholder="Enter any text you want to process..."
                className="w-full flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                rows={5}
                disabled={disabled}
            />
        </div>
      </div>
      
      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      
      {(file || inputText) && !disabled && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate pr-4">
                  Ready to process: <span className="font-bold">{file?.name || 'Text Input'}</span>
              </p>
              <button onClick={clearInput} className="text-sm text-gray-500 hover:text-red-500 font-semibold">Clear</button>
          </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={disabled || (!file && !inputText.trim())}
          className="px-6 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
        >
          {disabled ? 'Processing...' : 'Generate'}
        </button>
      </div>
    </div>
  );
};