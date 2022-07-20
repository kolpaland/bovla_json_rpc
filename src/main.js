// JSON-RPC over Websocket implementation
var JSONRPC_TIMEOUT_MS = 1000;
const STATES_HAS_DATA_VALUE = "0";
const BIT_NO_DATA_PRD1 = 7; 
const BIT_NO_DATA_PRD2 = 6;
const BIT_NO_DATA_PRM1 = 5; 
const BIT_NO_DATA_PRM2 = 4;
const BIT_NO_DATA_PRM3 = 3;
const BIT_NO_DATA_GH = 2;
const BIT_NO_DATA_NRZ = 1;
const BIT_NO_DATA_UPR_PRM = 0;

var app = new Vue({
  el: '#app',
  data: {
    ws: null,
    endpoint: 'ws://bovla/websocket.lua',
    timerRequestId: null,
    pending: {},
    state: {},
    isLoading: false
  },
  computed: {
    prmdata: function(){
      return [
        { 'id': 1, 'name': 'ПРМ'}
      ]
    },
    hasPRMData: function () {
      if(this.state.result != undefined){        
        return this.state.result.states.toString(2)[BIT_NO_DATA_UPR_PRM] === STATES_HAS_DATA_VALUE ;
      }
      return false;
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
    statesprm: function(){
      if(this.state.result != undefined){   
        let statesBits = this.state.result.states.toString(2);    
        return [ 
          statesBits[BIT_NO_DATA_PRM1] === STATES_HAS_DATA_VALUE,
          statesBits[BIT_NO_DATA_PRM2] === STATES_HAS_DATA_VALUE,
          statesBits[BIT_NO_DATA_PRM3] === STATES_HAS_DATA_VALUE
        ];
      }
    },
    prd: function(){
      if(this.state.result != undefined){
        return this.state.result.prd;
      }
    },
    statesprd: function(){
      if(this.state.result != undefined){   
        let statesBits = this.state.result.states.toString(2);    
        return [ 
          statesBits[BIT_NO_DATA_PRD1] === STATES_HAS_DATA_VALUE,
          statesBits[BIT_NO_DATA_PRD2] === STATES_HAS_DATA_VALUE
        ];
      }
    },
    others: function() {
      if(this.state.result != undefined){
        return [this.state.result.gh, this.state.result.nrz];
      }
    },
    statesOthers: function(){
      if(this.state.result != undefined){   
        let statesBits = this.state.result.states.toString(2);    
        return [ 
          statesBits[BIT_NO_DATA_GH] === STATES_HAS_DATA_VALUE,
          statesBits[BIT_NO_DATA_NRZ] === STATES_HAS_DATA_VALUE
        ];
      }
    },
  },
  mounted() {
    this.$nextTick(function () {
      this.connect();
    });
  },
  methods: {
    swupdate(){ 
        let url = window.location.href;        
        let arr = url.split("/");        
        let address = arr[2].split(":");        
        window.location.href = arr[0] + "//" + address[0] + ":8080"      
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
      if(this.ws)
      {
        console.log("Connection to WebSocket Server was established before.");
        return;
      }

      console.log("Starting connection to WebSocket Server");

      this.isLoading=true;      
      this.pending = {};
      this.ws = new WebSocket(this.endpoint);

      //for nanomsg use this one
      //this.ws = new WebSocket(this.endpoint, [
        // see the rfc on sp websocket mapping:
        // raw.githubusercontent.com/nanomsg/nanomsg/master/rfc/sp-websocket-mapping-01.txt
       // 'pair.sp.nanomsg.org'
      //]);

      if (!this.ws) {
        console.log("Cannot connect to server, ws = " + this.ws);
        return;
      }

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
      
      this.isLoading=false;
      this.timerRequestId = setInterval(this.sendRequest, 500, 1, 'get');
   
    },
    onerrorws(event) {
      console.log("Can’t establish a connection to the server at " + event.target.url + "!"); 
    },
    onclosews(event) {
      console.log("The connection between the client and the server is closed");

      if(this.timerRequestId){
        clearInterval(this.timerRequestId);
        this.timerRequestId = null;
      }
      this.state = {};
      this.isLoading=true;
      this.ws = null;
      this.connect();
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
