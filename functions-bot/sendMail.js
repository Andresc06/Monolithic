const nodemailer = require('nodemailer')

const { API_DB, ENDPOINTS_CARTS } = require('@instance');

const viewCart = require('./viewCart');

async function sendMail(userId) {

    try {
        
        let res = await API_DB.get(ENDPOINTS_CARTS.GET_CART + `?userId=${userId}`);
        let cart = res.data;
    
        console.log(cart)
    
        let { firstName, lastName, email, location, payment_method } = cart[0].user_details;
    
        let locations = ['Caracas', 'Zulia', 'Carabobo', 'Merida'];
        let pay_methods = ['Dollars', 'Bank Transfers', 'Cryptos', 'Credit / Debit card', 'Foreign cash'];
    
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'equipo7socialoplesk@gmail.com', // generated ethereal user
                pass: 'otggpxhtyarvecmg', // generated ethereal password
            },
        });
    
        let msg = await viewCart(userId);
    
        function date() {
            return new Date().toLocaleDateString();
        }
    
        let info = await transporter.sendMail({
            from: '"Foo Market 6" <equipo7socialoplesk@gmail.com>', // sender address
            to: `${email}, equipo7socialoplesk@gmail.com`, // list of receivers
            subject: "Tu factura de compra en Foo Market 6 ✔", // Subject line
            text: `Gracias por comprar en Foo Market 6!\nAquí tiene su factura:\n\n` +
                  `> Date: ${date()}\n` +
                  `> Nombre: ${firstName}\n` +
                  `> Apellido: ${lastName}\n` +
                  `> Ubicacion: ${locations[location - 1]}\n` +
                  `> Metodo de pago: ${pay_methods[payment_method - 1]}\n\n` +
                  `> Productos:\n\n${msg}` // html body
            },
            function (error) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(null, {
                        statusCode: 200,
                        body: "Ok"
                    });
                } 
            }
        );

    } catch (err) {
        console.log(err);
    }

}


module.exports = sendMail;