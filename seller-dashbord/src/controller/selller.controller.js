const UserModel = require("../models/user.models.js");
const ProductModel = require("../models/product.model.js");
const OrderModel = require("../models/order.model.js");

// Get dashboard metrics
const getMatrics = async (req, res) => {
    try {
        const seller = req.user;
        
        // Get all products for this seller
        const products = await ProductModel.find({ seller: seller._id });
        const productIds = products.map(p => p._id.toString());

        if (productIds.length === 0) {
            return res.status(200).json({ 
                products: [], 
                orders: [], 
                users: [] 
            });
        }

        // Get all orders containing seller's products
        const orders = await OrderModel.find({
            'items.productId': { $in: productIds },
            status: { $in: ["CONFIRMED", "SHIPPED", "DELIVERED"] }
        }).lean();

        // Filter items to only show seller's products
        const filteredOrders = orders.map(order => {
            const sellerItems = order.items.filter(item => 
                productIds.includes(item.productId.toString())
            );
            return {
                ...order,
                items: sellerItems
            };
        });

        const users = await UserModel.find({});
        
        res.status(200).json({ 
            products, 
            orders: filteredOrders, 
            users 
        });

    } catch (err) {
        console.error('Get metrics error:', err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get seller's orders with pagination
const getOrder = async (req, res) => {
    try {
        const seller = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get all products for this seller
        const products = await ProductModel.find({ seller: seller._id });
        const productIds = products.map(product => product._id.toString());

        if (productIds.length === 0) {
            return res.status(200).json({ 
                orders: [], 
                meta: { 
                    total: 0, 
                    page, 
                    limit,
                    totalPages: 0
                } 
            });
        }

        // Find all orders that contain at least one of the seller's products
        const orders = await OrderModel.find({
            'items.productId': { $in: productIds }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

        // Get total count for pagination
        const totalOrders = await OrderModel.countDocuments({
            'items.productId': { $in: productIds }
        });

        // Filter items to only include seller's products and populate product details
        const filteredOrders = await Promise.all(orders.map(async (order) => {
            const sellerItems = order.items.filter(item => 
                productIds.includes(item.productId.toString())
            );

            // Populate product details for each item
            const itemsWithDetails = await Promise.all(sellerItems.map(async (item) => {
                const product = await ProductModel.findById(item.productId);
                return {
                    ...item,
                    productDetails: product ? {
                        title: product.title,
                        description: product.description,
                        images: product.images,
                        stock: product.stock
                    } : null
                };
            }));

            return {
                ...order,
                items: itemsWithDetails
            };
        }));

        return res.status(200).json({
            orders: filteredOrders,
            meta: {
                total: totalOrders,
                page,
                limit,
                totalPages: Math.ceil(totalOrders / limit)
            }
        });

    } catch (err) {
        console.error('Get orders error:', err);
        return res.status(500).json({ message: "Internal Server Error. Please try later." });
    }
};

// Get seller's products
const getProducts = async (req, res) => {
    try {
        const seller = req.user;
        const products = await ProductModel.find({ seller: seller._id }).sort({ createdAt: -1 });
        
        return res.status(200).json({ products });

    } catch (err) {
        console.error('Get products error:', err);
        return res.status(500).json({ message: "Internal Server Error. Please try later." });
    }
};

// Update order status (new function for seller to manage orders)
const updateOrderStatus = async (req, res) => {
    try {
        const seller = req.user;
        const { orderId } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid order status" });
        }

        // Find the order
        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Verify seller owns at least one product in this order
        const sellerProducts = await ProductModel.find({ seller: seller._id });
        const sellerProductIds = sellerProducts.map(p => p._id.toString());
        
        const hasSellerProduct = order.items.some(item => 
            sellerProductIds.includes(item.productId.toString())
        );

        if (!hasSellerProduct) {
            return res.status(403).json({ message: "You don't have permission to update this order" });
        }

        // Update order status
        order.status = status;
        await order.save();

        return res.status(200).json({ 
            message: "Order status updated successfully",
            order 
        });

    } catch (err) {
        console.error('Update order status error:', err);
        return res.status(500).json({ message: "Internal Server Error. Please try later." });
    }
};

// Get single order details
const getOrderById = async (req, res) => {
    try {
        const seller = req.user;
        const { orderId } = req.params;

        // Find the order
        const order = await OrderModel.findById(orderId).lean();
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Verify seller owns at least one product in this order
        const sellerProducts = await ProductModel.find({ seller: seller._id });
        const sellerProductIds = sellerProducts.map(p => p._id.toString());
        
        const sellerItems = order.items.filter(item => 
            sellerProductIds.includes(item.productId.toString())
        );

        if (sellerItems.length === 0) {
            return res.status(403).json({ message: "You don't have permission to view this order" });
        }

        // Populate product details
        const itemsWithDetails = await Promise.all(sellerItems.map(async (item) => {
            const product = await ProductModel.findById(item.productId);
            return {
                ...item,
                productDetails: product ? {
                    title: product.title,
                    description: product.description,
                    images: product.images,
                    stock: product.stock
                } : null
            };
        }));

        return res.status(200).json({
            order: {
                ...order,
                items: itemsWithDetails
            }
        });

    } catch (err) {
        console.error('Get order by ID error:', err);
        return res.status(500).json({ message: "Internal Server Error. Please try later." });
    }
};

module.exports = {
    getMatrics,
    getOrder,
    getProducts,
    updateOrderStatus,
    getOrderById
};
