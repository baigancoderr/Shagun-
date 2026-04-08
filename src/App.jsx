
import './App.css'
import { BrowserRouter } from 'react-router-dom';
import CommanRoutes from './Routes/CommanRoutes';
import AdminRoutes from './Routes/AdminRoutes';
import UserRoutes from './Routes/UserRoutes';
// import { ToastContainer } from 'react-toastify';
import { Toaster } from "react-hot-toast";



function App() {



  return (
    <>

     <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />

      <BrowserRouter>
        {/* <ToastContainer /> */}

        <AdminRoutes  />
        <CommanRoutes />
        <UserRoutes />
      </BrowserRouter>



    </>
  )
}

export default App
