import mongoose from "mongoose";

mongoose.connect(('mongodb://127.0.0.1:27017/MERN'))

const productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,  
    },
    description: {
        type: String,
        required: true,  
    },
    price:{
        type: Number,
        required: true,
    },
    stock:{
        type: Number,
    },
    rating: {
        type: Number
    }
    
},{timestamps: true});

export const Product = mongoose.model("Product", productSchema);