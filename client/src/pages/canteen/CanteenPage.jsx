import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Search,
  Loader2,
  ArrowRight,
  ListOrdered,
  AlertCircle,
  FileText,
  DollarSign,
  ChefHat,
  Filter,
} from 'lucide-react';

export default function CanteenPage() {
  const { user } = useAuth();
  const isCanteenOperator =
    user?.role === 'admin' || (user?.role === 'operator' && user?.operator_service === 'canteen');

  // Active view: 'menu' | 'my-orders' | 'operator-queue' | 'operator-menu'
  const [activeView, setActiveView] = useState('menu');

  // Menu data
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMenu, setLoadingMenu] = useState(false);

  // Cart state (Student)
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccessModal, setOrderSuccessModal] = useState(null);

  // Student orders
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);

  // Operator state
  const [operatorOrders, setOperatorOrders] = useState([]);
  const [operatorStatusFilter, setOperatorStatusFilter] = useState('all');
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Operator Menu Management state
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    category: 'meals',
    price: '',
    description: '',
    is_available: true,
  });

  // Fetch Menu
  const fetchMenu = async () => {
    setLoadingMenu(true);
    try {
      const res = await api.get('/canteen/menu');
      if (res.data.success) {
        setMenuItems(res.data.data.menuItems || []);
        if (res.data.data.categories?.length > 0) {
          setCategories(res.data.data.categories);
        }
      }
    } catch (err) {
      console.error('[Canteen] Failed to load menu:', err);
    } finally {
      setLoadingMenu(false);
    }
  };

  // Fetch Student Orders
  const fetchMyOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get('/canteen/orders');
      if (res.data.success) {
        setMyOrders(res.data.data.orders || []);
      }
    } catch (err) {
      console.error('[Canteen] Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch Operator Orders
  const fetchOperatorOrders = async () => {
    if (!isCanteenOperator) return;
    setLoadingQueue(true);
    try {
      const res = await api.get('/canteen/operator/orders', {
        params: { status: operatorStatusFilter },
      });
      if (res.data.success) {
        setOperatorOrders(res.data.data.orders || []);
      }
    } catch (err) {
      console.error('[Canteen] Failed to load operator queue:', err);
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    fetchMenu();
    if (user) {
      fetchMyOrders();
    }
    if (isCanteenOperator) {
      fetchOperatorOrders();
    }
  }, [user, isCanteenOperator, operatorStatusFilter]);

  // Cart operations
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateCartQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id === id) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  // Submit Order
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmittingOrder(true);
    try {
      const payload = {
        items: cart.map((c) => ({ menuItemId: c.id, quantity: c.quantity })),
        notes: orderNotes,
      };
      const res = await api.post('/canteen/orders', payload);
      if (res.data.success) {
        setCart([]);
        setOrderNotes('');
        setCartOpen(false);
        setOrderSuccessModal(res.data.data.order);
        fetchMyOrders();
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to place order.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Student cancel order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.patch(`/canteen/orders/${orderId}/cancel`);
      fetchMyOrders();
      if (selectedOrderDetail?.id === orderId) {
        setSelectedOrderDetail(null);
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Could not cancel order.');
    }
  };

  // Operator status update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setActionLoadingId(orderId);
    try {
      await api.patch(`/canteen/operator/orders/${orderId}/status`, { status: newStatus });
      await fetchOperatorOrders();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update order status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Operator Menu Management
  const handleToggleAvailability = async (item) => {
    try {
      await api.patch(`/canteen/menu/${item.id}/availability`, { is_available: !item.is_available });
      fetchMenu();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update availability.');
    }
  };

  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    try {
      if (editingMenuItem) {
        await api.put(`/canteen/menu/${editingMenuItem.id}`, menuFormData);
      } else {
        await api.post('/canteen/menu', menuFormData);
      }
      setMenuModalOpen(false);
      fetchMenu();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to save menu item.');
    }
  };

  // Filtered Menu Items
  const filteredItems = menuItems.filter((item) => {
    const matchesCat =
      activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'placed':
        return <Badge variant="primary" dot className="capitalize">Placed</Badge>;
      case 'accepted':
        return <span className="px-2 py-0.5 text-[10px] font-semibold text-purple-700 bg-purple-50 rounded-md border border-purple-200">Accepted</span>;
      case 'preparing':
        return <span className="px-2 py-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 rounded-md border border-amber-200">Preparing</span>;
      case 'ready':
        return <Badge variant="success" dot className="capitalize">Ready for Pickup</Badge>;
      case 'completed':
        return <Badge variant="neutral" className="capitalize">Completed</Badge>;
      case 'cancelled':
      case 'rejected':
        return <Badge variant="danger" className="capitalize">{status}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div>
      <PageHeader
        title="Canteen Pre-ordering"
        subtitle="North Canteen daily menu, verified pricing (₹), and real-time order fulfillment"
        breadcrumbs={['Services', 'Canteen']}
        badge={<Badge variant="success">Counter Active</Badge>}
        actions={
          <div className="flex items-center gap-2">
            {isCanteenOperator && (
              <div className="flex items-center gap-1.5 p-1 bg-surface-muted rounded-lg border border-slate-border">
                <button
                  onClick={() => setActiveView('menu')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    activeView === 'menu' ? 'bg-white text-navy-950 shadow-2xs' : 'text-slate-text hover:text-navy-950'
                  }`}
                >
                  Student Menu
                </button>
                <button
                  onClick={() => setActiveView('operator-queue')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    activeView === 'operator-queue' ? 'bg-navy-800 text-white shadow-2xs' : 'text-slate-text hover:text-navy-950'
                  }`}
                >
                  Operator Queue ({operatorOrders.filter((o) => ['placed', 'accepted', 'preparing'].includes(o.status)).length})
                </button>
                <button
                  onClick={() => setActiveView('operator-menu')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    activeView === 'operator-menu' ? 'bg-navy-800 text-white shadow-2xs' : 'text-slate-text hover:text-navy-950'
                  }`}
                >
                  Manage Menu
                </button>
              </div>
            )}

            {/* Cart Trigger Button for Student */}
            {activeView === 'menu' && (
              <Button
                variant="primary"
                size="sm"
                icon={ShoppingBag}
                onClick={() => setCartOpen(true)}
                className="relative"
              >
                <span>Cart</span>
                {cart.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-accent text-white text-[10px] font-bold">
                    {cart.reduce((s, c) => s + c.quantity, 0)}
                  </span>
                )}
              </Button>
            )}

            <button
              onClick={() => {
                setActiveView('my-orders');
                fetchMyOrders();
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                activeView === 'my-orders'
                  ? 'bg-navy-800 text-white border-navy-800'
                  : 'bg-white text-navy-800 border-slate-border hover:bg-slate-50'
              }`}
            >
              My Orders ({myOrders.length})
            </button>
          </div>
        }
      />

      {/* Main View Switcher */}
      {activeView === 'menu' && (
        <>
          {/* Operational Banner */}
          <div className="mb-6 p-4 rounded-xl bg-white border border-slate-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-navy-950">Counter Hours: 08:00 AM – 08:30 PM</h3>
                <p className="text-xs text-slate-text">North Cafeteria Ground Floor • Average preparation time: 8–12 mins</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-text">Live Counter Pickup</span>
              <Badge variant="success" dot className="text-[11px]">
                Accepting Orders
              </Badge>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                icon={Search}
                placeholder="Search food items, meals, beverages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors capitalize whitespace-nowrap focus:outline-none ${
                    activeCategory === cat
                      ? 'bg-navy-800 text-white border-navy-800 shadow-2xs'
                      : 'bg-white text-navy-800 border-slate-border hover:bg-surface-muted'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Catalog Grid */}
          {loadingMenu ? (
            <div className="py-16 text-center text-xs text-slate-text flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-navy-800" />
              <span>Loading menu catalog...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center bg-white border border-slate-border rounded-xl p-8 mb-6">
              <UtensilsCrossed className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-navy-950 mb-1">No Menu Items Found</h3>
              <p className="text-xs text-slate-text max-w-sm mx-auto mb-4">
                No items match your search. Try another query or category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-border rounded-xl p-5 flex flex-col justify-between hover:border-navy-300 transition-colors shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      <span className="text-base font-extrabold text-navy-950 font-mono">
                        ₹{Number(item.price).toFixed(2)}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-navy-950 mb-1">{item.name}</h3>
                    <p className="text-xs text-slate-text leading-relaxed line-clamp-2">
                      {item.description || 'Freshly prepared meal item.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    {item.is_available ? (
                      <span className="flex items-center gap-1.5 text-state-success font-medium text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Available
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-state-danger font-medium text-[11px]">
                        <XCircle className="w-3.5 h-3.5" /> Sold Out
                      </span>
                    )}

                    <Button
                      variant={item.is_available ? 'primary' : 'secondary'}
                      size="sm"
                      disabled={!item.is_available}
                      icon={Plus}
                      onClick={() => addToCart(item)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* STUDENT MY ORDERS VIEW */}
      {activeView === 'my-orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-navy-950">My Canteen Orders</h2>
            <Button variant="outline" size="sm" onClick={() => setActiveView('menu')}>
              ← Back to Menu
            </Button>
          </div>

          {loadingOrders ? (
            <div className="py-16 text-center text-xs text-slate-text flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-navy-800" />
              <span>Fetching order history...</span>
            </div>
          ) : myOrders.length === 0 ? (
            <div className="py-16 text-center bg-white border border-slate-border rounded-xl p-8">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-navy-950 mb-1">No Orders Placed Yet</h3>
              <p className="text-xs text-slate-text max-w-sm mx-auto mb-4">
                You haven't submitted any canteen pre-orders this semester. Browse the menu to place an order!
              </p>
              <Button variant="primary" size="sm" onClick={() => setActiveView('menu')}>
                Explore Daily Menu
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {myOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-slate-border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:border-navy-300 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-navy-950">
                        {order.order_number}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="text-xs text-slate-text">
                      Placed on {new Date(order.created_at).toLocaleString()} • Total: <strong className="text-navy-950 font-mono">₹{Number(order.total_amount).toFixed(2)}</strong>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="text-xs text-slate-600 flex flex-wrap gap-1.5 pt-1">
                        {order.items.map((it, idx) => (
                          <span key={idx} className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                            {it.item_name} × {it.quantity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    {order.status === 'placed' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel Order
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrderDetail(order)}
                    >
                      View Receipt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OPERATOR QUEUE VIEW */}
      {activeView === 'operator-queue' && isCanteenOperator && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div>
              <h2 className="text-base font-bold text-navy-950">Canteen Kitchen Queue</h2>
              <p className="text-xs text-slate-text">Process and update student meal orders in real-time</p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {['all', 'placed', 'accepted', 'preparing', 'ready', 'completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOperatorStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors capitalize ${
                    operatorStatusFilter === st
                      ? 'bg-navy-800 text-white border-navy-800'
                      : 'bg-white text-slate-600 border-slate-border hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loadingQueue ? (
            <div className="py-16 text-center text-xs text-slate-text flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-navy-800" />
              <span>Updating kitchen orders...</span>
            </div>
          ) : operatorOrders.length === 0 ? (
            <div className="py-16 text-center bg-white border border-slate-border rounded-xl p-8">
              <ChefHat className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-navy-950 mb-1">Queue is Empty</h3>
              <p className="text-xs text-slate-text">No orders currently match status '{operatorStatusFilter}'.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {operatorOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-slate-border rounded-xl p-5 flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-sm text-navy-950">
                        {order.order_number}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="text-xs text-slate-text mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span>Student: <strong className="text-navy-900">{order.student_name}</strong></span>
                      <span className="font-mono">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Order Items List */}
                    <div className="space-y-1.5 mb-3">
                      {order.items?.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-navy-950">
                            <strong>{it.quantity}×</strong> {it.item_name}
                          </span>
                          <span className="font-mono text-slate-600">₹{Number(it.subtotal).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="p-2 rounded bg-amber-50 text-[11px] text-amber-800 border border-amber-200 mb-3">
                        <strong>Note:</strong> {order.notes}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-medium text-slate-500">Order Total:</span>
                      <span className="font-mono font-bold text-sm text-navy-950">₹{Number(order.total_amount).toFixed(2)}</span>
                    </div>

                    {/* Operator Workflow Transitions */}
                    <div className="flex items-center gap-2">
                      {order.status === 'placed' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-1 justify-center"
                            isLoading={actionLoadingId === order.id}
                            onClick={() => handleUpdateOrderStatus(order.id, 'accepted')}
                          >
                            Accept Order
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(order.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {order.status === 'accepted' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full justify-center bg-amber-600 hover:bg-amber-700"
                          isLoading={actionLoadingId === order.id}
                          onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                        >
                          Start Preparing
                        </Button>
                      )}

                      {order.status === 'preparing' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full justify-center bg-emerald-700 hover:bg-emerald-800"
                          isLoading={actionLoadingId === order.id}
                          onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                        >
                          Mark Ready for Pickup
                        </Button>
                      )}

                      {order.status === 'ready' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full justify-center"
                          isLoading={actionLoadingId === order.id}
                          onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                        >
                          Handover & Complete
                        </Button>
                      )}

                      {['completed', 'cancelled', 'rejected'].includes(order.status) && (
                        <span className="text-[11px] text-slate-400 italic">Terminal status reached</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OPERATOR MENU MANAGEMENT VIEW */}
      {activeView === 'operator-menu' && isCanteenOperator && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-navy-950">Canteen Menu Catalog</h2>
              <p className="text-xs text-slate-text">Update item prices, descriptions, and live counter availability</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingMenuItem(null);
                setMenuFormData({
                  name: '',
                  category: 'meals',
                  price: '',
                  description: '',
                  is_available: true,
                });
                setMenuModalOpen(true);
              }}
            >
              Add Menu Item
            </Button>
          </div>

          <div className="bg-white border border-slate-border rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-border text-slate-text">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Item Name</th>
                  <th className="py-2.5 px-4 font-semibold">Category</th>
                  <th className="py-2.5 px-4 font-semibold">Price (₹)</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-navy-950">{item.name}</td>
                    <td className="py-3 px-4 capitalize text-slate-600">{item.category}</td>
                    <td className="py-3 px-4 font-mono font-bold text-navy-900">₹{Number(item.price).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      {item.is_available ? (
                        <Badge variant="success" dot className="text-[10px]">Available</Badge>
                      ) : (
                        <Badge variant="danger" dot className="text-[10px]">Unavailable</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className="text-[11px] font-medium text-navy-700 hover:text-navy-950 underline"
                      >
                        {item.is_available ? 'Mark Sold Out' : 'Mark Available'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingMenuItem(item);
                          setMenuFormData({
                            name: item.name,
                            category: item.category,
                            price: item.price,
                            description: item.description || '',
                            is_available: item.is_available,
                          });
                          setMenuModalOpen(true);
                        }}
                        className="text-[11px] font-medium text-navy-800 hover:text-navy-950 underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SLIDE-OUT CART DRAWER */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 bg-navy-950/30 backdrop-blur-2xs z-40"
            onClick={() => setCartOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-200 border-l border-slate-border">
            {/* Cart Header */}
            <div className="p-4 border-b border-slate-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-navy-800" />
                <h3 className="font-bold text-base text-navy-950">Your Meal Order</h3>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-navy-950 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-text">
                  <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <span>Your cart is empty. Add items from the menu.</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-border bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-navy-950">{item.name}</div>
                      <div className="text-[11px] text-slate-text font-mono mt-0.5">
                        ₹{Number(item.price).toFixed(2)} each
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1.5 bg-white border border-slate-border rounded-lg p-0.5">
                        <button
                          onClick={() => updateCartQty(item.id, -1)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-bold text-navy-950">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.id, 1)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono font-bold text-navy-950 w-14 text-right">
                        ₹{(Number(item.price) * item.quantity).toFixed(2)}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-state-danger p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Special Instructions */}
              {cart.length > 0 && (
                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-navy-950 mb-1">
                    Special Instructions / Counter Note
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-border focus:outline-none focus:border-navy-800"
                    placeholder="e.g. Less spicy, packing required, no sugar"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-border bg-slate-50 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-600">Total Payable (₹):</span>
                  <span className="font-mono font-extrabold text-base text-navy-950">
                    ₹{cartTotal.toFixed(2)}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  Orders are verified on server. You will receive an instant token for counter pickup.
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center shadow-xs"
                  isLoading={submittingOrder}
                  onClick={handleCheckout}
                >
                  Submit Order (₹{cartTotal.toFixed(2)})
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ORDER SUCCESS MODAL */}
      <Modal
        isOpen={Boolean(orderSuccessModal)}
        onClose={() => setOrderSuccessModal(null)}
        title="Order Submitted Successfully"
        size="sm"
      >
        {orderSuccessModal && (
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-state-success flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[11px] text-slate-text uppercase font-semibold">Counter Order Token</span>
              <div className="font-mono text-2xl font-extrabold text-navy-950 mt-1">
                {orderSuccessModal.order_number}
              </div>
              <p className="text-xs text-slate-text mt-1">
                Total: <strong className="text-navy-950">₹{Number(orderSuccessModal.total_amount).toFixed(2)}</strong> • Status: <span className="text-accent font-semibold">Placed</span>
              </p>
            </div>

            <p className="text-xs text-slate-text bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed text-left">
              The kitchen team has received your ticket. Watch for status updates in <strong>My Orders</strong> when your meal is marked <strong>Ready for Pickup</strong>.
            </p>

            <Button
              variant="primary"
              size="sm"
              className="w-full justify-center"
              onClick={() => {
                setOrderSuccessModal(null);
                setActiveView('my-orders');
              }}
            >
              Track Order Status
            </Button>
          </div>
        )}
      </Modal>

      {/* ORDER RECEIPT / DETAIL MODAL */}
      <Modal
        isOpen={Boolean(selectedOrderDetail)}
        onClose={() => setSelectedOrderDetail(null)}
        title={`Order Details • ${selectedOrderDetail?.order_number}`}
        size="md"
      >
        {selectedOrderDetail && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-border">
              <div>
                <span className="text-slate-400 block text-[10px]">Reference</span>
                <span className="font-mono font-bold text-navy-950 text-sm">{selectedOrderDetail.order_number}</span>
              </div>
              {getStatusBadge(selectedOrderDetail.status)}
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-navy-950 block">Ordered Items</span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {selectedOrderDetail.items?.map((it, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between bg-white">
                    <div>
                      <span className="font-medium text-navy-950">{it.item_name}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {it.quantity} × ₹{Number(it.unit_price).toFixed(2)}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-navy-950">
                      ₹{Number(it.subtotal).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between font-semibold">
              <span className="text-slate-600">Grand Total:</span>
              <span className="font-mono font-bold text-navy-950 text-sm">
                ₹{Number(selectedOrderDetail.total_amount).toFixed(2)}
              </span>
            </div>

            {selectedOrderDetail.notes && (
              <div className="text-[11px] text-slate-600 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <strong>Special Request:</strong> {selectedOrderDetail.notes}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              {selectedOrderDetail.status === 'placed' && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleCancelOrder(selectedOrderDetail.id)}
                >
                  Cancel Order
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => setSelectedOrderDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* OPERATOR ADD/EDIT MENU ITEM MODAL */}
      {isCanteenOperator && (
        <Modal
          isOpen={menuModalOpen}
          onClose={() => setMenuModalOpen(false)}
          title={editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          size="md"
        >
          <form onSubmit={handleSaveMenuItem} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-navy-950 mb-1">Item Name *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-border focus:outline-none focus:border-navy-800"
                value={menuFormData.name}
                onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                placeholder="e.g. Masala Dosa"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-navy-950 mb-1">Category *</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-slate-border focus:outline-none focus:border-navy-800 capitalize bg-white"
                  value={menuFormData.category}
                  onChange={(e) => setMenuFormData({ ...menuFormData, category: e.target.value })}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="meals">Meals</option>
                  <option value="beverages">Beverages</option>
                  <option value="snacks">Snacks</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-navy-950 mb-1">Price in INR (₹) *</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-border focus:outline-none focus:border-navy-800"
                  value={menuFormData.price}
                  onChange={(e) => setMenuFormData({ ...menuFormData, price: e.target.value })}
                  placeholder="e.g. 55.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-navy-950 mb-1">Description</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-border focus:outline-none focus:border-navy-800"
                value={menuFormData.description}
                onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })}
                placeholder="Ingredients, sides included, etc."
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_avail"
                checked={menuFormData.is_available}
                onChange={(e) => setMenuFormData({ ...menuFormData, is_available: e.target.checked })}
                className="rounded border-slate-border text-navy-800"
              />
              <label htmlFor="is_avail" className="text-xs text-navy-950 font-medium">
                Mark currently available at counter
              </label>
            </div>

            <div className="pt-3 border-t border-slate-border flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setMenuModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Menu Item
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
