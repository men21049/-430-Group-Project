"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/ui/landing-page/header";

import CallToAction from "@/app/ui/landing-page/cta-section";
import WithAuth from "@/app/components/withAuth";

function AddProductForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "adding" | "success" | "error">(
    "idle"
  );
  const [serverError, setServerError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!name || !price || !category || !image) {
      alert("Please fill in all required fields and choose an image.");
      return;
    }

    setStatus("adding");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("cost", cost || "0");
      formData.append("stock", stock || "0");
      formData.append("description", description);
      formData.append("category", category);
      formData.append("image", image);

      const res = await fetch("/api/seller/products/upload", {
        method: "POST",
        body: formData,
        credentials: "include", // send cookies/token
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => router.push("/seller/products"), 900);
      } else {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          setServerError(json?.error || text);
        } catch {
          setServerError(text);
        }
        setStatus("error");
      }
    } catch (err: any) {
      setServerError(err?.message || String(err));
      setStatus("error");
    }
  };

  const renderButtonText = () => {
    switch (status) {
      case "adding":
        return "Adding...";
      case "success":
        return "Added!";
      case "error":
        return "Failed! Try Again";
      default:
        return "Add Product";
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          encType="multipart/form-data"
        >
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border p-2 rounded"
            required
            step="0.01"
          />
          <input
            type="number"
            placeholder="Cost (optional)"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="border p-2 rounded"
            step="0.01"
          />
          <input
            type="number"
            placeholder="Stock (optional)"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="border p-2 rounded"
            min="0"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded"
            rows={3}
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border p-2 rounded"
            required
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-40 h-40 object-cover rounded border"
            />
          )}
          {serverError && <p className="text-red-600 text-sm">{serverError}</p>}
          <button
            type="submit"
            disabled={status === "adding" || status === "success"}
            className={`px-4 py-2 text-white rounded transition transform hover:scale-105 active:scale-95
              ${
                status === "adding"
                  ? "bg-gray-500 cursor-not-allowed"
                  : status === "success"
                  ? "bg-green-700"
                  : status === "error"
                  ? "bg-red-600"
                  : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {renderButtonText()}
          </button>
        </form>
      </div>
      <CallToAction />
    </>
  );
}

export default function AddProductPage() {
  return (
    <WithAuth role="SELLER">
      <AddProductForm />
    </WithAuth>
  );
}
