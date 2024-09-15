import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { uploadOnCloudinary } from "../service/cloudinary.js";

const createProduct = async (req, res) => {
  const { title, description, price, category, stock, rating } = req.body;
 

  if (
    [title, description, category].some(
      (field) => !field || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All Fields are required");
  }

  const imagePath = req.files?.image[0]?.path;
  const productImage = await uploadOnCloudinary(imagePath);

  const product = await Product.create({
    title,
    description,
    price,
    category,
    rating,
    stock,
    image: productImage?.url || "",
  });
  const createdProduct = await Product.findById(product._id);
  if (!createdProduct) {
    throw new ApiError(401, "Something went while creating product");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, createdProduct, "Product list is created"));
};

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  if (!products) {
    throw new ApiError(401, "theres no product yet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

const getProductById = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, product, "Product by Id fetched"));
  } catch (error) {
    throw new ApiError(401, "something went wrong while fetching product id");
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findByIdAndDelete(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, product, "product deleted successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { title, price, description, stock, category } = req.body;
  const imageLocalPath = req.files['image'][0].path;
  console.log('imageLocalPath===>', imageLocalPath)
  if(!imageLocalPath){
    throw new ApiError(401, "image is required");
  }
  const image = await uploadOnCloudinary(imageLocalPath);
  console.log('image ===>', image)
  console.log('requestBody====>',req.body);
  if(!image.url){
    throw new ApiError(401, "image upload failed");
  }
  if (
    [title, description, category, price, stock].some(
      (field) => !field || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All Fields are required");
  }
  
    const product = await Product.findByIdAndUpdate(
      req.product?.id,
      {
        $set: {
          title,
          price,
          description,
          stock,
          category,
          image: image?.url
        },
      },
      { new: true }
    );
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, product, "Product updated successfully"));
 
});
export {
  createProduct,
  getProductById,
  getProducts,
  deleteProduct,
  updateProduct,
};
