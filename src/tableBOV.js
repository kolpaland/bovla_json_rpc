Vue.component('table-bov', {
    data: function () {
        return {
            
        }
    },
    props: {
        names: Array,
        errors: {
            type: Array,
            default: function() {
                return [-1,-1];
              }
        },
        states: {
            type: Array,
            default: function() {
                return [false, false];
          }
        }
    },
    computed:{
        data: function() { return [
            { 'id': 1, 'name': this.names[0], state: this.states[0], 'err_checksum': Math.round(this.errors[0]) },
            { 'id': 2, 'name': this.names[1], state: this.states[1], 'err_checksum': Math.round(this.errors[1]) } 
        ]
        }
    },
      template: 
      `<b-table class="py-2 px-2" :data="data" style="width: 305px;">
        <b-table-column field="name" label="Данные" v-slot="props">
            <span :class="[ 
                'tag', 
                { 'is-danger': !props.row.state },
                { 'is-success': props.row.state }, 
                'is-medium'
            ]"
             style="width: 80px;">
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
      </b-table>`
    })