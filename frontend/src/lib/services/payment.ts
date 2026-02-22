// Payment Types
export type PaymentProvider = 'stripe' | 'paypal';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
}

export interface PaymentResult {
  success: boolean;
  error?: string;
  paymentIntentId?: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface CreatePaymentParams {
  amount: number;
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentProviderInterface {
  initialize(): Promise<void>;
  createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent>;
  confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<PaymentResult>;
  handlePaymentAction(clientSecret: string): Promise<PaymentResult>;
  getPaymentMethods(customerId: string): Promise<PaymentMethod[]>;
  savePaymentMethod(paymentMethodId: string, customerId: string): Promise<PaymentMethod>;
  deletePaymentMethod(paymentMethodId: string): Promise<void>;
}

// Stripe Payment Provider
class StripeProvider implements PaymentProviderInterface {
  private stripe: any = null;

  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    const { loadStripe } = await import('@stripe/stripe-js');
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) throw new Error('Stripe publishable key not configured');
    
    this.stripe = await loadStripe(key);
  }

  async createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
    const response = await fetch('/api/payments/stripe/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment intent');
    }

    return response.json();
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<PaymentResult> {
    if (!this.stripe) throw new Error('Stripe not initialized');

    const { paymentIntent, error } = await this.stripe.confirmCardPayment(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: paymentIntent.status === 'succeeded',
      paymentIntentId: paymentIntent.id,
    };
  }

  async handlePaymentAction(clientSecret: string): Promise<PaymentResult> {
    if (!this.stripe) throw new Error('Stripe not initialized');

    const { paymentIntent, error } = await this.stripe.handleCardAction(clientSecret);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: paymentIntent.status === 'succeeded',
      paymentIntentId: paymentIntent.id,
    };
  }

  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    const response = await fetch(`/api/payments/stripe/methods?customerId=${customerId}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.paymentMethods || [];
  }

  async savePaymentMethod(paymentMethodId: string, customerId: string): Promise<PaymentMethod> {
    const response = await fetch('/api/payments/stripe/save-method', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethodId, customerId }),
    });

    if (!response.ok) {
      throw new Error('Failed to save payment method');
    }

    return response.json();
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    await fetch(`/api/payments/stripe/methods/${paymentMethodId}`, {
      method: 'DELETE',
    });
  }

  // Stripe-specific methods
  async createPaymentElement(options: any) {
    if (!this.stripe) throw new Error('Stripe not initialized');

    const elements = this.stripe.elements();
    return elements.create('payment', options);
  }

  async createCardElement(options: any) {
    if (!this.stripe) throw new Error('Stripe not initialized');

    const elements = this.stripe.elements();
    return elements.create('card', options);
  }

  async tokenizeCard(cardElement: any): Promise<string> {
    if (!this.stripe) throw new Error('Stripe not initialized');

    const { error, token } = await this.stripe.createToken(cardElement);

    if (error) {
      throw new Error(error.message);
    }

    return token.id;
  }
}

// PayPal Payment Provider
class PayPalProvider implements PaymentProviderInterface {
  private paypal: any = null;

  async initialize(): Promise<void> {
    // PayPal SDK is loaded via script tag
    return new Promise((resolve) => {
      if (window.paypal) {
        this.paypal = window.paypal;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
      script.onload = () => {
        this.paypal = window.paypal;
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  async createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
    // PayPal uses different flow - create order instead of payment intent
    const response = await fetch('/api/payments/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency || 'USD',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create PayPal order');
    }

    const data = await response.json();
    return {
      id: data.orderID,
      amount: params.amount,
      currency: params.currency || 'USD',
      status: 'requires_action', // PayPal requires user approval
      clientSecret: data.orderID,
    };
  }

  async confirmPayment(orderId: string): Promise<PaymentResult> {
    const response = await fetch('/api/payments/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Payment failed',
      };
    }

    const data = await response.json();
    return {
      success: data.status === 'COMPLETED',
    };
  }

  async handlePaymentAction(clientSecret: string): Promise<PaymentResult> {
    // PayPal actions are handled client-side with their buttons
    return { success: false, error: 'PayPal actions handled by SDK' };
  }

  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    // PayPal doesn't store payment methods like Stripe
    return [];
  }

  async savePaymentMethod(paymentMethodId: string, customerId: string): Promise<PaymentMethod> {
    throw new Error('PayPal payment method saving not implemented');
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    throw new Error('PayPal payment method deletion not implemented');
  }

  // PayPal-specific methods
  async renderButton(container: string, options: any) {
    if (!this.paypal) throw new Error('PayPal not initialized');

    return this.paypal.Buttons({
      ...options,
      createOrder: async (data: any, actions: any) => {
        const response = await fetch('/api/payments/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: options.amount,
            currency: options.currency || 'USD',
          }),
        });

        const orderData = await response.json();
        return orderData.orderID;
      },
      onApprove: async (data: any, actions: any) => {
        const response = await fetch('/api/payments/paypal/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.orderID }),
        });

        const captureData = await response.json();

        if (captureData.status === 'COMPLETED') {
          options.onSuccess?.(captureData);
        } else {
          options.onError?.(new Error('Payment failed'));
        }
      },
      onError: (err: any) => {
        options.onError?.(err);
      },
    }).render(container);
  }
}

// Main Payment Service
class PaymentService {
  private providers: Map<PaymentProvider, PaymentProviderInterface> = new Map();
  private currentProvider: PaymentProvider = 'stripe';

  constructor() {
    // Initialize providers based on configuration
    if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      this.providers.set('stripe', new StripeProvider());
    }

    if (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
      this.providers.set('paypal', new PayPalProvider());
    }
  }

  setProvider(provider: PaymentProvider): void {
    this.currentProvider = provider;
  }

  getProvider(): PaymentProviderInterface {
    const provider = this.providers.get(this.currentProvider);
    if (!provider) {
      throw new Error(`Payment provider ${this.currentProvider} not configured`);
    }
    return provider;
  }

  async initialize(provider?: PaymentProvider): Promise<void> {
    if (provider) {
      this.setProvider(provider);
    }

    const currentProvider = this.getProvider();
    await currentProvider.initialize();
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentIntent> {
    const provider = this.getProvider();
    return provider.createPaymentIntent(params);
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<PaymentResult> {
    const provider = this.getProvider();
    return provider.confirmPayment(paymentIntentId, paymentMethodId);
  }

  async handlePaymentAction(clientSecret: string): Promise<PaymentResult> {
    const provider = this.getProvider();
    return provider.handlePaymentAction(clientSecret);
  }

  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    const provider = this.getProvider();
    return provider.getPaymentMethods(customerId);
  }

  async savePaymentMethod(paymentMethodId: string, customerId: string): Promise<PaymentMethod> {
    const provider = this.getProvider();
    return provider.savePaymentMethod(paymentMethodId, customerId);
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    const provider = this.getProvider();
    return provider.deletePaymentMethod(paymentMethodId);
  }

  // Utility methods
  formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100); // Convert cents to dollars
  }

  validateCardNumber(cardNumber: string): boolean {
    // Simple Luhn algorithm validation
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  validateExpiryDate(month: number, year: number): boolean {
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    if (month < 1 || month > 12) return false;

    return true;
  }

  validateCVC(cvc: string): boolean {
    return /^\d{3,4}$/.test(cvc);
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// React hook for payment operations
export const usePayment = () => {
  return {
    initialize: paymentService.initialize.bind(paymentService),
    createPayment: paymentService.createPayment.bind(paymentService),
    confirmPayment: paymentService.confirmPayment.bind(paymentService),
    handlePaymentAction: paymentService.handlePaymentAction.bind(paymentService),
    getPaymentMethods: paymentService.getPaymentMethods.bind(paymentService),
    savePaymentMethod: paymentService.savePaymentMethod.bind(paymentService),
    deletePaymentMethod: paymentService.deletePaymentMethod.bind(paymentService),
    setProvider: paymentService.setProvider.bind(paymentService),
    formatAmount: paymentService.formatAmount.bind(paymentService),
    validateCardNumber: paymentService.validateCardNumber.bind(paymentService),
    validateExpiryDate: paymentService.validateExpiryDate.bind(paymentService),
    validateCVC: paymentService.validateCVC.bind(paymentService),
  };
};

export default paymentService;
