const { API_DB, ENDPOINTS_PRODUCTS } = require('@instance');
const { log } = require('@utils');

async function getInfoProducts() {

    try {
        
        let res = await API_DB.get(ENDPOINTS_PRODUCTS.GET_PRODUCTS);
        let items = res.data;
    
        let result = {
            part1: ``,
            part2: ``
        };
        let len = items.length;
        let i = 0;
    
        for (; i < len; i++) {
            //Toma los resultados del fetch y los va iterando
            if(i < 10) {
                if(i < 9) result.part1 += `<b>${items[i].id}- </b>   🏷  ${items[i].name.substring(0, 15)}  - <b>$ ${items[i].price}</b>\n`;
                else result.part1 += `<b>${items[i].id}- </b> 🏷  ${items[i].name.substring(0, 15)}  - <b>$ ${items[i].price}</b>\n`;
            }
            else result.part2 += `<b>${items[i].id}- </b> 🏷  ${items[i].name.substring(0, 15)}  - <b>$ ${items[i].price}</b>\n`;
        }
    
        return result;

    } catch (err) {
        log(err);
    }

}

module.exports = getInfoProducts;