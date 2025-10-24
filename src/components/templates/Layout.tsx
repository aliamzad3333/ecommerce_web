import { Outlet } from 'react-router-dom'
import Header from '../organisms/Header'
import Footer from '../organisms/Footer'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/store'

const Layout = () => {
  const { itemCount } = useSelector((state: RootState) => state.cart)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header cartItemCount={itemCount} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
