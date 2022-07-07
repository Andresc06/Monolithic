const { API_DB, ENDPOINTS_CARTS } = require('@instance');

async function deleteProducts(userId, userProducts) {

    //La función recibe como parámetros el id del usuario y un array validado con anterioridad de los productos que se desean eliminar

    try {

        let filteredUP = userProducts.filter((e, idx) => {
            return userProducts.indexOf(e) == idx;
        })

        //En caso de que el mensaje del usuario tenga ids de productos repetidos, los quita y devuelve los originales
        //Ej: 
        //Usuario ingresa: [1, 1, 2, 3, 2, 9, 9]
        //
        //filteredUP = [1, 2, 3, 9]

        await API_DB.put(ENDPOINTS_CARTS.DELETE_PRODUCTS_CART+`?userId=${ userId }`, filteredUP);

        return console.log('Productos eliminados con éxito');

    } catch (err) {
        console.log(err);
    }
}


module.exports = deleteProducts;