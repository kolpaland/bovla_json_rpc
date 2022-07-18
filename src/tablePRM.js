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
        data: function() { return [
            { 'id': 1, 'name': 'ПРМ1', 'err_checksum': this.prms[0][0], 'err_parity': this.prms[0][1], 'len': this.prms[0][2] },
            { 'id': 2, 'name': 'ПРМ2', 'err_checksum': this.prms[1][0], 'err_parity': this.prms[1][1], 'len': this.prms[1][2] },
            { 'id': 3, 'name': 'ПРМ3', 'err_checksum': this.prms[2][0], 'err_parity': this.prms[2][1], 'len': this.prms[2][2] }
        ]
        }
    },
    template:
        `<b-table class="py-2 px-2" :data="data" style="width: 780px;">
            <b-table-column field="name" label="Данные" v-slot="props">
                <span class="tag is-success is-medium" style="width: 80px;">
                    {{ props.row.name }}
                </span>
            </b-table-column>
            <b-table-column field="err_checksum" label="Ошибки КС" numeric centered v-slot="props">
                <span class="tag is-success is-light is-medium">
                    {{ props.row.err_checksum }}
                </span>
            </b-table-column>
            <b-table-column field="err_parity" label="Ошибки четности" numeric centered  v-slot="props">
                <span class="tag is-success is-light is-medium">
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