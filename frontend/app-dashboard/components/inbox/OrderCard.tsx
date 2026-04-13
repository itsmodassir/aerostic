'use client';

import React, { useState } from 'react';
import { ShoppingBag, CreditCard, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderCardProps {
  orderData: {
    id?: string;
    catalog_id?: string;
    product_items: any[];
    text?: string;
  };
  tenantId: string;
  isEcho?: boolean;
}

export default function OrderCard({ orderData, tenantId, isEcho }: OrderCardProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('NEW');

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Mock API call to confirm order
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus('CONFIRMED');
      toast.success('Order confirmed!');
    } catch (err) {
      toast.error('Failed to confirm order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentLink = async () => {
    setLoading(true);
    try {
      // Use the actual commerce API
      // res = await fetch(`/api/commerce/orders/${orderId}/payment-link`, { method: 'POST' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Payment link sent via WhatsApp!');
    } catch (err) {
      toast.error('Failed to send payment link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-[300px] border-primary/20 bg-primary/5 shadow-sm overflow-hidden">
      <CardHeader className="p-3 bg-primary/10 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-bold">New Order</CardTitle>
          </div>
          <Badge variant={status === 'NEW' ? 'secondary' : 'default'} className="text-[10px] h-5 px-1.5">
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        <div className="text-xs text-muted-foreground italic mb-1">
          {orderData.text || "Customer sent a cart from your catalog."}
        </div>
        
        <div className="space-y-1">
          {orderData.product_items?.map((item, idx) => (
             <div key={idx} className="flex justify-between text-xs py-1 border-b border-black/5 last:border-0">
               <span className="font-medium truncate max-w-[140px]">
                 {item.product_retailer_id} (x{item.quantity})
               </span>
               <span className="font-semibold whitespace-nowrap">
                 ₹{(item.item_price || 0) * (item.quantity || 1)}
               </span>
             </div>
          ))}
        </div>

        <div className="pt-2 flex justify-between items-center border-t border-primary/10">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</span>
          <span className="text-sm font-extrabold text-primary">
            ₹{orderData.product_items?.reduce((acc, i) => acc + (i.item_price * i.quantity), 0) || 0}
          </span>
        </div>
      </CardContent>
      
      {!isEcho && status === 'NEW' && (
        <CardFooter className="p-2 gap-2 bg-white/50 border-t">
          <Button 
            size="sm" 
            className="flex-1 h-8 text-[11px]" 
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
            Confirm
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 h-8 text-[11px]"
            onClick={handlePaymentLink}
            disabled={loading}
          >
            <CreditCard className="w-3 h-3 mr-1" />
            Pay Link
          </Button>
        </CardFooter>
      )}
      
      {status === 'CONFIRMED' && (
        <CardFooter className="p-2 bg-green-50 border-t justify-center">
            <span className="text-[10px] text-green-700 font-bold flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" /> READY FOR DISPATCH
            </span>
        </CardFooter>
      )}
    </Card>
  );
}
