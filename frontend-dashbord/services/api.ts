import axios from "axios"

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_URL_PRODUTOS,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
})
