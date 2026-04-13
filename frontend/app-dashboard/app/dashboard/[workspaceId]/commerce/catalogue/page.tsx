'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Filter, 
  RefreshCcw, Globe, Trash2, Edit3, 
  ExternalLink, CheckCircle, AlertCircle,
  Hash, DollarSign, Image as ImageIcon,
  Layers, ShoppingBag
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useParams, useRouter } from 'next/navigation';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "../../../../../components/ui/dialog";
import { Label } from "../../../../../components/ui/label";
import { Textarea } from "../../../../../components/ui/textarea";
import { toast } from "sonner";

interface Product {
  id: string;
  retailerId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  brand: string;
  url: string;
  condition: string;
  availability: boolean;
  metaProductId?: string;
  salePrice?: number;
  catalogId?: string;
}

interface Catalog {
  id: string;
  metaCatalogId: string;
  name: string;
}

export default function CataloguePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params?.workspaceId as string;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [selectedCatalog, setSelectedCatalog] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [isBatchSyncing, setIsBatchSyncing] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [newCatalogData, setNewCatalogData] = useState({ name: '', vertical: 'COMMERCE' });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    currency: 'INR',
    retailerId: '',
    imageUrl: '',
    brand: '',
    url: '',
    condition: 'new',
    availability: true
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/v1/commerce/products', { credentials: 'include' }),
        fetch('/api/v1/commerce/catalogs', { credentials: 'include' })
      ]);
      
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      
      setProducts(Array.isArray(prodData) ? prodData : []);
      setCatalogs(Array.isArray(catData) ? catData : []);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [workspaceId]);

  const handleSaveProduct = async () => {
    const method = editingProduct ? 'PATCH' : 'POST';
    const url = editingProduct 
      ? `/api/v1/commerce/products/${editingProduct.id}` 
      : '/api/v1/commerce/products';

    const payload = { 
      ...formData, 
      catalogId: (selectedCatalog !== 'all' && !editingProduct) ? selectedCatalog : formData.catalogId 
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (!res.ok) throw new Error("Failed to save");
      
      toast.success(editingProduct ? "Product updated" : "Product created");
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error("Save failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const res = await fetch(`/api/v1/commerce/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const publishToMeta = async (id: string) => {
    setIsSyncing(id);
    try {
      const res = await fetch(`/api/v1/commerce/products/${id}/publish`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Meta sync failed");
      
      toast.success("Published to Meta Catalog!");
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSyncing(null);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  const handleCreateCatalog = async () => {
    try {
      const res = await fetch('/api/v1/commerce/catalogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCatalogData),
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Failed to create catalog");
      toast.success("Meta catalog created!");
      setIsCatalogModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error("Catalog creation failed");
    }
  };

  const handleBatchSync = async () => {
    if (selectedCatalog === 'all') return toast.error("Please select a specific catalog to sync");
    
    setIsBatchSyncing(true);
    try {
      const res = await fetch(`/api/v1/commerce/catalogs/${selectedCatalog}/batch-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: products.map(p => p.id) }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Batch sync failed");
      toast.success("Bulk sync completed!");
      fetchProducts();
    } catch (err) {
      toast.error("Batch sync failed");
    } finally {
      setIsBatchSyncing(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      currency: 'INR',
      retailerId: `SKU-${Math.floor(Math.random() * 10000)}`,
      imageUrl: '',
      brand: '',
      url: '',
      condition: 'new',
      availability: true
    });
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.retailerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commerce Catalogue</h1>
          <p className="text-muted-foreground">Manage your product inventory and sync with WhatsApp Shop.</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={selectedCatalog} 
            onChange={(e) => setSelectedCatalog(e.target.value)}
            className="w-[200px] h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-blue-500"
          >
            <option value="all">All Catalogs</option>
            {catalogs.map(cat => (
              <option key={cat.id} value={cat.metaCatalogId}>{cat.name}</option>
            ))}
          </select>
          <Button variant="outline" onClick={() => setIsCatalogModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Catalog
          </Button>
          <Button variant="secondary" disabled={isBatchSyncing || selectedCatalog === 'all'} onClick={handleBatchSync}>
            <RefreshCcw className={`w-4 h-4 mr-2 ${isBatchSyncing ? 'animate-spin' : ''}`} /> Bulk Sync
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/${workspaceId}/commerce/catalogue/bulk-add`)}>
            <Layers className="w-4 h-4 mr-2" /> Bulk Add
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Synced with Meta</CardTitle>
            <Globe className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter(p => p.metaProductId).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter(p => !p.availability).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter(p => !p.metaProductId).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Product Inventory</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search SKU or name..."
                  className="pl-8 w-full md:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product Details</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Meta Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground animate-pulse">Loading catalogue...</TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Package className="w-10 h-10 opacity-20" />
                      <p>No products found in this workspace.</p>
                      <Button variant="link" onClick={openCreateModal}>Create your first product</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.map((product) => (
                <TableRow key={product.id} className="group">
                  <TableCell>
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-muted-foreground opacity-30" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{product.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">SKU: {product.retailerId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center font-medium">
                      <span className="text-xs text-muted-foreground mr-1">{product.currency}</span>
                      {Number(product.price).toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.availability ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100/80">In Stock</Badge>
                    ) : (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.metaProductId ? (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100/80">
                        <CheckCircle className="w-3 h-3 mr-1" /> Meta Sync
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Publish to Meta"
                        disabled={isSyncing === product.id}
                        onClick={() => publishToMeta(product.id)}
                        className={product.metaProductId ? "text-blue-600" : "text-orange-600"}
                      >
                        <Globe className={`w-4 h-4 ${isSyncing === product.id ? "animate-spin" : ""}`} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              Fill in the product details to add them to your Aerostic catalogue and sync with Meta.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input 
                  id="name" 
                  placeholder="iPhone 15 Pro" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retailerId">Retailer ID (SKU)</Label>
                <Input 
                  id="retailerId" 
                  placeholder="sku-001" 
                  value={formData.retailerId}
                  onChange={(e) => setFormData({...formData, retailerId: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="High-end smartphone with titanium finish..." 
                className="h-24"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="price" 
                    type="number"
                    className="pl-8"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input 
                  id="currency" 
                  placeholder="INR" 
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input 
                  id="brand" 
                  placeholder="Apple" 
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Product Image URL</Label>
              <Input 
                id="imageUrl" 
                placeholder="https://example.com/product.jpg" 
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Product Page URL (Optional)</Label>
              <Input 
                id="url" 
                placeholder="https://yourstore.com/product" 
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProduct}>Save Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCatalogModalOpen} onOpenChange={setIsCatalogModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Meta Catalog</DialogTitle>
            <DialogDescription>
              A catalog contains your list of items you want to sell on WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Catalog Name</Label>
              <Input 
                placeholder="Product_Catalog_2024" 
                value={newCatalogData.name}
                onChange={(e) => setNewCatalogData({...newCatalogData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Catalog Type (Vertical)</Label>
              <select 
                value={newCatalogData.vertical} 
                onChange={(e) => setNewCatalogData({...newCatalogData, vertical: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="COMMERCE">Physical Products</option>
                <option value="SERVICES">Services</option>
                <option value="LODGING">Hotels / Lodging</option>
                <option value="DESTINATION">Travel / Destinations</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCatalogModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCatalog} disabled={!newCatalogData.name}>Create Catalog</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
