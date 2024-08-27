import express from 'express';
import cors from 'cors';
import { Product } from './src/models/product.js';

const app = express();
app.use(cors());

app.get('/api/data',(req,res)=>{
    res.json({id:1,name:'Prabin',age: '22'});
})

app.post('/admin/product',async(req,res)=> {
    const {title, description, stock, price, rating} = req.body;
   const createdProd = await Product.create({
    title,
    description,
    price,
    rating,
    stock
   });
   console.log(createdProd)
})
app.get('/', (req,res)=>(
    res.send('hello')
))

const port = process.env.PORT || 8000;
app.listen(port,()=>(
    console.log(`server is running on http://localhost:${port}`)
))