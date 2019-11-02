
new Vue({
    el: '#Employees',
    template: `
    <div>
    <b-table striped show-empty :items="filtered"  :fields="fields">

      <template v-slot:cell(actions)="props">    
        <b-button size="sm"  @click="deleteEmployee(props.item, props.index, $event.target)" class="mr-2"  variant="outline-danger" >
          <i class="fas fa-trash-alt"></i>
        </b-button>
      </template>

      <template v-slot:cell(fio)="props">    
       <a href="#">{{props.item.fio}} </a>
      </template>
      
      <template v-slot:top-row="props">
        <td v-for="field in props.fields" :key="field.key">
          <b-form-input v-model="filters[field.key]" size="sm" :placeholder="field.label"  v-if="filters[field.key] != undefined">
          </b-form-input>      
        </td>
      </template>  

      <template v-slot:table-colgroup="scope">
        <col
          v-for="field in scope.fields"
          :key="field.key"
          :style="{ width: field.width+'%' }"
        >
      </template>

    </b-table>

    <b-modal
      id="delete-modal"     
      title="Удаление сотрудника"
      @ok="deleteConfirm"
    >
      <template v-slot:modal-ok="props">
        Да
      </template>
      <template v-slot:modal-cancel="props">
        Нет
      </template>
      <template v-slot:default="{ hide }">
        Вы уверены, что хотите удалить запись?
      </template>
    </b-modal>
    </div>
    `,
    data: function () {
        return {
            readonly: true,
            fields: [
                {
                    key: 'fio',
                    label: 'ФИО',
                    sortable: true,
                    width: 14
                },
                {
                    key: 'birthDate',
                    label: 'Дата рождения',
                    sortable: true,
                    width: 4,
                    formatter: (value, key, item) => {
                        var date = new Date(value);
                        return ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-'+ ('000' + (date.getFullYear())).slice(-4) 
                    }
                },
                {
                    key: 'position',
                    label: 'Должность',
                    sortable: true,
                    width: 4
                },
                {
                    key: 'role',
                    label: 'Роль',
                    sortable: true,
                    width: 4
                },
                {
                    key: 'education',
                    label: 'Образование',
                    sortable: true,
                    width: 4
                },
                {
                    key: 'actions',
                    label: '',
                    width: 1,
                    tdClass: 't',
                }
            ],
            allEmployees: [],
            filters: {
                fio: '',
                position: '',
                role: '',
                passportSeriesNumber: '',
                education: '',
            },
            deletedId: ''
        }
    },
    computed: {
        filtered() {
            const filtered = this.allEmployees.filter(item => {
                return Object.keys(this.filters).every(key =>
                    String(item[key]).includes(this.filters[key]))
            })
            return filtered.length > 0 ? filtered : []
        }
    },

    mounted() {
        axios.get("/employees/GetAll")
            .then(response => {
                this.allEmployees = response.data
            })

        axios.get("/employees/listReadonly")
            .then(response => {
                this.readonly = response.data
                if(this.readonly)
                    this.fields=this.fields.filter(item => { return item.key != 'actions' });
            })
    },
    methods: {
        deleteEmployee(item) {
            this.deletedId = item.id
            this.$bvModal.show('delete-modal')
        },
        deleteConfirm(bvModalEvt) {
            axios.get("/employees/delete", {
                    params: {
                        id: this.deletedId
                    }
                })
                .then(response => {
                    this.allEmployees = this.allEmployees.filter(item => { return item.id != response.data.id });
                })

        },
    }
})
