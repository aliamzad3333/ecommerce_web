import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  CheckCircleIcon, 
  TruckIcon, 
  HomeIcon,
  ShoppingBagIcon,
  ArrowRightIcon
} from '@heroicons/react/24/solid'
import type { RootState } from '../store/store'

const OrderConfirmation = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const { orders } = useSelector((state: RootState) => state.orders)

  useEffect(() => {
    // Simulate loading order data
    const timer = setTimeout(() => {
      const foundOrder = orders.find(o => o.id === orderId)
      setOrder(foundOrder)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [orderId, orders])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">আপনার অর্ডার লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">অর্ডার পাওয়া যায়নি</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            হোমে ফিরে যান
          </button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'অপেক্ষমাণ'
      case 'confirmed':
        return 'নিশ্চিত'
      case 'shipped':
        return 'শিপ করা হয়েছে'
      case 'delivered':
        return 'ডেলিভারি হয়েছে'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ShoppingBagIcon className="h-5 w-5" />
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5" />
      case 'shipped':
        return <TruckIcon className="h-5 w-5" />
      case 'delivered':
        return <HomeIcon className="h-5 w-5" />
      default:
        return <ShoppingBagIcon className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            অর্ডার নিশ্চিত হয়েছে!
          </h1>
          <p className="text-gray-600 text-lg">
            আপনার ক্রয়ের জন্য ধন্যবাদ। আমরা আপনার অর্ডার পেয়েছি এবং শীঘ্রই এটি প্রক্রিয়া করব।
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">অর্ডার বিবরণ</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">অর্ডার তথ্য</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">অর্ডার নম্বর:</span>
                  <span className="font-semibold">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">অর্ডার তারিখ:</span>
                  <span className="font-semibold">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">পেমেন্ট পদ্ধতি:</span>
                  <span className="font-semibold">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">মোট পরিমাণ:</span>
                  <span className="font-semibold text-lg">৳{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">ডেলিভারি ঠিকানা</h3>
              <div className="text-sm text-gray-600">
                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
                <p>ফোন: {order.shippingAddress.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">অর্ডারকৃত পণ্য</h2>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">পরিমাণ: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ৳{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    ৳{item.price.toFixed(2)} প্রতি
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">অর্ডার স্ট্যাটাস</h2>
          <div className="space-y-4">
            {[
              { status: 'pending', label: 'অর্ডার দেওয়া হয়েছে', description: 'আপনার অর্ডার গ্রহণ করা হয়েছে' },
              { status: 'confirmed', label: 'অর্ডার নিশ্চিত', description: 'আমরা আপনার অর্ডার প্রস্তুত করছি' },
              { status: 'shipped', label: 'শিপ করা হয়েছে', description: 'আপনার অর্ডার পথে আছে' },
              { status: 'delivered', label: 'ডেলিভারি হয়েছে', description: 'আপনার অর্ডার ডেলিভারি করা হয়েছে' },
            ].map((step, index) => {
              const isCompleted = ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(order.status) >= index
              const isCurrent = order.status === step.status
              
              return (
                <div key={step.status} className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircleIcon className="h-6 w-6" />
                    ) : (
                      <span className="font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                  {isCurrent && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      {getStatusIcon(step.status)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/my-orders')}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>সব অর্ডার দেখুন</span>
            <ArrowRightIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <ShoppingBagIcon className="h-5 w-5" />
            <span>কেনাকাটা চালিয়ে যান</span>
          </button>
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">এরপর কী হবে?</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• আপনি শীঘ্রই একটি ইমেইল নিশ্চিতকরণ পাবেন</p>
            <p>• আপনার অর্ডার শিপ হলে আমরা আপনাকে ট্র্যাকিং তথ্য পাঠাব</p>
            <p>• প্রত্যাশিত ডেলিভারি: ৩-৫ কার্যদিবস</p>
            <p>• সাহায্য প্রয়োজন? আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন: support@broshop.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation
