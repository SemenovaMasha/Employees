Vue.component('projectTeam', {
    props: ["projectid"],
    template: `
    <div>
        <div class="card mb-3">
          <h6 class="card-header">Участники проекта</h6>          

             <div class="card-body">
                <div style="margin-bottom: 10px"  v-if="canEdit">       
                <b-button  @click="addEmployeeToTeam()"  variant="success"  v-if="isManager">
                  <i class="fas fa-plus"> Добавить участника</i>
                </b-button>
                </div>

                  <b-table striped show-empty :items="filtered"  :fields="fields">

               <template v-slot:cell(fio)="props">    
                   <a :href="'/employees/details?id='+props.item.id">{{props.item.fio}} </a>
                  </template>

                  <template v-slot:cell(actions)="props"> 
                    <b-button size="sm"  @click="removeFromProject(props.item, props.index, $event.target)" class="mr-2"  variant="outline-danger"  
                        v-if="!props.item.isProjectManager">
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
      title="Удаление участника из проекта"
      @ok="removeConfirm"
    >
      <template v-slot:modal-ok="props">
        Да
      </template>
      <template v-slot:modal-cancel="props">
        Нет
      </template>
      <template v-slot:default="{ hide }">
        Вы уверены, что хотите удалить участника из проекта?
      </template>
    </b-modal>

    <b-modal
      id="add-modal"     
      title="Добавление участника"
      @ok="addConfirm"
        size="xl" 
    >
      <template v-slot:modal-ok="props">
        Добавить
      </template>
      <template v-slot:modal-cancel="props">
        Отмена
      </template>
     
        <b-table striped show-empty :items="filteredAdd"  :fields="addModalFields">

           <template v-slot:cell(fio)="props">    
               <a :href="'/employees/details?id='+props.item.id">{{props.item.fio}} </a>
              </template>

              <template v-slot:cell(actions)="props"> 
                <b-button size="sm"  @click="removeFromProject(props.item, props.index, $event.target)" class="mr-2"  variant="outline-danger" >
                  <i class="fas fa-trash-alt"></i>
                </b-button>
              </template>
              
              <template v-slot:top-row="props">
                <td v-for="field in props.fields" :key="field.key">
                  <b-form-input v-model="addFilters[field.key]" size="sm" :placeholder="field.label"  v-if="addFilters[field.key] != undefined">
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

            <template v-slot:cell(checkbox)="row">
                <b-form-checkbox v-model="row.item.checkbox" >
                  
                </b-form-checkbox>
              </template>

            </b-table>
    </b-modal>
    </div>
    `,
    data: function () {
        return {
            canEdit: false,
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

            addModalFields: [
                {
                    key: 'checkbox',
                    label: ' ',
                   // sortable: true,
                    width: 1
                },
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
            ],
            usersToAdd: [],
            choosenId: '',

            allUsers: [],
            filters: {
                fio: '',
                position: '',
                role: '',
            },
            addFilters: {
                fio: '',
                position: '',
                role: '',
            },
            deletedId: -1,
            isManager: false,
        }
    },
    computed: {
        filtered() {
            const filtered = this.allUsers.filter(item => {
                return Object.keys(this.filters).every(key =>
                    String(item[key]).toLowerCase().includes(this.filters[key].toLowerCase()))
            })
            return filtered.length > 0 ? filtered : []
        },

        filteredAdd() {
            const filtered = this.usersToAdd.filter(item => {
                return Object.keys(this.addFilters).every(key =>
                    String(item[key]).toLowerCase().includes(this.addFilters[key].toLowerCase()))
            })
            return filtered.length > 0 ? filtered : []
        }
    },

    methods: {
        addEmployeeToTeam(item, key) {
            this.$bvModal.show('add-modal')

            axios.get("/projects/GetUsersToChoose", {
                    params: {
                        id: this.projectid
                    }
                })
                .then(response => {
                    this.usersToAdd = response.data
                    this.usersToAdd.forEach(function(item) {
                        item.checkbox = false;
                    });
                })
        },
        removeFromProject(item) {
            this.deletedId = item.id
            this.$bvModal.show('delete-modal')
        },
        removeConfirm(bvModalEvt) {
            axios.get("/projects/removeFromProject", {
                params: {
                    employeeId: this.deletedId,
                    projectId: this.projectid,
                }
            })
                .then(response => {
                    this.allUsers = this.allUsers.filter(item => { return item.id != this.deletedId });
                })

        },
        addConfirm() {
            axios.post("/projects/AddUsersToProject?projectId=" + this.projectid,
                this.usersToAdd.filter(item => { return item.checkbox }).map(x => x.id)
            )
                .then(response => {
                    var to = this.allUsers;
                    this.usersToAdd.filter(item => { return item.checkbox }).forEach(function (item) {
                        to.push(item);
                    });
                })
        }
    },

    mounted() {
        axios.get("/employees/isManager")
            .then(response => {
                this.isManager = response.data
            })
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
                if (!this.canEdit)
                    this.fields = this.fields.filter(item => { return item.key != 'actions'});
            })
    }
})
