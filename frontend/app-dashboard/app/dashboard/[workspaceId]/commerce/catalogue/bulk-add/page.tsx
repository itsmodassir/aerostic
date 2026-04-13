'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Save, ArrowLeft, 
  Image as ImageIcon, MoreHorizontal,
  Copy, Layers, Calculator
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import { useParams, useRouter } from 'next/navigation';

interface BulkProduct {
  tempId: string;
  name: string;
  retailerId: string;
  price: number;
  salePrice?: number;
  description: string;
  imageUrl: string;
  condition: string;
  availability: boolean;
  brand: string;
}

export default function BulkAddPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params?.workspaceId as string;

  const [items, setItems] = useState<BulkProduct[]>([
    { tempId: '1', name: '', retailerId: '', price: 0, description: '', imageUrl: '', condition: 'new', availability: true, brand: '' }
  ]);
  const [catalogs, setCatalogs] = useState<any[]>([]);
  const [selectedCatalog, setSelectedCatalog] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/v1/commerce/catalogs', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setCatalogs(data);
        const defaultCat = data.find((c: any) => c.isDefault);
        if (defaultCat) setSelectedCatalog(defaultCat.metaCatalogId);
      })
      .catch(() => toast.error("Failed to load catalogs"));
  }, []);

  const addItem = () => {
    setItems([...items, { 
      tempId: Math.random().toString(36).substr(2, 9), 
      name: '', retailerId: '', price: 0, description: '', imageUrl: '', condition: 'new', availability: true, brand: '' 
    }]);
  };

  const removeItem = (tempId: string) => {
    if (items.length === 1) return;
    setItems(items.filter(i => i.tempId !== tempId));
  };

  const updateItem = (tempId: string, field: keyof BulkProduct, value: any) => {
    setItems(items.map(i => i.tempId === tempId ? { ...i, [field]: value } : i));
  };

  const duplicateItem = (index: number) => {
    const newItem = { ...items[index], tempId: Math.random().toString(36).substr(2, 9) };
    const newItems = [...items];
    newItems.splice(index + 1, 0, newItem);
    setItems(newItems);
  };

  const handleSaveAll = async () => {
    // Basic validation
    const invalid = items.some(i => !i.name || !i.retailerId || i.price <= 0);
    if (invalid) {
      toast.error("Please fill in Name, SKU, and Price for all items.");
      return;
    }

    setIsSaving(true);
    try {
      // In a real app, we'd have a specific batch endpoint
      // For now, we'll save them one by one or implement the batch logic
      // Since we implemented 'batchSaveProducts' in the plan, I'll assume we have a batch endpoint
      const res = await fetch('/api/v1/commerce/products/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, catalogId: selectedCatalog }),
        credentials: 'include'
      });

      if (!res.ok) throw new Error("Bulk save failed");
      
      toast.success(`Successfully saved ${items.length} products!`);
      router.push(`/dashboard/${workspaceId}/commerce/catalogue`);
    } catch (err) {
      toast.error("Failed to save products.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bulk Add Products</h1>
            <p className="text-muted-foreground text-sm">Add multiple products to your Meta Catalog inventory at once.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Target Catalog</label>
            <select 
              value={selectedCatalog} 
              onChange={(e) => setSelectedCatalog(e.target.value)}
              className="h-10 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 transition-all cursor-pointer hover:bg-white"
            >
              <option value="">Default Catalog</option>
              {catalogs.map(cat => (
                <option key={cat.id} value={cat.metaCatalogId}>{cat.name}</option>
              ))}
            </select>
          </div>
          <Button variant="outline" onClick={addItem} className="h-10">
            <Plus className="w-4 h-4 mr-2" /> Add Row
          </Button>
          <Button onClick={handleSaveAll} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" /> {isSaving ? "Saving..." : "Save & Sync"}
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0 overflow-x-auto">
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead className="min-w-[100px]">Images</TableHead>
                  <TableHead className="min-w-[200px]">Title <span className="text-red-500">*</span></TableHead>
                  <TableHead className="min-w-[150px]">SKU <span className="text-red-500">*</span></TableHead>
                  <TableHead className="min-w-[120px]">Price (INR) <span className="text-red-500">*</span></TableHead>
                  <TableHead className="min-w-[120px]">Sale Price</TableHead>
                  <TableHead className="min-w-[150px]">Brand</TableHead>
                  <TableHead className="min-w-[120px]">Condition</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.tempId} className="group">
                    <TableCell className="text-muted-foreground font-mono text-xs">{index + 1}</TableCell>
                    <TableCell>
                      <div className="relative w-12 h-12 rounded border bg-muted flex items-center justify-center overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground opacity-30" />
                        )}
                        <input 
                          type="text" 
                          placeholder="Image URL" 
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          value={item.imageUrl}
                          onChange={(e) => updateItem(item.tempId, 'imageUrl', e.target.value)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input 
                        placeholder="e.g. Blue Denim Jacket" 
                        value={item.name}
                        className="bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary h-9"
                        onChange={(e) => updateItem(item.tempId, 'name', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        placeholder="SKU-001" 
                        value={item.retailerId}
                        className="bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary h-9 font-mono text-sm"
                        onChange={(e) => updateItem(item.tempId, 'retailerId', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={item.price}
                        className="bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary h-9"
                        onChange={(e) => updateItem(item.tempId, 'price', Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        placeholder="Optional"
                        value={item.salePrice}
                        className="bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary h-9"
                        onChange={(e) => updateItem(item.tempId, 'salePrice', Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        placeholder="Brand Name" 
                        value={item.brand}
                        className="bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary h-9"
                        onChange={(e) => updateItem(item.tempId, 'brand', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <select 
                        value={item.condition} 
                        onChange={(e) => updateItem(item.tempId, 'condition', e.target.value)}
                        className="w-full bg-transparent border-none h-9 text-sm focus:ring-0 outline-none"
                      >
                        <option value="new">New</option>
                        <option value="refurbished">Refurbished</option>
                        <option value="used">Used</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => duplicateItem(index)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeItem(item.tempId)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center py-4 border-2 border-dashed rounded-xl border-muted hover:border-primary/50 transition-colors cursor-pointer" onClick={addItem}>
        <div className="flex items-center gap-2 text-muted-foreground group">
          <Plus className="w-4 h-4 group-hover:text-primary transition-colors" />
          <span className="text-sm font-medium">Add another product row</span>
        </div>
      </div>
    </div>
  );
}
