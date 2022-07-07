const TeleBot = require('telebot');
//Instancia de axios
const { API_DB, ENDPOINTS_CARTS } = require('@instance');

const { btn, log } = require('utils');
const getInfoProducts = require('f/getInfoProducts.js');
const getInfoProductId = require('f/getInfoProductId');
const areValidNumbers = require('f/areValidNumbers');
const createCart = require('f/createCart');
const addToCart = require('f/addToCart');
const viewCart = require('f/viewCart');
const validateDetails = require('f/validateDetails');
const sendMail = require('f/sendMail');
const deleteProducts = require('f/deleteProducts');
const total = require('f/total');

let TOKEN = process.env.TOKEN_TELEGRAM;

const bot = new TeleBot({
    token: TOKEN,
    usePlugins: ['commandButton', 'askUser']
});

var result = {};

function actualizarDirectorio(result_f) {
    result = result_f;
}

//MOSTRAR MENU PRINCIPAL

bot.on('/start', msg => {

    //Definir los botones de opciones
    let replyMarkup = bot.inlineKeyboard([
        [btn('Show Products 🛍', { callback: '/showProducts' }), btn('Products in cart 🛒', { callback: '/viewCart'}) ],
        [btn('Payment Methods 💰', { callback: '/listPayment' }), btn('Delivery & Schedule ⏰', { callback: '/delivery' })]
    ]);

    let username = msg.chat.first_name;

    let id = msg.from.id;
    ms_id = msg.message_id;
    //Muestra el mensaje al usuario con los botones de opciones
    return bot.sendMessage(id, `<b>Hi ${ username } 👋 🤖!\n\nWelcome to Foo Market 6  🛒.</b>\nWe appreciate your interest in the Company 🏬. You can take a look to our products with the <i>Show Products 🛍</i> option!`, { once: true, parseMode: 'html', replyMarkup });

});

bot.on('/menu', msg => {

    let id = msg.from.id;

    //Definir los botones de opciones
    let replyMarkup = bot.inlineKeyboard([
        [btn('Show Products 🛍', { callback: '/showProducts' }), btn('Products in cart 🛒', { callback: '/viewCart'}) ],
        [btn('Payment Methods 💰', { callback: '/listPayment' }), btn('Delivery & Schedule ⏰', { callback: '/delivery' })]
    ]);

    //Muestra el mensaje al usuario con los botones de opciones
    return bot.sendMessage(id, `<b>Hi again! 👋 🤖</b>\n\nIn Foo Market 6  🛒 we appreciate your interest in the Company 🏬. Take a look to our products with the <i>Show Products 🛍</i> option!`, { parseMode: 'html', replyMarkup, once: true  });

});

//MUESTRA LA LISTA DE PRODUCTOS DE LA DATABASE
bot.on('/showProducts', msg => {

    let id = msg.from.id;

    //Define los botones a mostrar al final de la lista
    let replyMarkup = bot.inlineKeyboard([
        [btn('Next Page 🔜', { callback: '/updatepage' })],
        [btn('Search for a product 🔎', { callback: '/searchProduct' })],
        [btn('Add products to your cart 📥', { callback: '/cart' })],
        [btn('Go Back to menu 🔄', { callback: '/menu' })]
        
    ]);

    // Funcion asincrona que busca los productos
    async function products() {

        try {
            
            // Se crea la variable que almacena la lista de productos de la Database 
            result = await getInfoProducts();

            async function list() {

                try {
                    await bot.sendMessage(id, `<b>LIST OF PRODUCTS 🛍:</b>\n\n${result.part1}`, { parseMode: 'html', replyMarkup, once: true  }).message_id;
                    return result;
                }
                catch (error){
                    log(error)
                }
            } list();

        } 
        
        catch (error) {
            log(error);
        }
        actualizarDirectorio(result);

    } products();
});


bot.on('/updatepage', msg => {


    let id = msg.from.id;
    
    //Define los botones a mostrar al final de la lista
    let replyMarkup = bot.inlineKeyboard([
        [btn('Search for a product 🔎', { callback: '/searchProduct' })],
        [btn('Add products to cart 📥', { callback: '/cart' })],
        [btn('Go Back to menu 🔄', { callback: '/menu' })]
    ]);


    bot.sendMessage(id, `<b>LIST OF PRODUCTS 🛍:</b>\n\n${result.part2}`, { parseMode: 'html', replyMarkup, once: true  });

});

//BUSCAR INFORMACIÓN DE UN PRODUCTO

//El usuario ingresará un id que será pasado al ask.id de abajo
bot.on('/searchProduct', msg => {

    let id = msg.from.id;
    return bot.sendMessage(id, 'Write the specific 🆔 of a product in the list:\n\n<i>Ex: 4</i>', { parseMode: 'html', once: true, ask: 'id' });
});

//Toma lo que responda el usuario después del /searchProduct
bot.on('ask.id', msg => {

    let id = msg.from.id;

    let replyMarkup = bot.inlineKeyboard([
        [ btn('Search another one 🔎', { callback: '/searchProduct' }), btn('Back to menu 🔄', { callback: '/menu' }) ]
    ]);

    //Se hace una validacion primero
    let ID = areValidNumbers(msg.text);

    if(!ID) {
        return bot.sendMessage(id, '❌ Your input is not valid. Please try again!', { once: true, ask: 'id' });
    }

    //Se invoca a la funcion asaincrona
    async function searchProduct() {

        try {
            let message = await getInfoProductId(ID);
            return bot.sendMessage(id, `${message}`, { once: true , parseMode: 'html', replyMarkup, });

        } 
        
        catch (error) {
            log(error);
        }

    } searchProduct();

});

//CREACIÓN DEL CARRITO Y AGREGADO DE PRODUCTOS

bot.on('/cart', msg => {
    
    let id = msg.from.id;

    //Se crea el carrito con el id del usuario
    createCart(id); 

    return bot.sendMessage(id, 'What do you want to add to your Cart? 📥🛒\n\n<i>Send me the 🆔 of your products\nEx: 1, 2, 2, 5, 9</i>', {ask: 'cartprod', once: true, parseMode: 'html'});
});

bot.on('ask.cartprod', function (msg) {

    let replyMarkup = bot.inlineKeyboard([
        [ btn('Add more products 📥', { callback: '/addMore'}) ],
        [ btn('View Cart 🛒', { callback : '/viewCart'}), btn('Back to menu 🔄', { callback: '/menu' })  ]
    ]);

    let id = msg.from.id;
    let text = msg.text; 

    async function addProducts(){
        try {

            let validProducts = areValidNumbers(text);

            if(!validProducts) {
                return bot.sendMessage(id, '❌ Your input is invalid. Please try again.', {ask: 'cartprod'});
            }  
            
            else {
                //Agrega los productos al carrito
                await addToCart(id, validProducts);
                return bot.sendMessage(id, `The products ${text} were added to your Cart!. 🛒\n\n<i>What else can I do for you? 🤖</i>`, { replyMarkup, once: true , parseMode: 'html'});

            }  

        } 
        
        catch (err) {
            log(err)
        }

    }addProducts();

});

//VER CARRITO

bot.on('/viewCart', msg => {

    let replyMarkup = bot.inlineKeyboard([
        [ btn('Add more products 📥', { callback: '/addMore'}), btn('Delete products 📥', { callback: '/deleteProducts'}) ],
        [ btn('Facturar 🧾', { callback: '/facturar'}), btn('Back to menu 🔄', { callback: '/menu' }) ]
    ]);

    let id = msg.from.id;

    async function verCarrito() {

        try {

            let res = await viewCart(id);

            if(res == undefined) {

                replyMarkup = bot.inlineKeyboard([
                    [ btn('Show Products 🛍', { callback: '/showProducts' }), btn('Back to menu 🔄', { callback: '/menu' }) ]
                ]);
                return bot.sendMessage(id, "Sorry, you haven't created a cart yet.❔\n\nTo do so, select the 'Show Products 🛍' option and add products to your cart.", { replyMarkup });
            }
            return bot.sendMessage(id, `<b>YOUR CART 🛒</b>\n\n${ res }`, { replyMarkup, once: true, parseMode: 'html' });

        } 
        
        catch (err) {
            log(err);
        }

    }verCarrito();
   
})

//AGREGAR MÁS PRODUCTOS AL CARRITO UNA VEZ ESTÁ CREADO

bot.on('/addMore', msg => {
    
    let id = msg.from.id;
    return bot.sendMessage(id,'What other products do you want to add to your car? 📥🛒\n\n<i>Send me the 🆔 of your products\nEx: 1, 2, 2, 5, 9</i>', {ask: 'cartprod', once: true, parseMode: 'html'});
});

//VER METODOS DE PAGO

bot.on('/listPayment', msg => {

    
    let replyMarkup = bot.inlineKeyboard([
        [btn("Dollars 💵", { callback : '/cash'}), btn('Bank Transfers 🏦🇺🇸 ', { callback: '/transfers' })],
        [btn('Cryptos 🌐', { callback : '/cryptos'}), btn('Credit / Debit card 💳', { callback : '/card'})],
        [btn('Foreign cash 💱🌎', { callback : '/foreign_cash'}), btn('Back to menu 🔄', { callback : '/menu'})]
    ]);

    let id = msg.from.id;
    return bot.sendMessage(id, '<b>Payment Methods 💰</b>\n\n', { replyMarkup, once: true , parseMode: 'html' });
});

// INFO PARA MONEDAS EXTRANJERAS

bot.on('/foreign_cash', msg => {

    
    let replyMarkup = bot.inlineKeyboard([
        [btn('Back to the Payment Methods 💰', { callback : '/listPayment'})],
        [btn('Back to menu 🔄', { callback : '/menu'})]
    ]);

    let message = '<b>Foreign cash 💱🌎</b>\n\n' +
                  'In Foo Market 6 we are open to accept the following currencies:\n\n' +
                  '<b>1)Euro:</b>  ($) * (0.96) = € 💶\n<b>2)Yen:</b>  ($) * (135.70) = ¥ 💴\n<b>3)Pounds:</b>  ($) * (0.83) = ₤ 💷\n\n' +
                  '<i> There you have the formula to exchange your currency 😉</i>'

    let id = msg.from.id;
    return bot.sendMessage(id, `${ message }`, { replyMarkup, once: true , parseMode: 'html' });
});

// INFO PARA TARJETAS

bot.on('/card', msg => {
       
    let replyMarkup = bot.inlineKeyboard([
        [btn('Back to the Payment Methods 💰', { callback : '/listPayment'})],
        [btn('Back to menu 🔄', { callback : '/menu'})]
    ]);

    let id = msg.from.id;
    return bot.sendMessage(id, `<b>In Foo Market 6 we accept Mastercard/VISA cards 💳!</b>\n\nWe only accept an American or International card`, { replyMarkup, once: true , parseMode: 'html' });
});

// INFO PARA EFECTIVO

bot.on('/cash', msg => {
       
    let replyMarkup = bot.inlineKeyboard([
        [btn('Back to the Payment Methods 💰', { callback : '/listPayment'})],
        [btn('Back to menu 🔄', { callback : '/menu'})]
    ]);

    let id = msg.from.id;
    return bot.sendMessage(id, `<b>Dollars the Universal Currency 💸</b>\n\nYou don't need to transform any prices of our products`, { replyMarkup, once: true , parseMode: 'html' });
});

// INFO PARA TRANSFERENCIAS

bot.on('/transfers', msg => {
       
    let replyMarkup = bot.inlineKeyboard([
        [btn('Back to the Payment Methods 💰', { callback : '/listPayment'})],
        [btn('Back to menu 🔄', { callback : '/menu'})]
    ]);

    let message = '<b>Bank Accounts 🏦</b>\n\n' +
                  '<b>Bank Of America:</b> <i>122000661-XXXXXXXXXXXX</i>\n\n' +
                  '<b>AmerantBank:</b> <i>067010609-XXXXXXXXXXXX</i>\n\n' +
                  '<b>CityBank:</b> <i>380038080-XXXXXXXXXXXX</i>\n\n' +
                  '<b>Wells Fargo:</b> <i>122105278-XXXXXXXXXXXX</i>'

    let id = msg.from.id;
    return bot.sendMessage(id, `${ message }`, { replyMarkup, once: true , parseMode: 'html' });
});

// INFO PARA CRYPTOS

bot.on('/cryptos', msg => {
       
    let replyMarkup = bot.inlineKeyboard([
        [btn('Back to the Payment Methods 💰', { callback : '/listPayment'})],
        [btn('Back to menu 🔄', { callback : '/menu'})]
    ]);

    let message = '<b>Cryptos 🌐</b>\n\n' +
                  'In Foo Market 6 we currently accept JUST BINANCE exchanges:\n\n<b>email:</b> <i>foomarket6@gmail.com</i>\n\nYou can use the following cryptos:\n\n' +
                  `<b>   1)</b> USDT\n<b>   2)</b> ETH\n<b>   3)</b> BTC`

    let id = msg.from.id;
    return bot.sendMessage(id, `${ message }`, { replyMarkup, once: true , parseMode: 'html' });
});


//VER ZONAS DE DELIVERY

bot.on('/delivery', msg => {

    let id = msg.from.id;
    let replyMarkup = bot.inlineKeyboard([
        [btn('Back to menu 🔄', { callback : '/menu'})]
    ]);

    let message = '<b>1) Caracas 🏔:</b>\n <i>Chacao, and El Hatillo</i>\n<b> (6:00 AM - 2:00 AM)</b>\n\n' +
    '<b>2) Zulia ☀️:</b>\n <i>Maracaibo, San Francisco, and Cabimas</i>\n<b> (6:00 AM - 2:00 AM)</b>\n\n' +
    '<b>3) Carabobo 🏭:</b>\n <i>Valencia, Guacara, and San Diego</i>\n<b> (8:00 AM - 12:00 AM)</b>\n\n' +
    '<b>4) Merida ❄️:</b>\n <i>El Vigia, Tovar, and Lagunillas</i>\n<b> (8:00 AM - 10:00 PM)</b>\n\n' +
    '<i>...Soon we will be in Anzoategui ⛵️ and Falcon 🏝!!</i>'

    return bot.sendMessage(id, `<b>Our available delivery zones:</b>\n\n${ message }`, { replyMarkup, once: true , parseMode: 'html' });
});

bot.on('callbackQuery', msg => {
    log('callbackQuery data:', msg.data);
    bot.answerCallbackQuery(msg.id);
});

//FACTURACIÓN

bot.on('/facturar', function (msg) {

    let id = msg.from.id;
    let message = '<b>We need some Special Information ℹ️</b>\n\n' +
                  '<i>- Name 👤\n- Last Name 👤\n- Email 📩\n- Location 📌\n- Payment method 💲</i>\n\nPlease read all the message...\n\n' +
                  'For Location and Payment method, you need to send the number of the list as follow:\n\n' +
                  '<b>Delivery Zones 📍:</b>\n\n1) Caracas 🏔\n2) Zulia ☀️\n3) Carabobo 🏭\n4) Merida ❄️\n\n' +
                  '<b>Payment Methods 💰:</b>\n\n1) Dollars 💵\n2) Bank Transfers 🏦\n3) Cryptos 🌐\n4) Credit / Debit card 💳\n5) Foreign cash 💱🌎\n\n' +
                  '<i>Ex: Foo, Zik, foozik6@foo.com, 1, 4\n\nPay attention to the commas.❕</i>'

    return bot.sendMessage(id, `${ message }`, { parseMode: 'html', once: true, ask: 'userDetails' });

});

bot.on('ask.userDetails', function (msg) {

    let id = msg.from.id;
    let text = msg.text;

    async function userDetails() {

        let details = await validateDetails(text);

        if(!details) {
            return bot.sendMessage(id, "❌ Your input is invalid. Try again, remember the example.\n\n <i>Ex: Foo, Zik, foozik6@foo.com, 1, 4\n\nPay attention to the commas.❕</i>", { parseMode: 'html', once: true, ask: 'userDetails' });
        } 
        
        else {

            try {

                // Se actualizan los datos del usuario
                bot.sendMessage(id, `<i>Getting your information...</i>`, { parseMode: 'html' });
                await API_DB.put(ENDPOINTS_CARTS.PUT_USER_DETAILS+`?userId=${ id }`, details);
                


                // Se hace un condicional si utiliza el metodo de tarjeta                
                if(details[4] == 4 ) {
                    
                    const inlineKeyboard = bot.inlineKeyboard([[bot.inlineButton('Pay with a Card!', {pay: true})]]);

                    let total_amount;
                    
                    // Se toma el monto final del carrito
                    total_amount = await total(id);

                    // Se transforma a numero y se multiplica por 100 (debido a la funcion de payment de Telegram que lo divide entre 100)
                    total_amount = Number(total_amount) * 100;

                    // Se crea el mensaje para el payment (se usa el ejemplo del teleb)
                    bot.sendInvoice(msg.from.id, {
                        title: 'Payment 💳',
                        description: 'Mastercard/VISA card',
                        payload: 'telebot-test-invoice',
                        providerToken: '284685063:TEST:YjNhNDhjODViZGFl',
                        startParameter: 'pay',
                        currency: 'USD',
                        prices: [ { label: 'Total amount', amount: total_amount } ],
                        replyMarkup: inlineKeyboard
                    })

                    bot.on('preShippingQuery', (msg) => {
                        const id = msg.id;
                        const isOk = true;
                        return bot.answerPreCheckoutQuery(id, isOk);
                    });
                
                    bot.on('successfulPayment', (msg) => {
                        let replyMarkup = bot.inlineKeyboard([
                            [btn('Finish and send an email with the invoice ✉️', { callback : '/email'})]
                        ]);
                        return bot.sendMessage(msg.from.id, `Thanks for your purchase, ${msg.from.first_name}!`, { replyMarkup });
                
                    });

                }

                else {

                    let replyMarkup = bot.inlineKeyboard([
                        [btn('Finish and send an email with the invoice ✉️', { callback : '/email'})]
                    ]);
                    return bot.sendMessage(msg.from.id, `Thanks for your purchase, ${msg.from.first_name}!`, { replyMarkup });
                }

            } 
            
            catch (err) {
                log(err)
            }
        }

    }userDetails();

   
    
});

bot.on('/email', msg => {

    let id = msg.from.id;

    async function email() {

        await sendMail(id);

        await API_DB.delete(ENDPOINTS_CARTS.DELETE_CART+`?userId=${ id }`);

    } email();

    return bot.sendMessage(id, 'We sent you an email with the bill.\n\nThanks for choosing us! 🤖💌\n\nIf you want to do another purchase 🛍 send /start ',);
})

bot.on('/deleteProducts', function (msg) {

    let id = msg.from.id;

    return bot.sendMessage(id, 'What products do you want to delete?\n\n<i>Send the 🆔 of your prooducts that you want to delete\nEx: 1, 4, 8, 12</i>', { parseMode: 'html', ask: 'delProduct' });
});

bot.on('ask.delProduct', function (msg) {

    let replyMarkup = bot.inlineKeyboard([
        [ btn('Delete more products 📤', { callback: '/deleteProducts'}) ],
        [ btn('View cart 🛒', { callback : '/viewCart'}), btn('Back to menu 🔄', { callback: '/menu' })  ]
    ]);

    let id = msg.from.id;
    let text = msg.text; 

    //Hace básicamente lo mismo que la función de addProducts
    async function delProduct() {

        try {

            let validProducts = areValidNumbers(text);

            if(!validProducts) {
                return bot.sendMessage(id, '❌ Your input is invalid. Try again.', {ask: 'delProduct'});
            }  else {

                //Agrega los productos al carrito
                await deleteProducts(id, validProducts);

                return bot.sendMessage(id, `Products ${validProducts} were deleted successfully. 📤\n\n<i>What Else can I do for you? 🤖</i>`, { replyMarkup , parseMode: 'html', once: true});

            } 

        } catch (err) {
            log(err)
        }

    }delProduct();
});

bot.connect();
