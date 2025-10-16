import Link from "next/link"
import CallToAction from "@/app/ui/landing-page/cta-section";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

    return(
        <div>
            <div className="max-w-7xl mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">Manage Products</h1>
                <p className="mb-6">Create, update, or delete your products here.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link 
                        href="manage/create" 
                        className="bg-gray-100 hover:bg-gray-200 p-6 rounded-lg text-center transition-colors duration-200"
                    >
                        <div className="text-4xl mb-4">➕</div>
                        <h3 className="text-xl font-semibold mb-2">Create New Product</h3>
                        <p className="text-gray-600">Add a new product to your store</p>
                    </Link>
                    
                    <Link 
                        href="manage/update" 
                        className="bg-gray-100 hover:bg-gray-200 p-6 rounded-lg text-center transition-colors duration-200"
                    >
                        <div className="text-4xl mb-4">✏️</div>
                        <h3 className="text-xl font-semibold mb-2">Update Product</h3>
                        <p className="text-gray-600">Edit existing product information</p>
                    </Link>
                    
                    <Link 
                        href="manage/delete" 
                        className="bg-gray-100 hover:bg-gray-200 p-6 rounded-lg text-center transition-colors duration-200"
                    >
                        <div className="text-4xl mb-4">🗑️</div>
                        <h3 className="text-xl font-semibold mb-2">Delete Product</h3>
                        <p className="text-gray-600">Remove products from your store</p>
                    </Link>
                </div>
            </div>
            <CallToAction />
        </div>
    )
}