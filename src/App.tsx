import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import PortfolioDetail from './pages/PortfolioDetail'
import Team from './pages/Team'
import Contact from './pages/Contact'
import CountriesProfile from './pages/CountriesProfile'
import CountryDetail from './pages/CountryDetail'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'geospatial-data',
        element: <Home />,
      },
      {
        path: 'countries-profile',
        element: <CountriesProfile />,
      },
      {
        path: 'country/:slug',
        element: <CountryDetail />,
      },
      {
        path: 'team',
        element: <Team />,
      },
      {
        path: 'team/:slug',
        element: <PortfolioDetail />,
      },
      {
        path: 'form/contact',
        element: <Contact />,
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App