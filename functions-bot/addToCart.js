const { API_DB, ENDPOINTS_CARTS } = require('@instance');

async function addMoreToCart(userId, userProducts) {

    try {
        
        let res = await API_DB.get(ENDPOINTS_CARTS.GET_CART+`?userId=${ userId }`);
        //Busca el carrito del usuario

        let cart = res.data;

        let arr = []

        //Crea un array de los id de los productos existentes en el carrito
        arr = cart[0].products.map(e => {return e.productId})

        //Remueve los ids repetidos de los productos nuevos ingresados por el usuario
        let filteredProducts = userProducts.filter((e, idx) => {
            return userProducts.indexOf(e) == idx;
        })

        //Devuelve los ids diferentes entre los dos arrays
        filteredProducts = filteredProducts.filter(e => !arr.includes(e));

        let len = filteredProducts.length;
        //Toma la longitud del array filtrado

        for(let i = 0; i < len; i++) {
            cart[0].products.push({
                productId: filteredProducts[i],
                quantity: 0
            });
        }
        //Si hay algún id nuevo, lo agrega al array de productos del carrito

        let cartLen = cart[0].products.length;
        //Toma la cantidad de productos del carrito

        let userLen = userProducts.length;
        //Toma la longitud del array de productos nuevos que quiere agregar el usuario

        for(let i = 0; i < cartLen; i++) {
            for(let j = 0; j < userLen; j++) {
                if(cart[0].products[i].productId == userProducts[j]) {

                    cart[0].products[i].quantity++;
                } 
            }
        }
        //Va a iterar sobre cada producto del carrito
        //Luego va a iterar sobre cada id de los que el usuario quiere agregar
        //Si encuentra una coincidencia entre los id, le sumará a la cantidad

        await API_DB.put(ENDPOINTS_CARTS.PUT_PRODUCTS_CART+`?userId=${ userId }`, cart[0].products);
        //Actualiza la base de datos

    } catch (err) {
        console.log(err);
    }

};

module.exports = addMoreToCart;