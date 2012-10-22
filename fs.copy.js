/*! fs.copy
 * Copyright(c) 2012 Mihai-Alexandru Potra <mike@mpotra.com>
 * Date: 21 October 2012
 *
 * MIT Licensed
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
 
var fs      = require('fs');
var stream  = require('stream');

var copy = function( src, dst, callback ) {
  var callback = typeof callback == 'function' ? callback : function() {};
  var rs  = null, ws = null;
  if( typeof src == 'string' && typeof dst == 'string' ) {
    rs = fs.createReadStream( src );
    //on source error
    rs.on('error', function(err) {
      callback( err, null ); //return the error
      callback = function(){}; //disable the callback
      if( rs.readable ) { rs.destroy(); } //destroy the read stream
      if( ws && ws.writable ) { ws.destroy(); } //destroy the write stream if any
    });
    //on source open
    rs.on('open', function( rdf ) {
      ws  = fs.createWriteStream( dst );
      //on destination error
      ws.on('error', function(err) {
        callback( err, null ); //return the error
        callback = function() {}; //disable the callback
        if( rs.readable ) { rs.destroy(); } //destroy the read stream
        if( ws.writable ) { ws.destroy(); } //destroy the write stream
      });
      //on destination open
      ws.on('open', function( wdf ) {
        //set up the close listener (copy done, and wdf closed)
        ws.on('close', function() {
          //retrieve the destination stats
          fs.stat( dst, function( err, stats ) {
            callback( err, stats ); //return the destination err/stats
            callback = function(){}; //disable the callback 
            fs.close(rdf); //close the read stream file descriptor
          });
        });
        //pipe the streams
        rs.pipe( ws );
      });
    });
  } else {
    //invalid parameters passed
    callback( ( typeof src != 'string' ? new Error('Source must be a path') : new Error('Destination must be a path') ), null );
  }
}

var copySync  = function( src, dest ) {
}

module.exports      = copy;
module.exports.sync = copySync;