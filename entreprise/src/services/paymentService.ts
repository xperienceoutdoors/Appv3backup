import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface RefundRequest {
  paymentIntentId: string;
  amount?: number;
  reason?: string;
}

class PaymentService {
  private stripe: any;

  constructor() {
    this.initStripe();
  }

  private async initStripe() {
    this.stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);
  }

  async createPaymentIntent(amount: number, currency: string = 'eur'): Promise<PaymentIntent> {
    try {
      const response = await axios.post('/api/create-payment-intent', {
        amount,
        currency,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async confirmCardPayment(clientSecret: string, paymentMethod: any): Promise<any> {
    try {
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod,
      });

      if (result.error) {
        throw result.error;
      }

      return result.paymentIntent;
    } catch (error) {
      console.error('Error confirming card payment:', error);
      throw error;
    }
  }

  async refundPayment(refundRequest: RefundRequest): Promise<any> {
    try {
      const response = await axios.post('/api/refund', refundRequest);
      return response.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  async getPaymentStatus(paymentIntentId: string): Promise<string> {
    try {
      const response = await axios.get(`/api/payment-status/${paymentIntentId}`);
      return response.data.status;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
