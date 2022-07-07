const { API_DB, ENDPOINTS_CARTS } = require("@instance");

async function createCart (userId) {

    try {
      
      //Busca el carrito del usuario
      let res = await API_DB.get(ENDPOINTS_CARTS.GET_CART+`?userId=${ userId }`);
  
      let cart = res.data;
  
      //Si el usuario no tiene carrito, el array vendrá vacío
      if(cart.length == 0) {
          
          await API_DB.post(ENDPOINTS_CARTS.POST_CART+`?userId=${ userId }`)
  
          return console.log('Cart created!');
      } else {
  
          return console.log('You already have a cart!');
      }  
  
    } 
    
    catch (err) {
      console.log(err);
    }
  }
  
  module.exports = createCart;