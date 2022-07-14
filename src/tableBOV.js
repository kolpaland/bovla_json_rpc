Vue.component('table-bov', {
    data: function () {
        return {
            
            data: [
                { 'id': 1, 'name': this.names[0], 'err_checksum': 0 },
                { 'id': 2, 'name': this.names[1], 'err_checksum': 0 } 
            ],

        }
    },
    props: {
        names: Array
    },
      template: 
      `<b-table class="py-2 px-2" :data="data" style="width: 390px;">
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
      </b-table>`
    })