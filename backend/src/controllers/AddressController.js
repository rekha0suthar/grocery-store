import { BaseController } from './BaseController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class AddressController extends BaseController {
  constructor() {
    super();
  }

  getUserAddresses = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const addresses = await this.getAddressesFromOrders(userId);
    
    this.sendSuccess(res, addresses, 'Addresses retrieved successfully');
  }); 

  saveAddress = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const addressData = req.body;
    
    const address = {
      id: `addr_${Date.now()}`,
      ...addressData,
      userId,
      isDefault: false,
      createdAt: new Date().toISOString()
    };
    
    this.sendSuccess(res, address, 'Address saved successfully', 201);
  });

  updateAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const addressData = req.body;
    
    const address = {
      id,
      ...addressData,
      userId,
      updatedAt: new Date().toISOString()
    };
    
    this.sendSuccess(res, address, 'Address updated successfully');
  });

  deleteAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    this.sendSuccess(res, null, 'Address deleted successfully');
  });

  setDefaultAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    this.sendSuccess(res, null, 'Default address set successfully');
  });

  async getAddressesFromOrders(userId) {
    try {
      const { OrderComposition } = await import('../composition/OrderComposition.js');
      const orderComposition = new OrderComposition();
      
      const result = await orderComposition.getManageOrderUseCase().execute('getUserOrders', {
        userId,
        limit: 50,
        offset: 0
      });
      
      if (!result.success || !result.orders) {
        return [];
      }
      
      const addressMap = new Map();
      
      result.orders.forEach(order => {
        if (order.shippingAddress) {
          const addressKey = this.createAddressKey(order.shippingAddress);
          if (!addressMap.has(addressKey)) {
            addressMap.set(addressKey, {
              id: `order_${order.id}`,
              ...order.shippingAddress,
              source: 'order',
              orderId: order.id,
              lastUsed: order.createdAt,
              isDefault: false
            });
          }
        }
      });
      
      return Array.from(addressMap.values());
    } catch (error) {
      console.error('Error fetching addresses from orders:', error);
      return [];
    }
  }

  createAddressKey(address) {
    return `${address.firstName}_${address.lastName}_${address.address}_${address.city}_${address.state}_${address.zipCode}`.toLowerCase();
  }
} 
