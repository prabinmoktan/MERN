import mongoose, { Schema } from "mongoose";

// mongoose.connect(('mongodb://127.0.0.1:27017/MERN'))

const productSchema = new Schema({
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
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['Electronics', 'Home Appliances', 'Fashion', 'Health & Beauty', 'Sports & Outdoors'],
    },
    image: {
        type: String,
        required: true,
        default: ''
    }
    
},{timestamps: true});

productSchema.methods.setImage = function(){
    if(File){
      this.image = this.image.path
    }
  }

export const Product = mongoose.model("Product", productSchema);