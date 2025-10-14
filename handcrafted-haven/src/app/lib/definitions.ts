export type Product = {
    product_id: number
    product_name: string,
    price: number,
    cost:number,
    isactive:boolean,
    stock:number, 
    description: string,
    category: string,
    seller_id: number,
    image_path: string
    }

export type Category ={
    category: string
}