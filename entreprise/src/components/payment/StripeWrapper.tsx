import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode } from 'react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface StripeWrapperProps {
  children: ReactNode;
}

const StripeWrapper = ({ children }: StripeWrapperProps) => {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeWrapper;
