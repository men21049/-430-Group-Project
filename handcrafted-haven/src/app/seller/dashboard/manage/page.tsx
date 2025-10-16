"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

type Product = {
  product_id: number;
  product_name: string;
  price: number;
  cost: number;
  isactive: boolean;
  stock: number;
  description: string;
  category: string;
  seller_id: number;
  image_path: string;
};

export default function Manage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Fetch seller products
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/seller/products", {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to fetch products");
      }

      const data = await res.json();
      setProducts(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Delete product
  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/seller/products?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to delete product");
      }

      setProducts((prev) => prev.filter((p) => p.product_id !== id));
    } catch (err: any) {
      console.error("Delete error", err);
      alert(err?.message || "Failed to delete product");
    }
  };

  // Toggle product active status
  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/seller/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isactive: !currentStatus }),
        credentials: "include",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to update product");
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.product_id === id ? { ...p, isactive: !currentStatus } : p
        )
      );
    } catch (err: any) {
      console.error("Toggle error", err);
      alert(err?.message || "Failed to update product");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="text-center">
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition transform hover:scale-105 active:scale-95"
        >
          + Add Product
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {showCreateForm && (
        <CreateProductForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            loadProducts();
          }}
        />
      )}

      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            setEditingProduct(null);
            loadProducts();
          }}
        />
      )}

      {products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No products found.</p>
          <p className="text-gray-400">Create your first product to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.product_id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {product.product_name}
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.isactive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.isactive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {product.image_path && (
                <div className="mb-4">
                  <img
                    src={product.image_path}
                    alt={product.product_name}
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Price:</span> ${product.price}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Cost:</span> ${product.cost}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Stock:</span> {product.stock}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Category:</span> {product.category}
                </p>
                {product.description && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Description:</span>{" "}
                    {product.description.length > 100
                      ? `${product.description.substring(0, 100)}...`
                      : product.description}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(product.product_id, product.isactive)}
                  className={`flex-1 px-3 py-2 rounded transition text-sm ${
                    product.isactive
                      ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {product.isactive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.product_id)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Create Product Form Component
function CreateProductForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    product_name: "",
    price: "",
    cost: "",
    stock: "",
    description: "",
    category: "",
    image_path: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/seller/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.product_name,
          price: parseFloat(formData.price),
          description: formData.description,
          category: formData.category,
          image: formData.image_path,
          cost: parseFloat(formData.cost),
          stock: parseInt(formData.stock),
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to create product");
      }

      onSuccess();
    } catch (err: any) {
      alert(err?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Create New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              required
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <input
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={formData.image_path}
              onChange={(e) => setFormData({ ...formData, image_path: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Product Form Component
function EditProductForm({ product, onClose, onSuccess }: { product: Product; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    product_name: product.product_name,
    price: product.price.toString(),
    cost: product.cost.toString(),
    stock: product.stock.toString(),
    description: product.description,
    category: product.category,
    image_path: product.image_path,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/seller/products/${product.product_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.product_name,
          price: parseFloat(formData.price),
          description: formData.description,
          category: formData.category,
          image: formData.image_path,
          cost: parseFloat(formData.cost),
          stock: parseInt(formData.stock),
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to update product");
      }

      onSuccess();
    } catch (err: any) {
      alert(err?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Edit Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              required
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <input
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={formData.image_path}
              onChange={(e) => setFormData({ ...formData, image_path: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}