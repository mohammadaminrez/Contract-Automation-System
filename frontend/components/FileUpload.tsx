"use client";

import { useState, useRef } from "react";
import { api } from "@/lib/api";

interface FileUploadProps {
  onUploadSuccess?: () => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [extractionMethod, setExtractionMethod] = useState<'regex' | 'openai'>('regex');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();

      if (!validTypes.includes(fileExtension)) {
        setError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Step 1: Upload file
      const uploadedContract = await api.uploadContract(file);

      // Step 2: Analyze contract with selected extraction method
      setUploading(false);
      setAnalyzing(true);

      await api.analyzeContract(uploadedContract.id, extractionMethod);

      // Success
      setAnalyzing(false);
      setSuccess(true);
      setFile(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Notify parent component
      onUploadSuccess?.();

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setUploading(false);
      setAnalyzing(false);
      setError(err instanceof Error ? err.message : 'Failed to upload and analyze contract');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // Validate file directly instead of creating fake event
      const validTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + droppedFile.name.split('.').pop()?.toLowerCase();

      if (!validTypes.includes(fileExtension)) {
        setError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
        return;
      }

      if (droppedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setFile(droppedFile);
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Upload Contract
      </h2>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="mb-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium">
              Choose a file
            </span>
            <input
              ref={fileInputRef}
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              disabled={uploading || analyzing}
            />
          </label>
          <span className="text-gray-600 dark:text-gray-400"> or drag and drop</span>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          PDF or Word documents up to 10MB
        </p>
      </div>

      {/* Selected File Info */}
      {file && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              disabled={uploading || analyzing}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">
            Contract uploaded and analyzed successfully!
          </p>
        </div>
      )}

      {/* Extraction Method Toggle */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Extraction Method
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center cursor-pointer flex-1">
            <input
              type="radio"
              value="regex"
              checked={extractionMethod === 'regex'}
              onChange={(e) => setExtractionMethod(e.target.value as 'regex' | 'openai')}
              disabled={uploading || analyzing}
              className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Regex (Pattern-based)
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Fast extraction for Italian Unicampus contracts only
              </p>
            </div>
          </label>
          <label className="flex items-center cursor-pointer flex-1">
            <input
              type="radio"
              value="openai"
              checked={extractionMethod === 'openai'}
              onChange={(e) => setExtractionMethod(e.target.value as 'regex' | 'openai')}
              disabled={uploading || analyzing}
              className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                OpenAI (AI-powered) ⭐
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Works with ANY rental document in any language
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading || analyzing}
        className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
      >
        {uploading && 'Uploading...'}
        {analyzing && 'Analyzing contract...'}
        {!uploading && !analyzing && 'Upload and Analyze'}
      </button>
    </div>
  );
}
