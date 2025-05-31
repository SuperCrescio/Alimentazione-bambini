{
      /* eslint-disable */
    }
    import React from 'react';
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
    import { Toaster } from '@/components/ui/toaster';
    import LandingPage from '@/pages/LandingPage';
    import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
    import PaymentCancelledPage from '@/pages/PaymentCancelledPage';

    function App() {
      return (
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-cancelled" element={<PaymentCancelledPage />} />
          </Routes>
          <Toaster />
        </Router>
      );
    }

    export default App;