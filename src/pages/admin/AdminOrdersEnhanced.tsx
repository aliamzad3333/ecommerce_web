import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  EyeIcon, 
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import type { RootState } from '../../store/store'
import { setOrders, setLoading, setError, updateOrderStatus } from '../../store/slices/orderSlice'
import { apiClient } from '../../services/api'

const AdminOrdersEnhanced = () => {
  const dispatch = useDispatch()
  const { orders, loading } = useSelector((state: RootState) => state.orders)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Fetch orders with filters
  const fetchOrders = async () => {
    console.log('🔄 Fetching orders...')
    dispatch(setLoading(true))
    try {
      const params: any = { page: 1, limit: 100 }
      
      // Add status filter if not 'all'
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter
      }
      
      // Add date filters
      if (dateFrom) {
        params.from_date = dateFrom
      }
      if (dateTo) {
        params.to_date = dateTo
      }
      
      console.log('📤 API Request params:', params)
      const response = await apiClient.getAdminOrders(params)
      console.log('📥 API Response:', response)
      
      // Handle empty or invalid response
      if (!response || !response.orders) {
        console.warn('⚠️ Invalid response from API:', response)
        dispatch(setOrders([]))
        dispatch(setError('No orders found'))
        return
      }
      
      // Transform API response to match expected format
      const transformedOrders = response.orders.map((order: any) => ({
        id: order.id || order.order_id,
        user_id: order.user_id,
        guest_name: order.guest_name,
        items: order.items || [],
        subtotal: order.subtotal || 0,
        shipping_cost: order.shipping_cost || 0,
        tax: order.tax || 0,
        total: order.total || 0,
        shippingAddress: {
          firstName: order.shipping_address?.full_name?.split(' ')[0] || '',
          lastName: order.shipping_address?.full_name?.split(' ').slice(1).join(' ') || '',
          address: order.shipping_address?.address_line1 || '',
          city: order.shipping_address?.city || '',
          state: order.shipping_address?.state || '',
          zipCode: order.shipping_address?.postal_code || '',
          country: order.shipping_address?.country || '',
          phone: order.shipping_address?.phone || '',
          email: order.shipping_address?.email || ''
        },
        paymentMethod: order.payment_method || 'cash',
        paymentStatus: order.payment_status || 'pending',
        status: order.status || 'pending',
        orderDate: order.order_placed_date || order.created_at || new Date().toISOString(),
        orderNotes: order.order_notes || '',
        adminNotes: order.admin_notes || ''
      }))
      
      dispatch(setOrders(transformedOrders))
      dispatch(setError(null))
      console.log(`✅ Fetched ${transformedOrders.length} orders from API`, {
        filters: params,
        total: response.total,
        status_count: response.status_count
      })
    } catch (error: any) {
      console.error('❌ Failed to fetch orders:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
      dispatch(setError(error.message || 'Failed to fetch orders'))
      dispatch(setOrders([]))
    } finally {
      dispatch(setLoading(false))
    }
  }

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when filters change
  useEffect(() => {
    if (statusFilter !== 'all' || dateFrom || dateTo) {
      fetchOrders()
    }
  }, [statusFilter, dateFrom, dateTo]) // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }


  const filteredOrders = orders.filter(order => {
    const fullName = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.toLowerCase()
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fullName.includes(searchQuery.toLowerCase()) ||
      order.shippingAddress.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress.phone.includes(searchQuery) ||
      order.shippingAddress.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId)
    try {
      await apiClient.updateOrderStatus(orderId, newStatus)
      dispatch(updateOrderStatus({ orderId, status: newStatus as any }))
      // Refresh orders to get latest data
      const response = await apiClient.getAdminOrders({ page: 1, limit: 100 })
      const transformedOrders = response.orders.map((order: any) => ({
        id: order.id,
        items: order.items || [],
        total: order.total || 0,
        shippingAddress: {
          firstName: order.shipping_address?.full_name?.split(' ')[0] || '',
          lastName: order.shipping_address?.full_name?.split(' ').slice(1).join(' ') || '',
          address: order.shipping_address?.address_line1 || '',
          city: order.shipping_address?.city || '',
          state: order.shipping_address?.state || '',
          zipCode: order.shipping_address?.postal_code || '',
          country: order.shipping_address?.country || '',
          phone: order.shipping_address?.phone || '',
          email: order.shipping_address?.email || ''
        },
        paymentMethod: order.payment_method || 'cash',
        status: order.status || 'pending',
        orderDate: order.created_at || new Date().toISOString(),
        orderNotes: order.order_notes || ''
      }))
      dispatch(setOrders(transformedOrders))
    } catch (error: any) {
      console.error('Failed to update order status:', error)
      alert(error.message || 'Failed to update order status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const orderStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' }
  ]

  const handleViewOrder = async (orderId: string) => {
    try {
      dispatch(setLoading(true))
      const response = await apiClient.getOrder(orderId)
      setSelectedOrder(response.order)
      setShowOrderDetails(true)
      console.log('✅ Fetched order details:', response.order)
    } catch (error: any) {
      console.error('❌ Failed to fetch order details:', error)
      alert('Failed to load order details. Please try again.')
    } finally {
      dispatch(setLoading(false))
    }
  }

  // Add error display in UI
  const { error } = useSelector((state: RootState) => state.orders)

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">Error loading orders</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'confirmed').length}
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {orders.filter(o => o.status === 'shipped').length}
            </div>
            <div className="text-sm text-gray-600">Shipped</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
            <div className="text-sm text-gray-600">Delivered</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by ID, customer name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FunnelIcon className="h-4 w-4 inline mr-1" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Reset Filters Button */}
            {(statusFilter !== 'all' || dateFrom || dateTo) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStatusFilter('all')
                    setDateFrom('')
                    setDateTo('')
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium whitespace-nowrap"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {(statusFilter !== 'all' || dateFrom || dateTo) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Active filters:</span>
              {statusFilter !== 'all' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                  Status: {statusOptions.find(o => o.value === statusFilter)?.label}
                </span>
              )}
              {dateFrom && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                  From: {dateFrom}
                </span>
              )}
              {dateTo && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                  To: {dateTo}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 text-lg font-medium">Loading orders...</p>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {!loading && (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 && !loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500 text-lg font-medium">No orders found</p>
                      <p className="text-gray-400 text-sm">Orders will appear here once customers place them</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </div>
                        {order.guest_name && (
                          <div className="text-xs text-orange-600 font-medium mt-1">
                            👤 Guest Order
                          </div>
                        )}
                        {order.user_id && (
                          <div className="text-xs text-blue-600 font-medium mt-1">
                            ✓ Registered User
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900 flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {order.shippingAddress.phone}
                        </div>
                        {order.shippingAddress.email && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {order.shippingAddress.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-bold text-gray-900">৳{order.total.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">
                          Subtotal: ৳{order.subtotal?.toFixed(2) || '0.00'}
                        </div>
                        {(order.shipping_cost || 0) > 0 && (
                          <div className="text-xs text-gray-500">
                            Shipping: ৳{order.shipping_cost?.toFixed(2) || '0.00'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        disabled={updatingStatus === order.id}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                          getStatusColor(order.status)
                        }`}
                      >
                        {orderStatusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewOrder(order.id)}
                          className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                            className="text-green-600 hover:text-green-700 flex items-center space-x-1"
                            title="Confirm Order"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>Confirm</span>
                          </button>
                        )}
                        
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'shipped')}
                            className="text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                            title="Mark as Shipped"
                          >
                            <TruckIcon className="h-4 w-4" />
                            <span>Ship</span>
                          </button>
                        )}
                        
                        {order.status === 'shipped' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'delivered')}
                            className="text-green-600 hover:text-green-700 flex items-center space-x-1"
                            title="Mark as Delivered"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>Deliver</span>
                          </button>
                        )}
                        
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                            className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                            title="Cancel Order"
                          >
                            <XCircleIcon className="h-4 w-4" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order Details
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Order ID: <span className="font-mono font-semibold text-blue-600">#{selectedOrder.order_id || selectedOrder.id}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {(selectedOrder.shipping_address?.full_name || selectedOrder.shippingAddress?.firstName || 'U').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedOrder.shipping_address?.full_name || `${selectedOrder.shippingAddress?.firstName} ${selectedOrder.shippingAddress?.lastName}`}
                        </p>
                        {selectedOrder.guest_name && (
                          <p className="text-sm text-orange-600 font-medium">👤 Guest Order</p>
                        )}
                        {selectedOrder.user_id && (
                          <p className="text-sm text-blue-600 font-medium">✓ Registered User</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {selectedOrder.shipping_address?.phone || selectedOrder.shippingAddress?.phone}
                        </span>
                      </div>
                      {(selectedOrder.shipping_address?.email || selectedOrder.shippingAddress?.email) && (
                        <div className="flex items-center space-x-2">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {selectedOrder.shipping_address?.email || selectedOrder.shippingAddress?.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Shipping Address</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <p>{selectedOrder.shipping_address?.address_line1 || selectedOrder.shippingAddress?.address}</p>
                        <p>
                          {selectedOrder.shipping_address?.city || selectedOrder.shippingAddress?.city}, {selectedOrder.shipping_address?.state || selectedOrder.shippingAddress?.state} {selectedOrder.shipping_address?.postal_code || selectedOrder.shippingAddress?.zipCode}
                        </p>
                        <p>{selectedOrder.shipping_address?.country || selectedOrder.shippingAddress?.country}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Placed:</span>
                      <span className="font-semibold">
                        {new Date(selectedOrder.order_placed_date || selectedOrder.orderDate || selectedOrder.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-semibold capitalize">{selectedOrder.payment_method || selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className="font-semibold capitalize text-yellow-600">
                        {selectedOrder.payment_status || selectedOrder.paymentStatus || 'Pending'}
                      </span>
                    </div>
                    
                    {/* Price Breakdown */}
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">৳{selectedOrder.subtotal?.toFixed(2) || '0.00'}</span>
                      </div>
                      {(selectedOrder.shipping_cost || 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Shipping Cost:</span>
                          <span className="font-medium">৳{selectedOrder.shipping_cost.toFixed(2)}</span>
                        </div>
                      )}
                      {(selectedOrder.tax || 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tax:</span>
                          <span className="font-medium">৳{selectedOrder.tax.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total Amount:</span>
                        <span className="text-blue-600">৳{selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div key={item.product_id || item.id || index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.product_name || item.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <span className="text-2xl">📦</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product_name || item.name}</h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ৳{item.price.toFixed(2)}
                          </p>
                          {item.product_id && (
                            <p className="text-xs text-gray-400 font-mono">ID: {item.product_id}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ৳{(item.subtotal || item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Notes */}
                  {(selectedOrder.order_notes || selectedOrder.orderNotes || selectedOrder.admin_notes || selectedOrder.adminNotes) && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Notes</h3>
                      <div className="space-y-3">
                        {(selectedOrder.order_notes || selectedOrder.orderNotes) && (
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Customer Notes:</p>
                            <p className="text-sm text-gray-600">{selectedOrder.order_notes || selectedOrder.orderNotes}</p>
                          </div>
                        )}
                        {(selectedOrder.admin_notes || selectedOrder.adminNotes) && (
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Admin Notes:</p>
                            <p className="text-sm text-gray-600">{selectedOrder.admin_notes || selectedOrder.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedOrder.id, 'confirmed')
                      setShowOrderDetails(false)
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Confirm Order
                  </button>
                )}
                
                {selectedOrder.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedOrder.id, 'shipped')
                      setShowOrderDetails(false)
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Mark as Shipped
                  </button>
                )}
                
                {selectedOrder.status === 'shipped' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedOrder.id, 'delivered')
                      setShowOrderDetails(false)
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrdersEnhanced
