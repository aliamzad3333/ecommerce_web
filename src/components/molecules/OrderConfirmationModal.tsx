import { XMarkIcon, CheckCircleIcon, PhoneIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline'

interface OrderConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  orderData: {
    id: string
    order_number?: string
    items: Array<{
      product_name: string
      quantity: number
    }>
    total: number
    shipping_address: {
      full_name: string
      phone: string
      address_line1: string
      city: string
    }
    guest_name?: string
    status?: string
    order_placed_date?: string
  } | null
}

const OrderConfirmationModal = ({ isOpen, onClose, orderData }: OrderConfirmationModalProps) => {
  console.log('🎯 OrderConfirmationModal render:', { isOpen, hasOrderData: !!orderData })
  
  if (!isOpen) {
    console.log('❌ Modal not open')
    return null
  }
  
  if (!orderData) {
    console.log('❌ No order data')
    return null
  }
  
  console.log('✅ Rendering confirmation modal with data:', orderData)

  return (
    <div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Header with Celebration */}
        <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 p-8 text-center relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-4 left-4 text-6xl">🎉</div>
            <div className="absolute top-8 right-8 text-4xl">🎊</div>
            <div className="absolute bottom-4 left-12 text-5xl">✨</div>
            <div className="absolute bottom-8 right-12 text-5xl">🎈</div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-4 animate-bounce shadow-lg">
              <CheckCircleIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Thank you for your purchase!
            </h2>
            <p className="text-gray-700 flex items-center justify-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              We will contact you soon to confirm your order.
            </p>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="p-6 space-y-6">
          {/* Order Number Only */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-l-4 border-pink-500 p-4 rounded-r-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Order Summary:</h3>
            <div className="space-y-1 text-sm">
              <p className="text-gray-700">
                <span className="font-semibold">Order Number:</span> <span className="text-pink-600 font-bold">{orderData.order_number || orderData.id}</span>
              </p>
            </div>
          </div>

          {/* Products Ordered */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Products Ordered:</h4>
            <div className="space-y-2">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-700">
                  <span className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {item.quantity}
                  </span>
                  <span>× {item.product_name}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-300">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Order Total:</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">৳{orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer Name</p>
                <p className="font-semibold text-gray-900">{orderData.shipping_address.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <PhoneIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-semibold text-gray-900">{orderData.shipping_address.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <MapPinIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Delivery Address</p>
                <p className="font-semibold text-gray-900">
                  {orderData.shipping_address.address_line1}, {orderData.shipping_address.city}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <h4 className="font-bold text-lg mb-4 text-center">
              আমাদের সাথে যোগাযোগ করতে কল অথবা WhatsApp করুন:
            </h4>
            <div className="flex gap-3">
              <a
                href="tel:01685270352"
                className="flex-1 flex items-center justify-center gap-2 bg-white text-pink-600 py-3 px-4 rounded-lg hover:bg-pink-50 transition-colors font-semibold"
              >
                <PhoneIcon className="h-6 w-6" />
                Call
              </a>
              <a
                href="https://wa.me/8801685270352"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-white text-pink-600 py-3 px-4 rounded-lg hover:bg-pink-50 transition-colors font-semibold"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </a>
            </div>
            <p className="text-center mt-3 text-sm">
              হট লাইন: 01685270352
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmationModal

