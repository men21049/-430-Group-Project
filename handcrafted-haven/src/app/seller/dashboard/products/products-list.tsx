import {getAllSellerProducts} from "../../../lib/data";
import ToggleSwitch from "@/app/ui/dashboard/toggle-switch";
import Image from "next/image";

export default async function ProductsList({id}: {id: string}) {

    //seller1 is the logged in seller, should be replaced with the actual logged in seller's ID
    const products = await getAllSellerProducts(id);
    console.log(products);
    return (
        <>
            <ul className="flex flex-col gap-4">
                {
                    products.map((product) => (
                        <li key={product.product_id} className="flex flex-col gap-2 bg-gray-100 p-3 rounded-md ">
                            <h3 className="text-md font-semibold">{product.product_name}</h3>
                            <p>{product.description}</p>
                            <p className="text-sm font-semibold">{product.price}</p>
                            <Image src={product.image_path} alt={product.product_name} width={100} height={100} className="m-auto"/>
                            <div className="flex justify-center bg-white p-4 rounded-md">
                                <ToggleSwitch/>
                            </div>
                        </li>
                    
                    ))
                }
            </ul>
        </>
    );
}