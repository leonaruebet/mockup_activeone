/**
 * use_document_upload Hook
 * Purpose: Manage document file uploads (PDF, DOC, TXT, etc.) with drag-drop and validation
 * Location: shared/ui/hooks/use_document_upload.ts
 *
 * Features:
 * - Drag-drop state management
 * - File validation (size, type)
 * - Base64 encoding for transport
 * - Upload progress tracking
 * - Configurable file types and size limits
 *
 * Created: 2025-10-26
 * Part of: Week 4 refactoring - Document upload consolidation
 */

import { useState, useCallback } from 'react';

export interface UseDocumentUploadConfig {
  maxSize?: number; // in bytes, default 10MB
  acceptedTypes?: string[]; // file extensions like ['.pdf', '.doc', '.docx', '.txt']
  onUpload?: (fileData: DocumentFileData) => Promise<void>;
  onError?: (error: string) => void;
}

export interface DocumentFileData {
  file_name: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  file_base64: string;
}

export function use_document_upload(config: UseDocumentUploadConfig = {}) {
  console.log('[use_document_upload] Initializing document upload hook');

  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    acceptedTypes = ['.pdf', '.doc', '.docx', '.txt'],
    onUpload,
    onError,
  } = config;

  // State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Validate file size and type
   */
  const validateFile = useCallback(
    (file: File): boolean => {
      console.log('[use_document_upload] Validating file:', file.name);

      // Check file size
      if (file.size > maxSize) {
        const sizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        const error = `File "${file.name}" exceeds ${sizeMB}MB limit`;
        console.error('[use_document_upload]', error);
        onError?.(error);
        return false;
      }

      // Check file type
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.includes(extension)) {
        const error = `File "${file.name}" type not allowed. Accepted: ${acceptedTypes.join(', ')}`;
        console.error('[use_document_upload]', error);
        onError?.(error);
        return false;
      }

      console.log('[use_document_upload] File validation passed:', file.name);
      return true;
    },
    [maxSize, acceptedTypes, onError]
  );

  /**
   * Convert file to base64
   */
  const convertToBase64 = useCallback(async (file: File): Promise<string> => {
    console.log('[use_document_upload] Converting file to base64:', file.name);
    const fileBuffer = await file.arrayBuffer();
    const fileBase64 = Buffer.from(fileBuffer).toString('base64');
    return fileBase64;
  }, []);

  /**
   * Get file type from extension
   */
  const getFileType = useCallback((fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const fileTypeMap: Record<string, string> = {
      pdf: 'pdf',
      doc: 'docx',
      docx: 'docx',
      txt: 'txt',
      csv: 'csv',
      xls: 'xlsx',
      xlsx: 'xlsx',
    };
    return fileTypeMap[extension] || 'other';
  }, []);

  /**
   * Upload files
   */
  const uploadFiles = useCallback(
    async (files: File[]) => {
      console.log('[use_document_upload] Starting upload for', files.length, 'files');

      if (files.length === 0) {
        console.log('[use_document_upload] No files to upload');
        return;
      }

      // Validate all files first
      const invalidFiles = files.filter((file) => !validateFile(file));
      if (invalidFiles.length > 0) {
        console.error('[use_document_upload] Invalid files:', invalidFiles.map((f) => f.name));
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          console.log(`[use_document_upload] Uploading file ${i + 1}/${files.length}:`, file.name);

          // Convert to base64
          const fileBase64 = await convertToBase64(file);

          // Prepare file data
          const fileData: DocumentFileData = {
            file_name: file.name,
            file_type: getFileType(file.name),
            file_size: file.size,
            mime_type: file.type || 'application/octet-stream',
            file_base64: fileBase64,
          };

          // Call upload handler
          if (onUpload) {
            await onUpload(fileData);
          }

          // Update progress
          const progress = Math.round(((i + 1) / files.length) * 100);
          setUploadProgress(progress);

          console.log(`[use_document_upload] File ${i + 1}/${files.length} uploaded:`, file.name);
        }

        console.log('[use_document_upload] All files uploaded successfully');
        setUploadProgress(null);
        setIsUploading(false);
      } catch (error) {
        console.error('[use_document_upload] Upload error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        onError?.(errorMessage);
        setUploadProgress(null);
        setIsUploading(false);
      }
    },
    [validateFile, convertToBase64, getFileType, onUpload, onError]
  );

  /**
   * Handle drag over event
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  /**
   * Handle drag leave event
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  /**
   * Handle file drop event
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      uploadFiles(files);
    },
    [uploadFiles]
  );

  /**
   * Handle file selection from input
   */
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        uploadFiles(files);
      }
    },
    [uploadFiles]
  );

  return {
    // State
    isDragging,
    uploadProgress,
    isUploading,

    // Methods
    uploadFiles,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    validateFile,
    convertToBase64,
    getFileType,
  };
}
