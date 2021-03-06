var solfege = require('solfegejs');
var zlib = require('zlib');


/**
 * Deglate compression
 */
var Deflate = solfege.util.Class.create(function()
{
}, 'solfege.bundle.compression.Deflate');
var proto = Deflate.prototype;


/**
 * The server middleware
 *
 * @param   {Object}                request     The request
 * @param   {Object}                response    The response
 * @param   {GeneratorFunction}     next        The next function
 * @api public
 */
proto.middleware = function*(request, response, next)
{
    // Handle the next middleware
    yield *next;

    // Check if the content encoding is set
    var contentEncoding = response.getHeader('Content-Encoding');
    if (contentEncoding) {
        return;
    }

    // Check the accept encoding
    var acceptEncoding = request.getHeader('Accept-Encoding');
    if (!acceptEncoding) {
        acceptEncoding = '';
    }
    if (!acceptEncoding.match(/\bdeflate\b/)) {
        return;
    }

    // Compression
    var Stream = require('stream');
    var deflate = zlib.createDeflate();
    if (response.body instanceof Stream) {
        response.body.pipe(deflate);
    } else {
        deflate.end(response.body);
    }
    response.body = deflate;

    // Set the header Content-Encoding
    response.setHeader('Content-Encoding', 'deflate');
};


module.exports = Deflate;
