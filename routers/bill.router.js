const router = require('express').Router();

const { addProduct, getProducts, getSuggestions } = require('../controllers/bill.controller');
const { auth_token_user } = require('../utils/auth.util');

router.route('/api/getproducts').get(auth_token_user,getProducts);
router.route('/api/getSuggestions').get(auth_token_user,getSuggestions);

module.exports = router;
