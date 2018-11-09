/* global wx */

class WebSocket {
  constructor(uri, protocols, opts) {
    wx.onSocketOpen(this.handleSocketOpen.bind(this));
    wx.onSocketClose(this.handleSocketClose.bind(this));
    wx.onSocketMessage(this.handleMessage.bind(this));
    wx.onSocketError(this.handleSocketError.bind(this));
    wx.connectSocket({ url: uri });
  }
  handleSocketOpenLater(res) {
    if (this.handleSocketOpenLaterHandler) {
      clearTimeout(this.handleSocketOpenLaterHandler);
    }

    this.handleSocketOpenLaterHandler = setTimeout(() => {
      this.handleSocketOpen(res);
    }, 1000);
  }
  handleSocketOpen(res) {
    if (this.onopen) {
      this.onopen(res);
    } else {
      this.handleSocketOpenLater(res);
    }
  }
  handleMessage(res) {
    if (this.onmessage) {
      this.onmessage(res);
    } else {
      this.handleMessageLater(res);
    }
  }
  handleMessageLater(res) {
    if (this.handleMessageLaterHandler) {
      clearTimeout(this.handleMessageLaterHandler);
    }

    this.handleMessageLaterHandler = setTimeout(() => {
      this.handleMessage(res);
    }, 1000);
  }

  handleSocketError(res) {
    if (this.onerror) {
      this.onerror(res);
    } else {
      this.handleSocketErrorLater(res);
    }
  }
  handleSocketErrorLater(res) {
    if (this.handleSocketErrorLaterHandler) {
      clearTimeout(this.handleSocketErrorLaterHandler);
    }

    this.handleSocketErrorLaterHandler = setTimeout(() => {
      this.handleSocketError(res);
    }, 1000);
  }
  handleSocketClose(res) {
    if (this.onclose) {
      this.onclose(res);
    } else {
      this.handleSocketCloseLater(res);
    }
  }
  handleSocketCloseLater(res) {
    if (this.handleSocketCloseLaterHandler) {
      clearTimeout(this.handleSocketCloseLaterHandler);
    }

    this.handleSocketCloseLaterHandler = setTimeout(() => {
      this.handleSocketClose(res);
    });
  }
  send(data) {
    wx.sendSocketMessage({
      data, fail(res) {
        console.log('wx web socket send failed: ' + res);
      }
    });
  }
  close() {
    wx.closeSocket();
  }
}

global.WebSocket = WebSocket;

const SCClientSocket = require('socketcluster-client/lib/scclientsocket');

const scErrors = require('sc-errors');

const InvalidArgumentsError = scErrors.InvalidArgumentsError;

const _clients = {};

function getMultiplexId(options) {
  const protocolPrefix = options.secure ? 'https://' : 'http://';
  let queryString = '';
  if (options.query) {
    if (typeof options.query === 'string') {
      queryString = options.query;
    } else {
      const queryArray = [];
      const queryMap = options.query;
      for (let key in queryMap) {
        if (queryMap.hasOwnProperty(key)) {
          queryArray.push(key + '=' + queryMap[key]);
        }
      }
      if (queryArray.length) {
        queryString = '?' + queryArray.join('&');
      }
    }
  }
  let host;
  if (options.host) {
    host = options.host;
  } else {
    host = options.hostname + ':' + options.port;
  }
  return protocolPrefix + host + options.path + queryString;
}

function create(options = {}) {

  if (options.host && !options.host.match(/[^:]+:\d{2,5}/)) {
    throw new InvalidArgumentsError('The host option should include both' +
      ' the hostname and the port number in the format "hostname:port"');
  }

  if (options.host && options.hostname) {
    throw new InvalidArgumentsError('The host option should already include' +
      ' the hostname and the port number in the format "hostname:port"' +
      ' - Because of this, you should never use host and hostname options together');
  }

  if (options.host && options.port) {
    throw new InvalidArgumentsError('The host option should already include' +
      ' the hostname and the port number in the format "hostname:port"' +
      ' - Because of this, you should never use host and port options together');
  }

  const opts = {
    port: options.port,
    hostname: 'localhost',
    path: '/socketcluster/',
    secure: false,
    autoConnect: true,
    autoReconnect: true,
    autoSubscribeOnConnect: true,
    connectTimeout: 20000,
    ackTimeout: 10000,
    timestampRequests: false,
    timestampParam: 't',
    authEngine: null,
    authTokenName: 'socketCluster.authToken',
    binaryType: 'arraybuffer',
    multiplex: true,
    pubSubBatchDuration: null,
    cloneData: false
  };
  for (let i in options) {
    if (options.hasOwnProperty(i)) {
      opts[i] = options[i];
    }
  }
  opts.clientMap = _clients;
  opts.clientId = getMultiplexId(opts);

  if (_clients[opts.clientId]) {
    if (opts.autoConnect) {
      _clients[opts.clientId].connect();
    }
  } else {
    _clients[opts.clientId] = new SCClientSocket(opts);
  }
  return _clients[opts.clientId];
}

function destroy(socket) {
  socket.destroy();
}

module.exports.factory = {
  create,
  destroy,
  clients: _clients
};
module.exports.SCClientSocket = SCClientSocket;

module.exports.Emitter = require('component-emitter');

module.exports.create = function (options) {
  return create(options);
};

module.exports.connect = module.exports.create;

module.exports.destroy = function (socket) {
  return destroy(socket);
};

module.exports.clients = _clients;
