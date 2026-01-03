const { validationResult } = require('express-validator');
const ProductModel = require('../Models/product.model.js');
const {publishToQueue} = require('../broker/broker.js')
const uploadImage = require('../serviecs/uploadImage.js');

const createProduct = async (req, res) => {
  try {
    // check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
// frontend add here 
    const { title, description, priceAmount, priceCurrency = 'INR', stock=1 } = req.body;

    const seller = req.user && req.user.id;
    if (!seller) {
      return res.status(401).json({ message: 'Unauthorized: seller not found' });
    }

    const price = {
      amount: Number(priceAmount),
      currency: priceCurrency,
    };
    // console.log('the price', req.files);

    // upload images (if any) and collect results
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadImage({ file: file.buffer }));
      // uploadImage returns a promise that resolves to the result from imagekit
      const uploadResults = await Promise.all(uploadPromises);
      images = uploadResults.map((r) => ({ url: r.url, thumbnail: r.thumbnailUrl, id: r.fileId }));
    
    }

    // create and save product
    const product = new ProductModel({
      title,
      description,
      price,
      seller,
      images,
      stock
    });

    const saved = await product.save(); 
    await publishToQueue('PRODUCT_CREATED', saved);
    await publishToQueue('Product_Notification.PRODUCT_CREATED', saved);
    

    return res.status(201).json({ message: 'Product created', product: saved });
  } catch (error) {
    console.log('Error creating product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
const getProducts = async (req, res) => {

  // GET /products?q=phone&miniprice=10000&maxprice=30000&skip=0&limit=10
  const {q ,miniprice,maxprice,skip = 0,limit= 20,  } = req.query; // frontend se ?q=phone aayega
  const filter = {};
   
  if (q){
    filter.$text = { $search: q };  // ese ke liye model create karte waqt index create karna padta hai p-1 product.models.js

  }
  if(miniprice){
    filter['price.amount'] = {...filter['price.amount'], $gte: Number(miniprice) };

  }

  if(maxprice){ 
    filter['price.amount'] = {...filter['price.amount'], $lte: Number(maxprice) };
  }
  const products = await ProductModel.find(filter).skip(Number(skip)).limit(Math.min( Number(limit),20))
  return res.status(200).json({data:products})

}
const getProductById=  async(req,res)=>{

  const {id} = req.params;

  const product = await ProductModel.findById(id);
  if(!product){
    return res.status(404).json({message:'Product not found'})
  }
  return res.status(200).json({product:product})


}

const updateProduct = async (req, res) => {
  try{
    const { id } = req.params;
    const product = await ProductModel.findById({
      _id: id,
      seller: req.user.id // only seller can update his product
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You are not the seller of this product' });
    } 
  

    const  allowabledata = ['title' ,'description','price'];

    for (const key of Object.keys(req.body) ){ // key hae req.body ke andar value may be title,description,price
      // console.log('the key', key);
      if(allowabledata.includes(key)){
        if(key === 'price' && typeof req.body.price ==='object'){
          if(req.body.price.amount !== undefined){
            product.price.amount = Number(req.body.price.amount);
          }
          if(req.body.price.currency !== undefined){
            product.price.currency = req.body.price.currency;
          }

        }
        else{
          product[key]= req.body[key]
        }
      }

    }
  

    // Save updated product

    const updatedProduct = await product.save();
    return res.status(200).json({ message: 'Product updated', product: updatedProduct });

  }catch(error){  
    console.log('Error updating product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

const deleteProduct = async (req, res) => {

  const {id } = req.params; 
  try {
    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You are not the seller of this product' });
    }

    await ProductModel.deleteOne({ _id: id });
    return res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    console.log('Error deleting product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }

}
const getProductsBySeller = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const products = await ProductModel.find({ seller: sellerId });
    return res.status(200).json({ products });
  } catch (error) {
    console.log('Error fetching products by seller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } 

}

module.exports = { createProduct ,getProducts,getProductById ,updateProduct ,deleteProduct , getProductsBySeller}; 