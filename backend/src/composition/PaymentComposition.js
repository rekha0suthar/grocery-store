import { InMemoryPaymentMethodRegistry } from '@grocery-store/core/services/PaymentMethodRegistry.js';
import { ProcessPaymentUseCase } from '@grocery-store/core/use-cases/payment/ProcessPaymentUseCase.js';
import { CapturePaymentUseCase } from '@grocery-store/core/use-cases/payment/CapturePaymentUseCase.js';
import { RefundPaymentUseCase } from '@grocery-store/core/use-cases/payment/RefundPaymentUseCase.js';
import { StripeProvider } from '../adapters/providers/StripeProvider.js';
import { CashOnDeliveryProvider } from '../adapters/providers/CashOnDeliveryProvider.js';
import { UPIProvider } from '../adapters/providers/UPIProvider.js';
import { SystemClock } from '../adapters/clock/SystemClock.js';

class MockPaymentRepository {
  constructor() {
    this.paymentIntents = new Map();
    this.paymentMethods = new Map();
  }

  async create(paymentIntent) {
    this.paymentIntents.set(paymentIntent.id, paymentIntent);
    return paymentIntent;
  }

  async update(paymentIntent) {
    this.paymentIntents.set(paymentIntent.id, paymentIntent);
    return paymentIntent;
  }

  async findById(id) {
    return this.paymentIntents.get(id) || null;
  }

  async findByExternalId(externalId) {
    for (const intent of this.paymentIntents.values()) {
      if (intent.externalId === externalId) {
        return intent;
      }
    }
    return null;
  }

  async findByOrderId(orderId) {
    const results = [];
    for (const intent of this.paymentIntents.values()) {
      if (intent.orderId === orderId) {
        results.push(intent);
      }
    }
    return results;
  }

  async findByCustomerId(customerId) {
    const results = [];
    for (const intent of this.paymentIntents.values()) {
      if (intent.customerId === customerId) {
        results.push(intent);
      }
    }
    return results;
  }

  async createPaymentMethod(paymentMethod) {
    this.paymentMethods.set(paymentMethod.id, paymentMethod);
    return paymentMethod;
  }

  async updatePaymentMethod(paymentMethod) {
    this.paymentMethods.set(paymentMethod.id, paymentMethod);
    return paymentMethod;
  }

  async findPaymentMethodById(id) {
    return this.paymentMethods.get(id) || null;
  }

  async findPaymentMethodsByUserId(userId) {
    const results = [];
    for (const method of this.paymentMethods.values()) {
      if (method.userId === userId) {
        results.push(method);
      }
    }
    return results;
  }

  async deletePaymentMethod(id) {
    return this.paymentMethods.delete(id);
  }
}

const clock = new SystemClock();
const paymentRepo = new MockPaymentRepository();
const registry = new InMemoryPaymentMethodRegistry();

const providers = [
  new StripeProvider(process.env.STRIPE_SECRET_KEY || 'sk_test_mock'),
  new CashOnDeliveryProvider(),
  new UPIProvider(process.env.UPI_API_KEY || 'upi_mock_key')
];

function chooseProvider(methodId) {
  const provider = providers.find(p => p.supports(methodId));
  if (!provider) {
    throw new Error(`No provider found for payment method: ${methodId}`);
  }
  return provider;
}

export function makeProcessPaymentUseCase(methodId) {
  const provider = chooseProvider(methodId);
  return new ProcessPaymentUseCase({
    paymentProvider: provider,
    paymentRegistry: registry,
    paymentIntentRepo: paymentRepo,
    clock
  });
}

export function makeCapturePaymentUseCase(methodId) {
  const provider = chooseProvider(methodId);
  return new CapturePaymentUseCase({
    paymentProvider: provider,
    paymentIntentRepo: paymentRepo,
    clock
  });
}

export function makeRefundPaymentUseCase(methodId) {
  const provider = chooseProvider(methodId);
  return new RefundPaymentUseCase({
    paymentProvider: provider,
    paymentIntentRepo: paymentRepo,
    clock
  });
}

export function getPaymentContracts() {
  return registry.listEnabledContracts();
}

export function getPaymentContract(methodId) {
  return registry.getContract(methodId);
}

export function getPaymentRepository() {
  return paymentRepo;
}

export function getPaymentRegistry() {
  return registry;
}
