import { Product } from "./definitions";

export async function getFakeProducts() {

    try {
        const res = await fetch("https://fakestoreapi.com/products");
        if (!res.ok) {
            throw new Error("Failed to fetch data");
        }
        const data: Product[] = await res.json();
        //There is up to 20 pictures coming from this api, so we only return the first 10 (change it if you need to)
        return data
    } catch (error) {
        console.error("Error fetching data:", error);
        throw new Error("Failed to fetch data");
    }
}