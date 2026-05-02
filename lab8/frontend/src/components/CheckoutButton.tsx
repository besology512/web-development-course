'use client';

import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';
import axios from 'axios';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-checkout-session`);
      
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.id,
      });

      if (error) {
        console.error('Stripe redirect error:', error);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to initiate checkout. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
    >
      {loading ? 'Processing...' : 'Upgrade to Premium Ghost Status'}
    </button>
  );
}
