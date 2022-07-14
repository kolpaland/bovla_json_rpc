Vue.component('table-prm', {
    data: function () {
        return {
            data: [
                { 'id': 1, 'name': 'ПРМ1', 'err_checksum': 0, 'err_parity': 0, 'len': 0 },
                { 'id': 2, 'name': 'ПРМ2', 'err_checksum': 0, 'err_parity': 0, 'len': 0 },
                { 'id': 3, 'name': 'ПРМ3', 'err_checksum': 0, 'err_parity': 0, 'len': 0 }
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