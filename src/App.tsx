import React, { useState, useEffect } from 'react';
import { ShoppingCart, Receipt, History, Plus, Minus, Printer, RotateCcw } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  couponNumber: string;
  items: OrderItem[];
  subtotal: number;
  gst: number;
  total: number;
  date: string;
}

type Page = 'order' | 'bill' | 'history';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('order');
  const [customerName, setCustomerName] = useState('');
  const [couponNumber, setCouponNumber] = useState('');
  const [items, setItems] = useState<OrderItem[]>([{ name: '', quantity: 1, price: 0 }]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('tasteOfPiOrders');
    if (savedHistory) {
      setOrderHistory(JSON.parse(savedHistory));
    }
  }, []);

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  const handleProceed = () => {
    if (!customerName.trim() || !couponNumber.trim()) {
      alert('Please fill in customer name and coupon number');
      return;
    }

    const validItems = items.filter(item => item.name.trim() && item.price > 0);
    if (validItems.length === 0) {
      alert('Please add at least one valid item');
      return;
    }

    const { subtotal, gst, total } = calculateTotal();
    const order: Order = {
      id: Date.now().toString(),
      customerName,
      couponNumber,
      items: validItems,
      subtotal,
      gst,
      total,
      date: new Date().toLocaleString()
    };

    setCurrentOrder(order);
    const updatedHistory = [...orderHistory, order];
    setOrderHistory(updatedHistory);
    localStorage.setItem('tasteOfPiOrders', JSON.stringify(updatedHistory));
    setCurrentPage('bill');
  };

  const handleNewOrder = () => {
    setCustomerName('');
    setCouponNumber('');
    setItems([{ name: '', quantity: 1, price: 0 }]);
    setCurrentOrder(null);
    setCurrentPage('order');
  };

  const handlePrint = () => {
    window.print();
  };

  const OrderPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-4">
            Taste of π
          </h1>
          <p className="text-xl text-gray-600">Fill your details and proceed</p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <ShoppingCart className="mr-2" />
                Customer Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Number *
                  </label>
                  <input
                    type="text"
                    value={couponNumber}
                    onChange={(e) => setCouponNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Enter coupon number"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                  <Receipt className="mr-2" />
                  Order Items
                </h2>
                <button
                  onClick={() => setCurrentPage('history')}
                  className="flex items-center px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                >
                  <History className="mr-1 w-4 h-4" />
                  History
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price || ''}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                          className="p-1 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-all"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(index, 'quantity', item.quantity + 1)}
                          className="p-1 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-800">
                          ₹{(item.quantity * item.price).toFixed(2)}
                        </span>
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700 font-medium text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addItem}
                className="w-full mt-4 py-2 border-2 border-dashed border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-all flex items-center justify-center"
              >
                <Plus className="mr-1 w-4 h-4" />
                Add Item
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-semibold text-gray-800">
                Total: ₹{calculateTotal().total.toFixed(2)}
              </div>
              <button
                onClick={handleProceed}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all shadow-lg"
              >
                Proceed to Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const BillPage = () => {
    if (!currentOrder) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-4">
              Taste of π
            </h1>
            <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-full font-semibold text-lg">
              ✓ Order Placed Successfully!
            </div>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 print:shadow-none print:p-4">
            <div className="text-center mb-8 print:mb-4">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">BILL RECEIPT</h2>
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                Taste of π
              </div>
              <p className="text-gray-600 mt-2">Delicious food, infinite satisfaction</p>
            </div>

            <div className="border-t border-b border-gray-200 py-4 mb-6 print:mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-semibold">Customer:</span> {currentOrder.customerName}</p>
                  <p><span className="font-semibold">Bill No:</span> {currentOrder.couponNumber}</p>
                </div>
                <div>
                  <p><span className="font-semibold">Date:</span> {currentOrder.date}</p>
                  <p><span className="font-semibold">Order ID:</span> #{currentOrder.id.slice(-6)}</p>
                </div>
              </div>
            </div>

            <div className="mb-6 print:mb-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-semibold">Item</th>
                    <th className="text-center py-2 font-semibold">Qty</th>
                    <th className="text-right py-2 font-semibold">Price</th>
                    <th className="text-right py-2 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2">{item.name}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">₹{item.price.toFixed(2)}</td>
                      <td className="text-right py-2">₹{(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-200 pt-4 print:pt-2">
              <div className="space-y-2 text-right">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{currentOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span>₹{currentOrder.gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total Amount:</span>
                  <span>₹{currentOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center print:hidden">
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handlePrint}
                  className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                >
                  <Printer className="mr-2 w-4 h-4" />
                  Print Receipt
                </button>
                <button
                  onClick={handleNewOrder}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
                >
                  <RotateCcw className="mr-2 w-4 h-4" />
                  Make Next Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HistoryPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-4">
            Taste of π
          </h1>
          <p className="text-xl text-gray-600">Order History</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Previous Orders</h2>
            <button
              onClick={() => setCurrentPage('order')}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
            >
              New Order
            </button>
          </div>

          {orderHistory.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <p className="text-gray-500 text-lg">No orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orderHistory.reverse().map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{order.customerName}</h3>
                      <p className="text-gray-600">Bill No: {order.couponNumber}</p>
                      <p className="text-gray-500 text-sm">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">₹{order.total.toFixed(2)}</p>
                      <p className="text-gray-500 text-sm">{order.items.length} items</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Items:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name} x{item.quantity}</span>
                          <span>₹{(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      {currentPage === 'order' && <OrderPage />}
      {currentPage === 'bill' && <BillPage />}
      {currentPage === 'history' && <HistoryPage />}
    </div>
  );
}

export default App;