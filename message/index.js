/******************************************************************************
Copyright (c) 2015, Intel Corporation

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of Intel Corporation nor the names of its contributors
      may be used to endorse or promote products derived from this software
      without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*****************************************************************************/
/**
 * Message Module
 * @module message
 */

var _ = require("lodash");
var B = require("hope-base");

//----------------------------------------------------------------
// Get all port impls registered first
//----------------------------------------------------------------
var Port = require("./lib/port");

function register_port_impl_file(impl_name, file_path) {
  var impl = require(file_path);
  ["accept", "subscribe", "send", "publish"].forEach(function(type) {
    if (_.isFunction(impl[type])) {
      Port.register_impl(type, impl_name, impl[type]);
    }
  });
}

B.fs.ls(B.path.dir(module.filename) + "/lib/impl_ports")
  .files(".js").each(function(name, fp, base) {
    register_port_impl_file(base, fp);
  });



var MNode = require("./lib/mnode");
var Route = require("./lib/router");
var RouteTable = require("./lib/route_table");
var RouteRule = require("./lib/route_rule");


exports.create_mnode = MNode.create;

exports.create_router = Route.create;

exports.create_route_rule = RouteRule.create;

exports.create_route_table = RouteTable.create;

exports.create_port = Port.create;

exports.port_types = ["accept", "send", "subscribe", "publish"];

var impls = 
exports.impls = {};

B.fs.ls(B.path.dir(module.filename) + "/lib/impl_deps")
  .files(".js").each(function(name, fp, base) {
    impls[base] = require(fp);
  });




exports.$factories = {
  MNode:  exports.create_mnode,
  Router:  exports.create_router,
  RouteRule: exports.create_route_rule,
  RouteTable: exports.create_route_table,
  Port: exports.create_port
};

// Add factories from impls
// e.g. http/broker
_.forOwn(impls, function(impl, impl_name) {
  // add the prefix
  _.forOwn(impl.$factories || {}, function(_f, _n) {
    exports.$factories[impl_name + "/" + _n] = _f;
  });
});