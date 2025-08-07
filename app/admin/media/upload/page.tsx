import type { Metadata } from 'next'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import MediaUpload from '@/components/admin/media/MediaUpload'
import { BreadcrumbItem } from '@/components/admin/layout/AdminBreadcrumb'

export const metadata: Metadata = {
  title: 'Upload Media'
}

export default function MediaUploadPage() {
  const breadcrumb: BreadcrumbItem[] = [
    { name: 'Media Library', href: '/admin/media' },
    { name: 'Upload', current: true }
  ]

  return (
    <AdminLayout 
      title="Upload Media Files" 
      breadcrumb={breadcrumb}
    >
      <div className="max-w-4xl">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Add New Media Files
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload images, videos, and documents to use in your blog posts and pages.
            </p>
          </div>

          <MediaUpload
            onUploadComplete={(files) => {
              console.log('Upload completed:', files)
              // You could redirect or show a success message here
            }}
            maxFiles={20}
            maxFileSize={20 * 1024 * 1024} // 20MB
          />
        </div>

        {/* Tips and best practices */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-blue-900 mb-4">
            📸 Media Upload Tips
          </h4>
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <strong>Image Optimization:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Use WebP format for better compression and quality</li>
                <li>Optimize images to under 1MB for faster loading</li>
                <li>Recommended dimensions: 1200x630px for featured images</li>
              </ul>
            </div>
            <div>
              <strong>SEO Best Practices:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Use descriptive filenames (e.g., "react-tutorial-hero.jpg")</li>
                <li>Add alt text for accessibility and SEO</li>
                <li>Include captions to provide context</li>
              </ul>
            </div>
            <div>
              <strong>Organization:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Group related files together</li>
                <li>Use consistent naming conventions</li>
                <li>Remove unused files to save storage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}