import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import { updateQuantity, removeFromCart } from '../../store/slices/cartSlice'
import type { RootState } from '../../store/store'
import CheckoutModal from './CheckoutModal'
import OrderConfirmationModal from './OrderConfirmationModal'

interface CartFlyoutProps {
  isOpen: boolean
  onClose: () => void
}

const CartFlyout = ({ isOpen, onClose }: CartFlyoutProps) => {
  const dispatch = useDispatch()
  const { items, total } = useSelector((state: RootState) => state.cart)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false)
  const [orderConfirmationData, setOrderConfirmationData] = useState<any>(null)

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(id))
    } else {
      dispatch(updateQuantity({ id, quantity: newQuantity }))
    }
  }

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id))
  }

  const handleCheckout = () => {
    setShowCheckoutModal(true)
  }

  return (
    <>
      {/* Backdrop - Slight fade to focus on flyout (always visible when flyout is open) */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-40 transition-opacity ${
            showCheckoutModal ? 'bg-black/25' : 'bg-black/20'
          }`}
          onClick={onClose}
        />
      )}

      {/* Cart Flyout - Slides from right */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-all duration-300 ease-in-out flex flex-col ${
          isOpen && !showCheckoutModal 
            ? 'translate-x-0 z-50' 
            : showCheckoutModal 
            ? 'translate-x-0 z-40' 
            : 'translate-x-full z-50'
        }`}
      >
        {/* Header - Fixed at top */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0 transition-opacity ${
          showCheckoutModal ? 'opacity-70' : ''
        }`}>
          <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Cart Items - Scrollable */}
        <div className={`flex-1 overflow-y-auto transition-opacity ${
          showCheckoutModal ? 'opacity-70' : ''
        }`}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-600 text-lg mb-2">Your cart is empty</p>
              <p className="text-gray-400 text-sm">Add items to get started</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={item.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5YTliYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5YTliYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm font-bold text-gray-900 mb-3">
                      ৳{item.price.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-gray-200 transition-colors rounded-l-lg"
                          aria-label="Decrease quantity"
                        >
                          <MinusIcon className="h-4 w-4 text-gray-600" />
                        </button>
                        <span className="px-3 py-1 text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-gray-200 transition-colors rounded-r-lg"
                          aria-label="Increase quantity"
                        >
                          <PlusIcon className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom with Subtotal and Checkout */}
        {items.length > 0 && (
          <div className={`border-t border-gray-200 p-6 bg-white flex-shrink-0 transition-opacity ${
            showCheckoutModal ? 'opacity-70' : ''
          }`}>
            {/* Subtotal */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">Subtotal</span>
              <span className="text-xl font-bold text-gray-900">৳{total.toFixed(2)}</span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              ক্যাশ অন ডেলিভারিতে অর্ডার করুন
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => {
          setShowCheckoutModal(false)
        }}
        onOrderSuccess={(orderData) => {
          console.log('🎯 Order success callback received in CartFlyout')
          setOrderConfirmationData(orderData)
          setShowOrderConfirmation(true)
          // Close the cart flyout after successful order
          onClose()
        }}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showOrderConfirmation}
        onClose={() => {
          setShowOrderConfirmation(false)
          setOrderConfirmationData(null)
        }}
        orderData={orderConfirmationData}
      />
    </>
  )
}

export default CartFlyout

