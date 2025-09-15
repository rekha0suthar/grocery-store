import uiReducer, {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  setLoading,
} from '../../../store/slices/uiSlice.js';

describe('UI Slice', () => {
  const initialState = {
    sidebarOpen: false,
    theme: 'light',
    notifications: [],
    modals: {
      productModal: false,
      categoryModal: false,
      requestModal: false,
    },
    loading: {
      global: false,
      products: false,
      categories: false,
      requests: false,
    },
  };

  it('should return the initial state', () => {
    expect(uiReducer(undefined, {})).toEqual(initialState);
  });

  describe('sidebar actions', () => {
    it('should toggle sidebar', () => {
      const action = toggleSidebar();
      const newState = uiReducer(initialState, action);
      expect(newState.sidebarOpen).toBe(true);

      const newState2 = uiReducer(newState, action);
      expect(newState2.sidebarOpen).toBe(false);
    });

    it('should set sidebar open state', () => {
      const action = setSidebarOpen(true);
      const newState = uiReducer(initialState, action);
      expect(newState.sidebarOpen).toBe(true);

      const action2 = setSidebarOpen(false);
      const newState2 = uiReducer(initialState, action2);
      expect(newState2.sidebarOpen).toBe(false);
    });
  });

  describe('theme actions', () => {
    it('should set theme', () => {
      const action = setTheme('dark');
      const newState = uiReducer(initialState, action);
      expect(newState.theme).toBe('dark');
    });
  });

  describe('notification actions', () => {
    it('should add notification', () => {
      const notification = { type: 'success', message: 'Test notification' };
      const action = addNotification(notification);
      const newState = uiReducer(initialState, action);
      
      expect(newState.notifications).toHaveLength(1);
      expect(newState.notifications[0]).toMatchObject(notification);
      expect(newState.notifications[0]).toHaveProperty('id');
      expect(newState.notifications[0]).toHaveProperty('timestamp');
    });

    it('should remove notification', () => {
      const stateWithNotifications = {
        ...initialState,
        notifications: [
          { id: 1, message: 'First' },
          { id: 2, message: 'Second' },
        ],
      };
      const action = removeNotification(1);
      const newState = uiReducer(stateWithNotifications, action);
      
      expect(newState.notifications).toHaveLength(1);
      expect(newState.notifications[0].id).toBe(2);
    });

    it('should clear all notifications', () => {
      const stateWithNotifications = {
        ...initialState,
        notifications: [
          { id: 1, message: 'First' },
          { id: 2, message: 'Second' },
        ],
      };
      const action = clearNotifications();
      const newState = uiReducer(stateWithNotifications, action);
      
      expect(newState.notifications).toHaveLength(0);
    });
  });

  describe('modal actions', () => {
    it('should open modal', () => {
      const action = openModal('productModal');
      const newState = uiReducer(initialState, action);
      expect(newState.modals.productModal).toBe(true);
    });

    it('should close modal', () => {
      const stateWithOpenModal = {
        ...initialState,
        modals: { ...initialState.modals, productModal: true },
      };
      const action = closeModal('productModal');
      const newState = uiReducer(stateWithOpenModal, action);
      expect(newState.modals.productModal).toBe(false);
    });
  });

  describe('loading actions', () => {
    it('should set loading state for specific key', () => {
      const action = setLoading({ key: 'products', loading: true });
      const newState = uiReducer(initialState, action);
      expect(newState.loading.products).toBe(true);
      expect(newState.loading.global).toBe(false);
    });

    it('should set global loading state', () => {
      const action = setLoading({ key: 'global', loading: true });
      const newState = uiReducer(initialState, action);
      expect(newState.loading.global).toBe(true);
    });
  });
});
