import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { XMarkIcon, UserIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline'
import type { RootState } from '../../store/store'
import { removeFromCart, clearCart } from '../../store/slices/cartSlice'
import { apiClient } from '../../services/api'
import SuccessToast from './SuccessToast'
import ErrorToast from './ErrorToast'
import LoadingOverlay from './LoadingOverlay'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onOrderSuccess?: (orderData: any) => void
}

const CheckoutModal = ({ isOpen, onClose, onOrderSuccess }: CheckoutModalProps) => {
  const { items, total } = useSelector((state: RootState) => state.cart)
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    shippingMethod: 'dhaka',
    orderNote: ''
  })
  const [deliveryCharge, setDeliveryCharge] = useState(50)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Update delivery charge based on shipping method
    if (name === 'shippingMethod') {
      if (value === 'dhaka' || value === 'chittagong') {
        setDeliveryCharge(50)
      } else {
        setDeliveryCharge(100)
      }
    }
  }

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, shippingMethod: value }))
    if (value === 'dhaka' || value === 'chittagong') {
      setDeliveryCharge(50)
    } else {
      setDeliveryCharge(100)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phone || !formData.address) {
      setErrorMessage('দয়া করে সকল আবশ্যক তথ্য পূরণ করুন')
      setShowErrorToast(true)
      return
    }

    if (items.length === 0) {
      setErrorMessage('আপনার কার্ট খালি')
      setShowErrorToast(true)
      return
    }

    setIsSubmitting(true)
    
    try {
      // Calculate values for order
      const subtotal = total
      const shippingCost = deliveryCharge
      const tax = 0
      const grandTotal = subtotal + shippingCost + tax
      
      console.log('💰 Order Calculations:', {
        'Cart Subtotal': subtotal,
        'Shipping Cost (should be 50 or 100)': shippingCost,
        'Tax (should be 0)': tax,
        'Grand Total': grandTotal,
        'Shipping Method': formData.shippingMethod
      })
      
      // Prepare order data in EXACT format backend expects
      const orderData: any = {
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        shipping_address: {
          full_name: formData.name,
          address_line1: formData.address,
          city: formData.shippingMethod === 'dhaka' ? 'Dhaka' : formData.shippingMethod === 'chittagong' ? 'Chittagong' : 'Other',
          state: 'Bangladesh',
          postal_code: '',
          country: 'Bangladesh',
          phone: formData.phone
        },
        payment_method: 'cash',
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping_cost: parseFloat(shippingCost.toFixed(2)),
        tax: parseFloat('0.00'),
        total: parseFloat(grandTotal.toFixed(2))
      }
      
      // Add order notes only if present
      if (formData.orderNote && formData.orderNote.trim()) {
        orderData.order_notes = formData.orderNote.trim()
      }

      console.log('📤 FRONTEND SENDING TO API:')
      console.log('   ├─ Subtotal:', orderData.subtotal, 'type:', typeof orderData.subtotal)
      console.log('   ├─ Shipping Cost:', orderData.shipping_cost, 'type:', typeof orderData.shipping_cost, '← Should be 50 or 100')
      console.log('   ├─ Tax:', orderData.tax, 'type:', typeof orderData.tax, '← Should be 0')
      console.log('   └─ Total:', orderData.total, 'type:', typeof orderData.total)
      console.log('📦 Full payload:', JSON.stringify(orderData, null, 2))
      
      // Verify tax is present before sending
      if (orderData.tax === undefined || orderData.tax === null) {
        console.error('❌ TAX IS MISSING FROM ORDER DATA!')
      }
      
      const response = await apiClient.createOrder(orderData)
      
      console.log('✅ Order created successfully:', response)
      console.log('📥 BACKEND RETURNED:')
      console.log('   ├─ Subtotal:', response.order?.subtotal)
      console.log('   ├─ Shipping Cost:', response.order?.shipping_cost, response.order?.shipping_cost !== shippingCost ? '❌ WRONG!' : '✅ Correct')
      console.log('   ├─ Tax:', response.order?.tax, response.order?.tax !== 0 ? '❌ WRONG!' : '✅ Correct')
      console.log('   └─ Total:', response.order?.total)
      
      if (response.order?.shipping_cost !== shippingCost) {
        console.error('⚠️ Backend is overriding shipping_cost! Frontend sent:', shippingCost, 'Backend returned:', response.order?.shipping_cost)
      }
      if (response.order?.tax !== 0) {
        console.error('⚠️ Backend is calculating tax! Frontend sent: 0, Backend returned:', response.order?.tax)
      }
      
      // Prepare order confirmation data from API response
      const orderId = response.order?.order_id || response.order?.id || 'unknown'
      console.log('📝 Order ID:', orderId)
      
      const confirmationData = {
        id: orderId,
        order_number: response.order?.order_number || orderId,
        items: response.order?.items || items.map(item => ({
          product_name: item.name,
          quantity: item.quantity
        })),
        total: response.order?.total || (total + deliveryCharge),
        shipping_address: {
          full_name: response.order?.shipping_address?.full_name || formData.name,
          phone: response.order?.shipping_address?.phone || formData.phone,
          address_line1: response.order?.shipping_address?.address_line1 || formData.address,
          city: response.order?.shipping_address?.city || (formData.shippingMethod === 'dhaka' ? 'Dhaka' : formData.shippingMethod === 'chittagong' ? 'Chittagong' : 'Other')
        },
        guest_name: response.order?.guest_name,
        status: response.order?.status,
        order_placed_date: response.order?.order_placed_date || response.order?.created_at
      }
      
      console.log('📦 Confirmation data prepared:', confirmationData)
      
      // Clear cart after successful order
      dispatch(clearCart())
      console.log('🛒 Cart cleared')
      
      // Close checkout modal
      onClose()
      console.log('❌ Checkout modal closed')
      
      // Stop loading
      setIsSubmitting(false)
      console.log('⏹️ Loading stopped')
      
      // Show success screen immediately
      console.log('🎉 Setting success toast to true')
      setShowSuccessToast(true)
      
      console.log('📋 Calling onOrderSuccess callback')
      onOrderSuccess?.(confirmationData)
      
      console.log('🎊 All success states set!')
    } catch (error: any) {
      console.error('Order submission failed:', error)
      setErrorMessage(error.message || 'অর্ডার সম্পন্ন হয়নি। আবার চেষ্টা করুন।')
      setShowErrorToast(true)
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const grandTotal = total + deliveryCharge

  return (
    <>
      {/* Loading Overlay - Shows above everything while processing */}
      {isSubmitting && <LoadingOverlay />}

      {/* Backdrop - Slight fade to focus on modal */}
      <div
        className="fixed inset-0 bg-black/25 z-[55] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between z-10">
            <div>
              <h2 className="text-lg font-bold text-gray-900">ক্যাশ অন ডেলিভারিতে</h2>
              <p className="text-xs text-gray-600 mt-1">অর্ডার করতে আপনার তথ্য দিন</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5">
            {/* Customer Information */}
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  আপনার নাম *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="আপনার নাম"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <PhoneIcon className="h-5 w-5" />
                  ফোন নাম্বার *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="ফোন নাম্বার"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  এড্রেস *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="এড্রেস"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Shipping Method */}
            <div className="mb-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3">শিপিং মেথড</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="dhaka"
                      checked={formData.shippingMethod === 'dhaka'}
                      onChange={handleShippingChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-gray-900">ঢাকা সিটির ভিতরে</span>
                  </div>
                  <span className="font-semibold text-gray-900">Tk 50.00</span>
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="chittagong"
                      checked={formData.shippingMethod === 'chittagong'}
                      onChange={handleShippingChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-gray-900">চট্টগ্রাম সিটির ভিতরে</span>
                  </div>
                  <span className="font-semibold text-gray-900">Tk 50.00</span>
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="outside"
                      checked={formData.shippingMethod === 'outside'}
                      onChange={handleShippingChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-gray-900">ঢাকা এবং চট্টগ্রাম সিটির বাহিরে</span>
                  </div>
                  <span className="font-semibold text-gray-900">Tk 100.00</span>
                </label>
              </div>
            </div>

            {/* Product Details */}
            <div className="mb-5 p-3 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">পণ্য বিবরণ</h3>
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 mb-3 last:mb-0 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5YTliYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 mb-1 truncate">{item.name}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-600">
                        <span className="font-semibold text-gray-900">পরিমাণ:</span> {item.quantity}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">
                        <span className="font-semibold text-gray-900">দাম:</span> ৳{item.price.toFixed(2)} × {item.quantity} = ৳{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="flex-shrink-0 p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove item"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mb-5 p-3 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">অর্ডার টোটাল</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>সাব টোটাল</span>
                  <span>Tk {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>ডেলিভারি চার্জ</span>
                  <span>Tk {deliveryCharge.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg text-gray-900">
                    <span>সর্বমোট</span>
                    <span>Tk {grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Note */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                অর্ডার নোট
              </label>
              <textarea
                name="orderNote"
                value={formData.orderNote}
                onChange={handleInputChange}
                placeholder="অর্ডার সম্পর্কে কোনো বিশেষ নির্দেশনা দিন (ঐচ্ছিক)"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'প্রক্রিয়াকরণ হচ্ছে...' : 'আপনার অর্ডার কনফার্ম করতে ক্লিক করুন'}
            </button>
          </form>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <SuccessToast
          message="অর্ডার সফলভাবে সম্পন্ন হয়েছে!"
          onClose={() => setShowSuccessToast(false)}
        />
      )}

      {/* Error Toast */}
      {showErrorToast && (
        <ErrorToast
          message={errorMessage}
          onClose={() => setShowErrorToast(false)}
        />
      )}
    </>
  )
}

export default CheckoutModal

