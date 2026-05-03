import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper/PageWrapper';
import Spinner from '../components/ui/Spinner/Spinner';
import PrivateRoute from './PrivateRoute';
import SellerRoute from './SellerRoute';
import AdminRoute from './AdminRoute';

// Lazy-loaded pages
const Home = lazy(() => import('../pages/Home'));
const Shop = lazy(() => import('../pages/Shop'));
const Category = lazy(() => import('../pages/Category'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetail'));
const Cart = lazy(() => import('../pages/Cart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const OrderConfirmation = lazy(() => import('../pages/OrderConfirmation'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const Search = lazy(() => import('../pages/Search'));
const Deals = lazy(() => import('../pages/Deals'));
const NewArrivals = lazy(() => import('../pages/NewArrivals'));
const Brand = lazy(() => import('../pages/Brand'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));
const Faq = lazy(() => import('../pages/Faq'));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../pages/TermsOfService'));
const ReturnPolicy = lazy(() => import('../pages/ReturnPolicy'));
const BecomeASeller = lazy(() => import('../pages/BecomeASeller'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Profile pages
const Profile = lazy(() => import('../pages/Profile'));
const Orders = lazy(() => import('../pages/Orders'));
const OrderDetail = lazy(() => import('../pages/OrderDetail'));
const Wishlist = lazy(() => import('../pages/Wishlist'));

// Seller dashboard
const SellerDashboard = lazy(() => import('../pages/seller/Dashboard'));

// Admin panel
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" className="text-accent-gold" />
    </div>
  );
}

function withSuspense(Component) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageWrapper />,
    children: [
      // Public routes
      { index: true, element: withSuspense(Home) },
      { path: 'shop', element: withSuspense(Shop) },
      { path: 'shop/:categorySlug', element: withSuspense(Category) },
      { path: 'shop/:categorySlug/:subcategorySlug', element: withSuspense(Category) },
      { path: 'product/:slug', element: withSuspense(ProductDetailPage) },
      { path: 'search', element: withSuspense(Search) },
      { path: 'deals', element: withSuspense(Deals) },
      { path: 'new-arrivals', element: withSuspense(NewArrivals) },
      { path: 'brand/:slug', element: withSuspense(Brand) },
      { path: 'cart', element: withSuspense(Cart) },
      { path: 'checkout', element: withSuspense(Checkout) },
      { path: 'order/confirmation/:orderNumber', element: withSuspense(OrderConfirmation) },
      { path: 'order/track', element: withSuspense(OrderConfirmation) },
      { path: 'login', element: withSuspense(Login) },
      { path: 'register', element: withSuspense(Register) },
      { path: 'forgot-password', element: withSuspense(ForgotPassword) },
      { path: 'reset-password/:token', element: withSuspense(ResetPassword) },
      { path: 'become-a-seller', element: withSuspense(BecomeASeller) },
      { path: 'about', element: withSuspense(About) },
      { path: 'contact', element: withSuspense(Contact) },
      { path: 'faq', element: withSuspense(Faq) },
      { path: 'privacy-policy', element: withSuspense(PrivacyPolicy) },
      { path: 'terms', element: withSuspense(TermsOfService) },
      { path: 'return-policy', element: withSuspense(ReturnPolicy) },

      // Protected user routes
      {
        path: 'profile',
        element: <PrivateRoute />,
        children: [
          { index: true, element: withSuspense(Profile) },
          { path: 'orders', element: withSuspense(Orders) },
          { path: 'orders/:id', element: withSuspense(OrderDetail) },
          { path: 'wishlist', element: withSuspense(Wishlist) },
        ],
      },

      // Seller routes
      {
        path: 'seller-dashboard',
        element: <SellerRoute />,
        children: [
          { index: true, element: withSuspense(SellerDashboard) },
        ],
      },

      // Admin routes
      {
        path: 'admin',
        element: <AdminRoute />,
        children: [
          { index: true, element: withSuspense(AdminDashboard) },
        ],
      },

      // 404
      { path: '*', element: withSuspense(NotFound) },
    ],
  },
]);
