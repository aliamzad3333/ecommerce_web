import { useState, useEffect } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'
import apiClient from '../../services/api'

type Slider = {
  id: string
  image_url: string
  order: number
  created_at: string
  updated_at: string
}

type SliderSettings = {
  slide_duration: number // in seconds
  auto_play: boolean
  show_indicators: boolean
  show_controls: boolean
}

const AdminSliderSettings = () => {
  const [sliders, setSliders] = useState<Slider[]>([])
  const [settings, setSettings] = useState<SliderSettings>({
    slide_duration: 6,
    auto_play: true,
    show_indicators: false,
    show_controls: false
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load sliders and settings in parallel
      const [slidersData, settingsData] = await Promise.all([
        apiClient.getAdminSliders(),
        apiClient.getSliderSettings()
      ])
      
      // Sort sliders by order
      const sortedSliders = Array.isArray(slidersData?.sliders)
        ? slidersData.sliders.sort((a: Slider, b: Slider) => a.order - b.order)
        : []
      
      setSliders(sortedSliders)
      setSettings(settingsData || {
        slide_duration: 6,
        auto_play: true,
        show_indicators: false,
        show_controls: false
      })
    } catch (error: any) {
      console.error('Failed to load slider data:', error)
      setErrorMessage('Failed to load slider data')
      setTimeout(() => setErrorMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      setErrorMessage('')
      setSuccessMessage('')
      
      const response = await apiClient.uploadSliderImage(file)
      
      if (response?.slider) {
        setSuccessMessage('Image uploaded successfully!')
        // Reload sliders to show the new image
        await loadData()
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error: any) {
      console.error('Failed to upload image:', error)
      setErrorMessage('Failed to upload image. Please try again.')
      setTimeout(() => setErrorMessage(''), 3000)
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleDeleteSlider = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slider image?')) return

    try {
      await apiClient.deleteSlider(id)
      setSuccessMessage('Slider image deleted successfully')
      // Reload sliders
      await loadData()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Failed to delete slider:', error)
      setErrorMessage('Failed to delete slider image. Please try again.')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSubmitting(true)
      setErrorMessage('')
      setSuccessMessage('')
      
      await apiClient.updateSliderSettings({
        slide_duration: settings.slide_duration,
        auto_play: settings.auto_play,
        show_indicators: settings.show_indicators,
        show_controls: settings.show_controls
      })
      
      setSuccessMessage('Settings saved successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Failed to save settings:', error)
      setErrorMessage('Failed to save settings. Please try again.')
      setTimeout(() => setErrorMessage(''), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Slider Settings</h1>
        
        {/* Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Slider Settings */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Slider Configuration</h2>
          
          {/* Slide Duration */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slide Duration (seconds)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              step="1"
              value={settings.slide_duration}
              onChange={(e) => setSettings(prev => ({ ...prev, slide_duration: parseInt(e.target.value) || 6 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              How long each slide will be displayed (1-30 seconds). Recommended: 3-8 seconds
            </p>
          </div>

          {/* Auto Play */}
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.auto_play}
                onChange={(e) => setSettings(prev => ({ ...prev, auto_play: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Auto Play</span>
            </label>
          </div>

          {/* Show Indicators */}
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.show_indicators}
                onChange={(e) => setSettings(prev => ({ ...prev, show_indicators: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Show Indicators (dots)</span>
            </label>
          </div>

          {/* Show Controls */}
          <div className="mb-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.show_controls}
                onChange={(e) => setSettings(prev => ({ ...prev, show_controls: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Show Controls (prev/next buttons)</span>
            </label>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold"
          >
            {submitting ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Upload Image */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Slider Image</h2>
          <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
            {uploadingImage ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Choose Image to Upload
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploadingImage}
            />
          </label>
          <p className="mt-2 text-sm text-gray-500">
            Upload an image to add it to the slider. Images are automatically saved to the database.
          </p>
        </div>

        {/* Slider Images List */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Slider Images ({sliders.length})
          </h2>
          
          {sliders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No slider images. Upload an image to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sliders.map((slider, index) => (
                <div
                  key={slider.id}
                  className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                >
                  {/* Order Badge */}
                  <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                  
                  {/* Image */}
                  <img
                    src={slider.image_url}
                    alt={`Slider ${index + 1}`}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5YTliYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
                    }}
                  />
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteSlider(slider.id)}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    title="Delete image"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSliderSettings
