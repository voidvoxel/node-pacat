const PACat = require("./PACat");


function pacat (format = 'float32le') {
    return new PACat(format);
}


module.exports = pacat;
