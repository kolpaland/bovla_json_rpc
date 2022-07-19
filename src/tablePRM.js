Vue.component('table-prm', {
    data: function () {
        return { 
            
        }
    },
    props: {
        prms: {
            type: Array,
            default: function() {
                return [[0,0,0],[0,0,0],[0,0,0]];
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
                obj.err_checksum = Math.round(this.prms[i][0]);
                obj.err_parity = Math.round(this.prms[i][1]);
                obj.len = Math.round(this.prms[i][2]);
                array.push(obj);   
            }

            return array;
        },

    },
    methods: {
        hasErrors(data){
            return data.err_checksum > 0 || data.err_parity > 0;
        }
    },
    template:
        `<b-table class="py-2 px-2" :data="data" style="width: 780px;">
            <b-table-column field="name" label="Данные" v-slot="props">
                <span :class="[ 
                    'tag', 
                    { 'is-danger': hasErrors(props.row)},  
                    { 'is-success': !hasErrors(props.row)}, 
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
                    'is-medium'
                ]">
                    {{ props.row.err_checksum }}
                </span>
            </b-table-column>
            <b-table-column field="err_parity" label="Ошибки четности" numeric centered  v-slot="props">
                <span :class="[ 
                    'tag', 
                    { 'is-danger': props.row.err_parity > 0 },
                    { 'is-success': props.row.err_parity === 0}, 
                    'is-light', 
                    'is-medium'
                ]">
                    {{ props.row.err_parity }}
                </span>
            </b-table-column>
            <b-table-column field="len" label="Длина" numeric centered v-slot="props">
                <span class="tag is-success is-light is-medium">
                    {{ props.row.len }}
                </span>
            </b-table-column>
      </b-table>`
})