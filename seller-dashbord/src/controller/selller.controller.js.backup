const UserModel = require("../models/user.models.js")
const ProductModel = require("../models/product.model.js")
const OrderModel = require("../models/order.model.js")
// file ko chaeak karn hae baki hae 
const getMatrics = async (req, res) => {
try{
    const seller = req.user ;
    // Get all products for this seller
        const products = await productModel.find({ seller: seller._id });
        const productIds = products.map(p => p._id);

        // Get all orders containing seller's products
        const orders = await orderModel.find({
            'items.product': { $in: productIds },
            status: { $in: [ "CONFIRMED", "SHIPPED", "DELIVERED" ] }
        });

        const users = await UserModel.find({})
        res.status(200).json({ products, orders, users });

}catch(err){   
    console.log(err)    
   return  res.status(500).json({message:"Internal server error"})
}



}
// getOrder 
const getOrder = async(req,res)=>{
try{
    const seller = req.user
      // Get all products for this seller
    const Products = await ProductModel.find({seller:seller._id})
    const productIds = Products.map(product => product._id)
    
    // Get all orders that include these products
    //{ products: { $in: productIds } }
    //“Find all orders where the products field contains any of the IDs in productIds.”
// products is usually an array of product IDs inside each order document.
// $in is a MongoDB operator that checks if a field’s value matches any value in the provided array

// cheak karn baki hae 
    const orders = await OrderModel.find({products: {$in: productIds}}).populate('products')

    const filteredOrders = orders.map(order => {
        const filteredProducts = order.products.filter(product => productIds.includes(product._id));
        return {
            ...order._doc,
            products: filteredProducts
        };
    });

    return res.status(200).json({orders:filteredOrders})


}catch(err){
    console.log(err)
   return res.status(500).json({message:"Internal Server Error try later "})
}
}
// Product  
const getProducts = async(req, res)=>{
    const seller = req.user
    try{
        const products = await ProductModel.find({seller:seller._id})
        return res.status(200).json({products})

    }catch(err){
        console.log(err)
        return res.status(500).json({message:"Internal Server Error try later "})
    }


}


module.exports = {
    getMatrics,
    getOrder,
    getProducts
}