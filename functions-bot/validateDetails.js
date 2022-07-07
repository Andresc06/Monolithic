let yup = require('yup');

let schema = yup.object().shape({
    
    firstName: yup.string().min(3).required(),
    lastName: yup.string().min(3).required(),
    email: yup.string().email().required(),
    location: yup.number().min(1).max(4).required(),
    payment_method: yup.number().min(1).max(5).required(),

});

async function validateDetails(text) {

    let details = text.split(',');
    
    details = details.map(items => items.trim());

    details[3] = Number(details[3]);
    details[4] = Number(details[4]);

    let valid = await schema.isValid({

        firstName: details[0],
        lastName: details[1],
        email: details[2],
        location: details[3],
        payment_method: details[4]

    });

    if(valid) {
        return details;
    } else {
        return false;
    }  

}

module.exports = validateDetails;