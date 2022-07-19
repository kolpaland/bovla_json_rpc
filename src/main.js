// JSON-RPC over Websocket implementation
var JSONRPC_TIMEOUT_MS = 1000;

var app = new Vue({
  el: '#app',
  data: {
    ws: null,
    endpoint: 'ws://localhost/websocket.lua',
    timerId: null,
    isConnected: false,
    isDisabled: false,
    stateMessage: "Подключение к серверу через вебсокет",
    typeMsg: "",
    hasError: false,
    pending: {},
    state: {},
    isLoading: false
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
  computed: {
    statePRM: function () {
      if(this.state.result != undefined){
        let type = this.state.result.states > 0 ? "is-success" : "is_danger";
        return type;
      }
      return "is-warning";
    },
    version: function () {
      if(this.state.result != undefined){
        return  this.state.result.sf;
      }
      return "0.0.0.0";
    },
    prms : function() {      
      if(this.state.result != undefined){
        return this.state.result.prm;
      }
    },
    prd: function(){
      if(this.state.result != undefined){
        return this.state.result.prd;
      }
    },
    others: function() {
      if(this.state.result != undefined){
        return [this.state.result.gh, this.state.result.nrz];
      }
    }
  },
  mounted() {
    this.$nextTick(function () {
      this.isConnected = true;
    });
  },
  methods: {
    warning() {
      let self = this;
      this.$buefy.snackbar.open({
          message: self.stateMessage,
          type: 'is-warning',
          position: 'is-top',
          actionText: 'OK',
          indefinite: true,
          onAction: function() {
            self.connect();
          }
      })
    },
    sendCmdToBov(method) { //with no response like notification, so id is null

      let jsoncmd = {
        jsonrpc: "2.0",
        method: method,
        id: undefined //we should use undefined instead null, in lua null is interpretered as a function, not a nil value
      };
      this.send(jsoncmd);
    },
    async sendRequest(id, method) {
      return this.call(id, method);
      // return this.call(id, method)
      //   .then(function (res) {
      //     console.log(JSON.stringify(res));
      //   });
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
      this.isLoading=true;
      console.log("Starting connection to WebSocket Server");
      this.isDisabled = true;
      this.pending = {};
      this.ws = new WebSocket(this.endpoint);

      //for nanomsg use this one
      //this.ws = new WebSocket(this.endpoint, [
        // see the rfc on sp websocket mapping:
        // raw.githubusercontent.com/nanomsg/nanomsg/master/rfc/sp-websocket-mapping-01.txt
       // 'pair.sp.nanomsg.org'
      //]);

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
      this.hasError = false;
      this.stateMessage = "Подключение установлено!";
      this.typeMsg = "is-success";
      this.isDisabled = false;
      this.timerId = setInterval(this.sendRequest, 500, 1, 'get')  
      this.isLoading=false;
    },
    onerrorws(event) {
      if(this.timerId){
        clearInterval(this.timerId);
      }
      this.timerId = null;
      this.stateMessage = "Невозможно подключиться к серверу " + event.target.url;
      this.typeMsg = "is-danger";
      this.isDisabled = false;
      this.hasError = true;
      console.log("Can’t establish a connection to the server at " + event.target.url + "!");
      this.isLoading=false;
      this.warning();

    },
    onclosews(event) {

      console.log("The connection between the client and the server is closed");
      if(this.timerId){
        clearInterval(this.timerId);
      }
      this.timerId = null;
      this.isDisabled = false;
      this.isConnected = false;
      this.ws = null;
      if (!this.hasError) {
        this.stateMessage = "Соединение с сервером прервано, повторное подключение";
        this.typeMsg = "";
        this.hasError = false;
        this.isLoading=true;
        this.warning();
      }
    },
    onmessagews(msg) {
      const frame = JSON.parse(msg.data);

      if (frame.id !== undefined) {
        if (this.pending[frame.id] !== undefined) this.pending[frame.id](frame);  // Resolve
        delete (this.pending[frame.id]);
        this.state = frame;
      } else {
        this.notification(frame);
      }
    }

  }
});