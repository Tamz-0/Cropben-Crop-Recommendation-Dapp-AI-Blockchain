// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )


// src/main.jsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css';

// Your existing main DApp component
import App from './App.jsx';
// The new public-facing page you will create in the next step
import ProductPublicView from './pages/ProductPublicView.jsx';

// 1. Define the routes for your application
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // You could add an error page here if you like
  },
  {
    // This is the public route for the QR code
    // The ":productId" part is a dynamic parameter
    path: "/product/:productId",
    element: <ProductPublicView />,
  },
]);

// 2. Render the RouterProvider instead of the App component directly
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);