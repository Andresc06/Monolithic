let { API_DB, ENDPOINTS_CARTS } = require('@instance');

async function total(userId) {

    try {

        let cartRes = await API_DB.get(ENDPOINTS_CARTS.GET_CART+`?userId=${ userId }`);
        let cart = cartRes.data;
        let t_amount = cart[0].total_amount;
        return t_amount;
    }

    catch (err) {
        console.log(err);
    }
};

module.exports = total;