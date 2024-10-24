const Products = require('../models/products.model');
const Bill = require('../models/bill.model');

// Global map: [ 'user-contact-number', { user_bill_data, user_socket } ]
let users_socket = new Map();
// Similar map: [ 'cart_id', 'user-contact' ]
let cart_users = new Map();

async function socket(io) {
    io.on('connection', (socket) => {
        socket.on('join', async ({ contact, username }) => {
            if (!users_socket.has(contact)) {
                const user_bill = new Bill(contact);
                await user_bill.init();
                users_socket.set(contact, { socket, user_bill });
            }
            socket.emit('message', { status: "success", data: `Welcome ${username}` });
        });

        socket.on('join-cart', ({ contact, cart_id }) => {
            if (!cart_users.has(cart_id)) {
                cart_users.set(cart_id, contact);
            }
        });

        socket.on('deleteItem', async ({ contact, productID }) => {
            const user = users_socket.get(contact);
            if (user) {
                const { user_bill } = user;
                user_bill.items = user_bill.items.filter(item => item.Product_ID !== productID);
                socket.emit('message', { status: "success", data: 'Item deleted' });
                socket.emit('add-items', { status: "success", data: user_bill.items });
            }
        });

        socket.on('get-items', async ({ contact }) => {
            const user = users_socket.get(contact);
            if (user) {
                const { user_bill } = user;
                socket.emit('add-items', { status: "success", data: user_bill.items });
            }
        });

        socket.on('bill', async ({ contact }) => {
            const user = users_socket.get(contact);
            if (user) {
                const { user_bill } = user;
                const res = await user_bill.checkoutBill();
                if (res) {
                    users_socket.delete(contact);
                    socket.emit('message', { status: "success", data: 'Checked out' });
                    user_bill.items = [];
                    socket.emit('redirect', { status: "success", data: { transaction_id: user_bill.transaction_id } });
                } else {
                    socket.emit('message', { status: "error", data: 'Could not check out' });
                }
            }
        });
    });
}

const addProduct = async (req, res) => {
    console.log(req.body);
    const { cart_id, productID, productCode } = req.body;
    const product_data = await Products.getProduct(productID);

    try {
        const contact = cart_users.get(cart_id);
        const user = users_socket.get(contact);

        if (user) {
            const { user_bill, socket } = user;
            const data = await user_bill.addItem({ productCode, ...product_data[0] });

            socket.emit('add-items', { status: "success", data: user_bill.items });
            return res.status(200).json({ status: "success", data: user_bill.items });
        } else {
            return res.status(404).json({ status: "error", message: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
};

const getProducts = async (req, res) => {
    const data = await Bill.generateBills(req.user.contact);
    return res.status(200).json({ data });
};

async function getMostBoughtProductClass(all_user_purchased_products) {
    const all_products = await Products.getProducts();
    let product_buy_count = {};
    all_products.forEach(product => {
        product_buy_count[product.Product_ID] = 0;
    });
    all_user_purchased_products.forEach(product => {
        product_buy_count[product.Product_ID] += 1;
    });
    let max = 0;
    let max_product_id = 0;
    for (let product_id in product_buy_count) {
        if (product_buy_count[product_id] > max) {
            max = product_buy_count[product_id];
            max_product_id = product_id;
        }
    }
    const most_bought = all_products.find(product => product.Product_ID.toString() === max_product_id.toString());
    return most_bought.prod_group;
}

const getSuggestions = async (req, res) => {
    try {
        const all_user_purchased_products = await Bill.getUserPurchasedProducts(req.user.contact);
        const suggestion_group = await getMostBoughtProductClass(all_user_purchased_products)
        console.log(suggestion_group)

        const data = await Products.getProductsByGroup(suggestion_group);

        return res.status(200).json({ data });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ status: "error", message: 'Internal server error, failed to retrive suggestions' });
    }
};

module.exports = { socket, addProduct, getProducts, getSuggestions };