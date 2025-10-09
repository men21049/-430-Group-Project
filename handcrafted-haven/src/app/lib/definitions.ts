export type Product = {
    id: number
    name: string
    price: number
    category: string[]
    description: string
    image: string
    sellerId: string
    active: boolean
    rating: {
        rate: number
        count: number
    }
}