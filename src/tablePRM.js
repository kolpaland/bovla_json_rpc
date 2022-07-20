Vue.component('table-prm', {
    data: function () {
        return { 
            
        }
    },
    props: {
        prms: {
            type: Array,
            default: function() {
                return [[-1,-1,-1],[-1,-1,-1],[-1,-1,-1]];
              }
        },
        states:{
            type: Array,
            default: function() {
                return [false, false, false];
              }
        }
    },
    computed: {
        data: function() { 
            
            let array = [];
            
            for (let i = 0; i < this.prms.length; i++) { 
                let obj = {};
                obj.id = i;
                obj.name = "ПРМ" + i;
                obj.state = this.states[i]
                obj.err_checksum = Math.round(this.prms[i][0]);
                obj.err_parity = Math.round(this.prms[i][1]);
                obj.len = Math.round(this.prms[i][2]);
                array.push(obj);   
            }

            return array;
        },

    },
    methods: {
        hasData(data){
            return data.state;
        }
    },
    template:
        `<b-table class="px-2" :data="data" style="width: 780px;">
            <b-table-column field="name" label="Данные" v-slot="props">
                <span :class="[ 
                    'tag', 
                    { 'is-danger': !hasData(props.row)},  
                    { 'is-success': hasData(props.row)}, 
                    'is-medium'
                ]" style="width: 80px;">
                    {{ props.row.name }}
                </span>
            </b-table-column>
            <b-table-column field="err_checksum" label="Ошибки КС" numeric centered v-slot="props">
                <span :class="[ 
                    'tag', 
                    { 'is-danger': props.row.err_checksum > 0},  
                    { 'is-success': props.row.err_checksum === 0},
                    'is-light', 
                    'is-medium',
                    {'is-hidden': props.row.err_checksum < 0}
                ]">
                    {{ props.row.err_checksum }}
                </span>
                <b-skeleton :active="props.row.err_checksum < 0" :animated="true"></b-skeleton>
            </b-table-column>
            <b-table-column field="err_parity" label="Ошибки четности" numeric centered  v-slot="props">
                <span :class="[ 
                    'tag', 
                    { 'is-danger': props.row.err_parity > 0 },
                    { 'is-success': props.row.err_parity === 0}, 
                    'is-light', 
                    'is-medium',
                    {'is-hidden': props.row.err_parity < 0}
                ]">
                    {{ props.row.err_parity }}
                </span>
                <b-skeleton :active="props.row.err_parity < 0" :animated="true"></b-skeleton>
            </b-table-column>
            <b-table-column field="len" label="Длительность, в мкс." numeric centered v-slot="props">
                <span :class="[
                    'tag', 'is-success', 'is-light', 'is-medium',
                    {'is-hidden': props.row.err_parity < 0}
                ]">
                    {{ props.row.len }}
                </span>
                <b-skeleton :active="props.row.len < 0" :animated="true"></b-skeleton>
            </b-table-column>
      </b-table>`
})