import { useState, useEffect } from 'react'

type Product = {
  id: string | number
  name: string
  category: string
  price: number
  offer_price?: number
  inStock?: boolean
  description?: string
  specification?: string
  material?: string
}
import { PlusIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    offer_price: '',
    category: '',
    description: '',
    specification: '',
    material: '',
    inStock: true
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [editingProductId, setEditingProductId] = useState<string | number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      // Use relative URL - nginx proxy handles /api -> backend on server
      // Vite proxy handles /api -> localhost:8080 in development
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        const items = Array.isArray(data) ? data : (Array.isArray(data?.products) ? data.products : [])
        const normalized: Product[] = items.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          offer_price: p.offer_price,
          inStock: typeof p.inStock === 'boolean' ? p.inStock : p.in_stock,
          description: p.description,
          specification: p.specification,
          material: p.material,
        }))
        setProducts(normalized)
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('Failed to load products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    const name = (target as any).name as string
    const isCheckbox = (target as HTMLInputElement).type === 'checkbox'
    const nextValue = isCheckbox ? (target as HTMLInputElement).checked : target.value
    setFormData(prev => ({
      ...prev,
      [name]: nextValue
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      offer_price: '',
      category: '',
      description: '',
      specification: '',
      material: '',
      inStock: true
    })
    setImageFile(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      
      const productData: any = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
        specification: formData.specification,
        material: formData.material,
        in_stock: formData.inStock
      }
      
      // Add offer_price only if provided
      if (formData.offer_price && formData.offer_price.trim() !== '') {
        productData.offer_price = parseFloat(formData.offer_price)
      }
      
      // Use relative URL - nginx proxy handles /api -> backend on server
      // Vite proxy handles /api -> localhost:8080 in development
      const isEditing = !!editingProductId
      const url = isEditing
        ? `/api/admin/products/${editingProductId}`
        : `/api/admin/products`
      const method = isEditing ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(productData)
      })
      
      if (response.ok) {
        const newProduct = await response.json()
        console.log('Product created/updated:', newProduct)

        // Upload image after save if provided
        const targetId = isEditing ? editingProductId : (newProduct.product?.id || newProduct.id);
        console.log('Target ID for image upload:', targetId)
        if (imageFile && targetId) {
          const formDataUpload = new FormData()
          formDataUpload.append('image', imageFile)
          const uploadResponse = await fetch(`/api/admin/products/${targetId}/image`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: formDataUpload
          })
          
          if (!uploadResponse.ok) {
            console.error('Image upload failed:', uploadResponse.status)
            const errorText = await uploadResponse.text()
            console.error('Upload error:', errorText)
          } else {
            const uploadResult = await uploadResponse.json()
            console.log('Image uploaded successfully:', uploadResult)
          }
        }
        
        await loadProducts()
        setShowModal(false)
        resetForm()
        setEditingProductId(null)
        setSuccessMessage(isEditing ? 'Product updated successfully!' : 'Product created successfully!')
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        alert(`Failed to ${isEditing ? 'update' : 'create'} product: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert(`Failed to ${editingProductId ? 'update' : 'create'} product: ${error}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 transition-all">{successMessage}</div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No products available</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Offer Price</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.offer_price && product.offer_price < product.price ? (
                      <div className="space-y-1">
                        <div className="text-gray-400 line-through text-xs">${product.price}</div>
                        <div className="font-semibold text-pink-600">${product.offer_price}</div>
                      </div>
                    ) : (
                      <div>${product.price}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.offer_price && product.offer_price < product.price ? (
                      <span className="bg-red-100 text-red-800 px-2 py-1 text-xs rounded-full font-semibold">
                        {Math.round(((product.price - product.offer_price) / product.price) * 100)}% OFF
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">No offer</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingProductId(product.id)
                          setFormData({
                            name: product.name || '',
                            price: String(product.price ?? ''),
                            offer_price: String(product.offer_price ?? ''),
                            category: product.category || '',
                            description: product.description || '',
                            specification: product.specification || '',
                            material: product.material || '',
                            inStock: !!product.inStock,
                          })
                          setImageFile(null)
                          setShowModal(true)
                        }}
                        className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
                            try {
                              // Use relative URL - nginx proxy handles /api -> backend on server
                              const response = await fetch(`/api/admin/products/${product.id}`, {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                                }
                              })
                              
                              if (response.ok) {
                                setSuccessMessage('Product deleted successfully!')
                                setTimeout(() => setSuccessMessage(''), 3000)
                                await loadProducts()
                              } else {
                                const errorText = await response.text()
                                alert(`Failed to delete product: ${response.status} ${errorText}`)
                              }
                            } catch (error) {
                              console.error('Error deleting product:', error)
                              alert(`Failed to delete product: ${error}`)
                            }
                          }
                        }}
                        className="px-3 py-1 rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 pointer-events-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{editingProductId ? 'Edit Product' : 'Add New Product'}</h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                    setEditingProductId(null)
                    setImageFile(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Offer Price (Optional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="offer_price"
                      value={formData.offer_price}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      <option value="electronics">Electronics</option>
                      <option value="clothing">Clothing</option>
                      <option value="accessories">Accessories</option>
                      <option value="home">Home</option>
                      <option value="sports">Sports</option>
                      <option value="books">Books</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description * (min 10 characters)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      minLength={10}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Product description (minimum 10 characters)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {imageFile && (
                      <p className="text-sm text-green-600 mt-1">
                        Selected: {imageFile.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={formData.inStock}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">In Stock</label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (editingProductId ? 'Saving...' : 'Creating...') : (editingProductId ? 'Save Changes' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
