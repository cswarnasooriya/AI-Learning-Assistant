import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import AppLayout from '../layout/AppLayout'

const ProtectedRoute = () => {

    isAuthenticated = true
    const loading  = false

    if(loading){
        return (
            <div>Loading...</div>
        )
    }


  return isAuthenticated ? (
    <AppLayout>
        <Outlet/>
    </AppLayout>
    
  ):(
    <Navigate to="/login"/>
  )
}

export default ProtectedRoute