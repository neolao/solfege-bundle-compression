var solfege = require('solfegejs');
var zlib = require('zlib');


/**
 * Gzip compression
 */
var Gzip = solfege.util.Class.create(function()
{
}, 'solfege.bundle.compression.Gzip');
var proto = Gzip.prototype;

/**
 * The Gzip object
 *
 * @type {Gzip}
 * @api private
 */
proto.gzip;

/**
 * Get a gzip object
 *
 * @return  {Gzip}      The gzip instance
 * @api private
 */
proto.getGzip = function()
{
    if (!this.gzip) {
        this.gzip = zlib.createGzip();
    }

    return this.gzip;
};


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
    if (!acceptEncoding.match(/\bgzip\b/)) {
        return;
    }

    // Compression
    var Stream = require('stream');
    var gzip = this.getGzip();
    if (response.body instanceof Stream) {
        response.body.pipe(gzip);
    } else {
        gzip.end(response.body);
    }
    response.body = gzip;

    // Set the header Content-Encoding
    response.setHeader('Content-Encoding', 'gzip');
};


module.exports = Gzip;
