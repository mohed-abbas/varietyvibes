'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { formatFileSize } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface UploadingFile {
  file: File
  progress: number
  error?: string
  id: string
}

interface MediaUploadProps {
  onUploadComplete?: (files: any[]) => void
  maxFiles?: number
  acceptedFileTypes?: string[]
  maxFileSize?: number // in bytes
}

export default function MediaUpload({
  onUploadComplete,
  maxFiles = 10,
  acceptedFileTypes = ['image/*', 'video/*', 'application/pdf'],
  maxFileSize = 10 * 1024 * 1024 // 10MB
}: MediaUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          toast.error(`${file.name} is too large. Max size is ${formatFileSize(maxFileSize)}`)
        } else if (error.code === 'file-invalid-type') {
          toast.error(`${file.name} is not a supported file type`)
        } else {
          toast.error(`${file.name}: ${error.message}`)
        }
      })
    })

    if (acceptedFiles.length === 0) return

    setIsUploading(true)
    
    // Initialize uploading files state
    const initialFiles: UploadingFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      id: Math.random().toString(36).substr(2, 9)
    }))
    
    setUploadingFiles(initialFiles)

    // Upload files one by one
    const uploadedFiles: any[] = []
    
    for (const uploadingFile of initialFiles) {
      try {
        const result = await uploadFile(uploadingFile)
        uploadedFiles.push(result)
        
        // Update progress to complete
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === uploadingFile.id 
              ? { ...f, progress: 100 } 
              : f
          )
        )
      } catch (error) {
        // Update with error
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === uploadingFile.id 
              ? { ...f, error: error instanceof Error ? error.message : 'Upload failed' } 
              : f
          )
        )
        
        toast.error(`Failed to upload ${uploadingFile.file.name}`)
      }
    }

    setIsUploading(false)
    
    // Clear uploading files after a delay
    setTimeout(() => {
      setUploadingFiles([])
    }, 2000)

    if (uploadedFiles.length > 0) {
      onUploadComplete?.(uploadedFiles)
      toast.success(`Successfully uploaded ${uploadedFiles.length} file(s)`)
    }
  }, [maxFileSize, onUploadComplete])

  const uploadFile = async (uploadingFile: UploadingFile): Promise<any> => {
    const formData = new FormData()
    formData.append('file', uploadingFile.file)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          setUploadingFiles(prev => 
            prev.map(f => 
              f.id === uploadingFile.id 
                ? { ...f, progress } 
                : f
            )
          )
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          try {
            const result = JSON.parse(xhr.responseText)
            resolve(result)
          } catch {
            reject(new Error('Invalid response from server'))
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })

      xhr.open('POST', '/api/admin/media/upload')
      xhr.send(formData)
    })
  }

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    maxSize: maxFileSize,
    disabled: isUploading
  })

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-lg font-medium text-gray-900">
            {isDragActive ? 'Drop files here' : 'Upload media files'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Drag and drop files here, or click to browse
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Supported: Images, Videos, PDFs (max {formatFileSize(maxFileSize)} each)
          </p>
        </div>
      </div>

      {/* Upload progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Uploading {uploadingFiles.length} file(s)...
          </h4>
          
          {uploadingFiles.map((uploadingFile) => (
            <div key={uploadingFile.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {uploadingFile.file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(uploadingFile.file.size)}
                  </div>
                </div>
                
                <button
                  onClick={() => removeUploadingFile(uploadingFile.id)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={uploadingFile.progress > 0 && uploadingFile.progress < 100}
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    uploadingFile.error 
                      ? 'bg-red-500' 
                      : uploadingFile.progress === 100
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${uploadingFile.progress}%` }}
                />
              </div>
              
              {/* Status */}
              <div className="mt-1 text-xs">
                {uploadingFile.error ? (
                  <span className="text-red-600">{uploadingFile.error}</span>
                ) : uploadingFile.progress === 100 ? (
                  <span className="text-green-600">Upload complete</span>
                ) : (
                  <span className="text-gray-500">
                    {Math.round(uploadingFile.progress)}% uploaded
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload guidelines */}
      <div className="text-sm text-gray-500 space-y-1">
        <h4 className="font-medium text-gray-700">Upload Guidelines:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Maximum file size: {formatFileSize(maxFileSize)}</li>
          <li>Supported formats: Images (JPG, PNG, WebP), Videos (MP4, MOV), Documents (PDF)</li>
          <li>For best performance, optimize images before uploading</li>
          <li>Add descriptive alt text for accessibility</li>
        </ul>
      </div>
    </div>
  )
}