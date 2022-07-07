function areValidNumbers (text) {

    let result = text.split(',');

    result = result.map(e => Number(e));

    if(result.some(n => !n || n < 1 || n > 20 )){

        return false;
    } 
    
    else {
        return result;
    }
}

module.exports = areValidNumbers;