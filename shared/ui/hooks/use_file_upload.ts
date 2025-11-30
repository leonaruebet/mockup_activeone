/**
 * use_file_upload Hook
 * Purpose: Centralized file upload with drag-drop, validation, and preview
 * Location: shared/ui/hooks/use_file_upload.ts
 *
 * Usage: Replace duplicated file upload logic across components
 * Example:
 *   import { use_file_upload } from '@shared/ui/hooks'
 *   const { isDragging, files, previewUrls, uploadFile, removeFile, ... } = use_file_upload({
 *     maxSize: 10 * 1024 * 1024, // 10MB
 *     acceptedTypes: ['.pdf', '.doc', '.docx'],
 *   });
 *
 * Changelog:
 * - 2025-10-26: Initial extraction from 2 files with identical upload logic
 */

'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * File upload options
 */
export interface FileUploadOptions {
  /** Maximum file size in bytes (default: 10MB) */
  maxSize?: number;
  /** Accepted file types/extensions (default: common image formats) */
  acceptedTypes?: string[];
  /** Maximum number of files allowed in the queue (default: unlimited) */
  maxFiles?: number;
  /** Callback when upload succeeds */
  onSuccess?: (files: File[]) => void;
  /** Callback when upload fails */
  onError?: (error: string) => void;
  /** Allow multiple file selection (default: true) */
  multiple?: boolean;
}

/**
 * File upload hook
 * Purpose: Complete file upload management with drag-drop, validation, and preview
 *
 * Features:
 * - Drag and drop file handling
 * - File type and size validation
 * - Image preview URL generation
 * - File removal with cleanup
 * - Base64 conversion utilities
 * - Progress tracking
 *
 * @param options - Configuration options
 * @returns File upload state and handlers
 *
 * @example
 * ```tsx
 * const {
 *   isDragging,
 *   files,
 *   previewUrls,
 *   uploadProgress,
 *   handleDragOver,
 *   handleDragLeave,
 *   handleDrop,
 *   handleFileSelect,
 *   removeFile,
 *   clearAll,
 * } = use_file_upload({
 *   maxSize: 5 * 1024 * 1024, // 5MB
 *   acceptedTypes: ['.jpg', '.png'],
 *   onSuccess: (files) => console.log('Files uploaded:', files),
 * });
 * ```
 */
export function use_file_upload(options: FileUploadOptions = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    acceptedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxFiles,
    onSuccess,
    onError,
    multiple = true,
  } = options;

  console.log('[use_file_upload] Initializing with options:', {
    maxSize,
    acceptedTypes,
    maxFiles,
    multiple,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validate file against size and type constraints
   * Purpose: Ensure uploaded files meet requirements
   *
   * @param file - File to validate
   * @returns Validation result with error message if invalid
   */
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    console.log('[use_file_upload] Validating file:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      const error = `File "${file.name}" is too large. Maximum size: ${maxSizeMB}MB`;
      console.error('[use_file_upload] File too large:', error);
      return { valid: false, error };
    }

    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const isTypeAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type.toLowerCase();
      }
      // Support MIME type checking
      return file.type === type || file.type.startsWith(`${type}/`);
    });

    if (!isTypeAccepted) {
      const error = `File "${file.name}" type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
      console.error('[use_file_upload] Invalid file type:', error);
      return { valid: false, error };
    }

    console.log('[use_file_upload] File validation passed');
    return { valid: true };
  }, [maxSize, acceptedTypes]);

  /**
   * Convert file to Base64 string
   * Purpose: Generate Base64 representation for API upload or preview
   *
   * @param file - File to convert
   * @returns Promise resolving to Base64 string
   */
  const convertToBase64 = useCallback(async (file: File): Promise<string> => {
    console.log('[use_file_upload] Converting file to Base64:', file.name);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          console.log('[use_file_upload] Base64 conversion successful');
          resolve(e.target.result);
        } else {
          const error = 'FileReader result is not a valid string';
          console.error('[use_file_upload] Base64 conversion failed:', error);
          reject(new Error(error));
        }
      };

      reader.onerror = (error) => {
        console.error('[use_file_upload] FileReader error:', error);
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }, []);

  /**
   * Process and add files to upload queue
   * Purpose: Validate, preview, and stage files for upload
   *
   * @param newFiles - Files to process
   */
  const processFiles = useCallback(async (newFiles: File[]) => {
    console.log('[use_file_upload] Processing files:', newFiles.length);

    const validFiles: File[] = [];
    const newPreviewUrls: string[] = [];
    const errors: string[] = [];

    if (typeof maxFiles === 'number' && maxFiles > 0) {
      const totalFiles = files.length + newFiles.length;
      if (totalFiles > maxFiles) {
        const allowed = Math.max(maxFiles - files.length, 0);
        const error = allowed > 0
          ? `Only ${allowed} more file${allowed === 1 ? '' : 's'} can be added (max ${maxFiles}).`
          : `Maximum of ${maxFiles} file${maxFiles === 1 ? '' : 's'} already selected.`;
        console.warn('[use_file_upload] Max files limit reached:', { maxFiles, current: files.length, requested: newFiles.length });
        errors.push(error);
        onError?.(error);
        return;
      }
    }

    for (const file of newFiles) {
      const validation = validateFile(file);

      if (!validation.valid) {
        errors.push(validation.error!);
        continue;
      }

      validFiles.push(file);

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        try {
          const previewUrl = await convertToBase64(file);
          newPreviewUrls.push(previewUrl);
        } catch (error) {
          console.error('[use_file_upload] Failed to generate preview:', error);
          newPreviewUrls.push(''); // Empty placeholder
        }
      } else {
        newPreviewUrls.push(''); // Non-image file
      }
    }

    if (errors.length > 0) {
      const errorMessage = errors.join('\n');
      console.error('[use_file_upload] Validation errors:', errorMessage);
      if (onError) onError(errorMessage);
    }

    if (validFiles.length > 0) {
      console.log('[use_file_upload] Adding valid files:', validFiles.length);

      if (multiple) {
        setFiles(prev => [...prev, ...validFiles]);
        setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      } else {
        setFiles(validFiles);
        setPreviewUrls(newPreviewUrls);
      }

      if (onSuccess) onSuccess(validFiles);
    }
  }, [validateFile, convertToBase64, multiple, onSuccess, onError, maxFiles, files]);

  /**
   * Handle drag over event
   * Purpose: Visual feedback during drag
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  /**
   * Handle drag leave event
   * Purpose: Clear visual feedback when drag leaves
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  /**
   * Handle file drop event
   * Purpose: Process dropped files
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    console.log('[use_file_upload] Files dropped');
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [processFiles]);

  /**
   * Handle file input selection
   * Purpose: Process files selected via input element
   */
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    console.log('[use_file_upload] Files selected from input');
    const fileArray = Array.from(selectedFiles);
    processFiles(fileArray);

    // Reset input to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  }, [processFiles]);

  /**
   * Remove file at specified index
   * Purpose: Allow users to remove unwanted files
   *
   * @param index - Index of file to remove
   */
  const removeFile = useCallback((index: number) => {
    console.log('[use_file_upload] Removing file at index:', index);

    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Revoke removed blob URL if it's a blob
      if (prev[index] && prev[index].startsWith('blob:')) {
        URL.revokeObjectURL(prev[index]);
      }
      return newUrls;
    });
  }, []);

  /**
   * Clear all files
   * Purpose: Reset upload state
   */
  const clearAll = useCallback(() => {
    console.log('[use_file_upload] Clearing all files');

    // Revoke all blob URLs
    previewUrls.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    setFiles([]);
    setPreviewUrls([]);
    setUploadProgress(0);
  }, [previewUrls]);

  /**
   * Trigger file input click
   * Purpose: Programmatically open file selector
   */
  const triggerFileSelect = useCallback(() => {
    console.log('[use_file_upload] Triggering file input');
    fileInputRef.current?.click();
  }, []);

  return {
    // State
    isDragging,
    files,
    previewUrls,
    uploadProgress,
    fileInputRef,

    // Handlers
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    removeFile,
    clearAll,
    triggerFileSelect,

    // Utilities
    convertToBase64,
    validateFile,

    // Progress setter (for custom upload implementations)
    setUploadProgress,
  };
}
