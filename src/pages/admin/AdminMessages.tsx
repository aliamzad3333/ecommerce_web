import { useState } from 'react'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const AdminMessages = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [messages, setMessages] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      subject: 'Order Status Inquiry',
      message: 'Hi, I placed an order last week and haven\'t received any updates. Can you please check the status?',
      status: 'unread',
      date: '2024-01-15',
      type: 'order'
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '+1 (555) 987-6543',
      subject: 'Product Return Request',
      message: 'I would like to return a product I purchased. It arrived damaged and I\'m not satisfied with the quality.',
      status: 'read',
      date: '2024-01-14',
      type: 'return'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+1 (555) 456-7890',
      subject: 'Shipping Question',
      message: 'What are your shipping options to Canada? I need to know the costs and delivery times.',
      status: 'unread',
      date: '2024-01-13',
      type: 'shipping'
    },
    {
      id: 4,
      name: 'Emily Brown',
      email: 'emily@example.com',
      phone: '+1 (555) 321-0987',
      subject: 'Product Availability',
      message: 'Do you have the wireless headphones in stock? I\'m interested in purchasing them.',
      status: 'replied',
      date: '2024-01-12',
      type: 'product'
    },
    {
      id: 5,
      name: 'David Lee',
      email: 'david@example.com',
      phone: '+1 (555) 654-3210',
      subject: 'Account Issue',
      message: 'I\'m having trouble logging into my account. Can you help me reset my password?',
      status: 'read',
      date: '2024-01-11',
      type: 'account'
    }
  ])

  const filteredMessages = messages.filter(message =>
    message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.message.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-red-100 text-red-800'
      case 'read':
        return 'bg-yellow-100 text-yellow-800'
      case 'replied':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
      case 'return':
        return <XMarkIcon className="h-5 w-5 text-red-600" />
      case 'shipping':
        return <EnvelopeIcon className="h-5 w-5 text-green-600" />
      case 'product':
        return <CheckIcon className="h-5 w-5 text-green-600" />
      case 'account':
        return <PhoneIcon className="h-5 w-5 text-purple-600" />
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const markAsRead = (messageId: number) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, status: 'read' } : msg
    ))
  }

  const markAsReplied = (messageId: number) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, status: 'replied' } : msg
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Messages</h1>
          <p className="text-gray-600">Manage customer inquiries and support requests</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message)
                      if (message.status === 'unread') {
                        markAsRead(message.id)
                      }
                    }}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getTypeIcon(message.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {message.name}
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(message.status)}`}>
                            {message.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Message Details */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedMessage.subject}
                      </h2>
                      <p className="text-gray-600">from {selectedMessage.name}</p>
                    </div>
                    <div className="flex space-x-2">
                      {selectedMessage.status === 'read' && (
                        <button
                          onClick={() => markAsReplied(selectedMessage.id)}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold hover:bg-green-200 transition-colors"
                        >
                          Mark as Replied
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Message</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{selectedMessage.message}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Email</p>
                          <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Phone</p>
                          <p className="text-sm text-gray-600">{selectedMessage.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Reply</h3>
                    <div className="space-y-4">
                      <textarea
                        placeholder="Type your reply here..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="flex justify-end space-x-4">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                          Save Draft
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Send Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a message</h3>
                <p className="text-gray-600">Choose a message from the list to view details and reply</p>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">
              {messages.filter(m => m.status === 'unread').length}
            </div>
            <div className="text-sm text-gray-600">Unread Messages</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {messages.filter(m => m.status === 'read').length}
            </div>
            <div className="text-sm text-gray-600">Read Messages</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {messages.filter(m => m.status === 'replied').length}
            </div>
            <div className="text-sm text-gray-600">Replied Messages</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {messages.length}
            </div>
            <div className="text-sm text-gray-600">Total Messages</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminMessages
