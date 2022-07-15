// JSON-RPC over Websocket implementation
var JSONRPC_TIMEOUT_MS = 1000;

var app = new Vue({
  el: '#app',
  data: {
    version: '0.0.0.0',
    ws: null,
    endpoint: 'ws://127.0.0.1:64999',
    isConnected: false,
    isDisabled: false,
    stateMessage: "Подключение к серверу через вебсокет",
    typeMsg: "",
    hasError: false,
    pending: {}
  },
  watch: {
    isConnected: function (val) {
      if (val) {
        this.connect();
      }
      else {
        this.disconnect();
      };
    }
  },
  methods: {
    sendCmdToBov(method) { //with no response like notification, so id is null

      let jsoncmd = {
        jsonrpc: "2.0",
        method: method,
        id: null
      };
      console.log(JSON.stringify(jsoncmd));
      this.send(jsoncmd);
    },
    async sendRequest(id, method) {

      return this.call(id, method)
        .then(function (res) {
          console.log(JSON.stringify(res));
        });
    },
    call(id, method) {
      if (!this.ws) {
        console.log('No connected socket to send message');
        return;
      }
      const request = { jsonrpc: "2.0", method, id};
      this.ws.send(JSON.stringify(request));

      var self = this;
      return new Promise(function (resolve, reject) {
        
        setTimeout(JSONRPC_TIMEOUT_MS, function () {
          if (self.pending[id] === undefined) return;
          console.log('Timing out frame ' + JSON.stringify(request));
          delete (self.pending[id]);
          reject();
        });
        self.pending[id] = x => resolve(x);

      });
    },
    notification(msg) {
      console.log('NOTIFICATION: ' + JSON.stringify(msg));
    },
    connect() {

      if (this.ws) {
        console.log("Connection has been established before");
        return;
      }
      console.log("Starting connection to WebSocket Server");
      this.isDisabled = true;
      this.pending = {};
      this.ws = new WebSocket(this.endpoint, [
        // see the rfc on sp websocket mapping:
        // raw.githubusercontent.com/nanomsg/nanomsg/master/rfc/sp-websocket-mapping-01.txt
        'pair.sp.nanomsg.org'
      ]);
      if (!this.ws) {
        console.log("Cannot to connect");
        this.isConnected = false;
        return;
      }

      this.typeMsg = "is-warning";
      this.stateMessage = "Идет подключение к серверу через вебсокет...";
      this.ws.onmessage = this.onmessagews;
      this.ws.onopen = this.onopenws;
      this.ws.onclose = this.onclosews;
      this.ws.onerror = this.onerrorws;

    },
    disconnect() {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    },
    send(jsoncmd) {
      if (this.ws) {
        this.ws.send(JSON.stringify(jsoncmd));
      }
    },
    onopenws(event) {
      console.log("Connection is established!")
      hasError = false;
      this.stateMessage = "Подключение установлено!";
      this.typeMsg = "is-success";
      this.isDisabled = false;
    },
    onerrorws(event) {

      this.stateMessage = "Невозможно подключиться к серверу " + event.target.url;
      this.typeMsg = "is-danger";
      this.isDisabled = false;
      hasError = true;
      console.log("Can’t establish a connection to the server at " + event.target.url + "!");
    },
    onclosews(event) {

      console.log("The connection between the client and the server is closed");

      this.isDisabled = false;
      this.isConnected = false;
      this.ws = null;
      if (!hasError) {
        this.stateMessage = "Подключение к серверу через вебсокет";
        this.typeMsg = "";
        hasError = false;
      }
    },
    onmessagews(msg) {
      console.log("Receive message: " + msg);
      const reader = new FileReader();
      let self = this;
      reader.addEventListener('loadend', function () {
        const frame = JSON.parse(reader.result);
        console.log(frame);
        if (frame.id !== undefined) {
          if (self.pending[frame.id] !== undefined) self.pending[frame.id](frame);  // Resolve
          delete (self.pending[frame.id]);
        } else {
          self.notification(frame);
        }

      });
      reader.readAsText(msg.data);
    }

  }
});