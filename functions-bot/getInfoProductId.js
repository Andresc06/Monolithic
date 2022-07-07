const { API_DB, ENDPOINTS_PRODUCTS } = require('@instance');

async function getInfoProductId (id) {

  try {
    
    let res = await API_DB.get(ENDPOINTS_PRODUCTS.GET_PRODUCTS + `?productId=${ id }`);
    let item = res.data;

    let message = `<b>Showing results:</b>\n\n` +
        `<b>🔑 ID</b>: ${item[0].id}\n\n` +
        `<b>🖋 Name</b>: ${item[0].name}\n\n` +
        `<b>🏷 Price</b>: ${item[0].price} $\n\n` +
        `<b>🗄 Category</b>: ${item[0].category}\n\n` +
        `<b>📃 Description</b>: ${item[0].description}\n\n` +
        `${item[0].image}`;

    return message;
    
  } catch (err) {
    console.log(err);
  }

}

module.exports = getInfoProductId;