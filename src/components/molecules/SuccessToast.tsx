import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { useEffect } from 'react'

interface SuccessToastProps {
  message: string
  onClose: () => void
}

const SuccessToast = ({ message, onClose }: SuccessToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-4 right-4 z-[100] animate-slideDown">
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px] animate-pulse-once">
        <CheckCircleIcon className="h-8 w-8 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-lg">Success!</p>
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-green-100 transition-colors ml-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default SuccessToast

