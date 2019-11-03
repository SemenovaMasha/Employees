Vue.component('projectTeam', {
    props: ["projectid"],
    template: `
    <div>
        <div class="card mb-3">
          <h6 class="card-header">Участники проекта</h6>
            <div style="margin-bottom: 10px"  v-if="canEdit">       
            <b-button  @click="addEmployeeToTeam()"  variant="success" >
              <i class="fas fa-plus"> Добавить участника</i>
            </b-button>
            </div>

             <div class="card-body">
                  <b-table striped show-empty :items="filtered"  :fields="fields">

                  <template v-slot:cell(actions)="props"> 
                    <b-button size="sm"  @click="deletePosition(props.item, props.index, $event.target)" class="mr-2"  variant="outline-danger" >
                      <i class="fas fa-trash-alt"></i>
                    </b-button>
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
            </div>
        </div>
  

    <b-modal
      id="delete-modal"     
      title="Удаление должности"
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
            canEdit:false,
            fields: [
                {
                    key: 'fio',
                    label: 'ФИО',
                    sortable: true,
                    width: 14
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
                    key: 'actions',
                    label: '',
                    width: 1
                }
            ],
            allUsers: [],
            filters: {
                fio: '',
                position: '',
                role: '',
            },
            deletedId: -1
        }
    },
    computed: {
        filtered() {
            const filtered = this.allUsers.filter(item => {
                return Object.keys(this.filters).every(key =>
                    String(item[key]).includes(this.filters[key]))
            })
            return filtered.length > 0 ? filtered : []
        }
    },

    methods: {
        addEmployeeToTeam(item, key) {

        },
        deletePosition(item) {
            this.deletedId = item.id
            this.$bvModal.show('delete-modal')
        },
        deleteConfirm(bvModalEvt) {
            axios.get("/position/delete", {
                params: {
                    id: this.deletedId
                }
            })
                .then(response => {
                    this.allPositions = this.allPositions.filter(item => { return item.id != response.data.id });
                })

        },
    },

    mounted() {
        axios.get("/projects/GetProjectUsers" ,{
                params: {
                    id: this.projectid
                }
            })
            .then(response => {
                this.allUsers = response.data
            })

        axios.get("/projects/canEditProject", {
                params: {
                    id: this.projectid
                }
            })
            .then(response => {
                this.canEdit = response.data
            })
    }
})
