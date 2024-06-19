//this code creates a wrapper function that turns any function (fn) into middleware for Express.js. 


module.exports = (fn) => {
    return ( req, res, next) => {
        fn( req, res, next).catch(next);
    };
};