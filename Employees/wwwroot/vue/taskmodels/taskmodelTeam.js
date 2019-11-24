Vue.component('taskmodelTeam', {
    props: ["taskmodelid"],
    template: `
    <div>
        <div class="card mb-3">
          <h6 class="card-header">Исполнители задачи</h6>          

             <div class="card-body">
                <div style="margin-bottom: 10px"  >       
                <b-button  @click="addEmployeeToTeam()"  variant="success" >
                  <i class="fas fa-plus"> Добавить участника</i>
                </b-button>
                </div>

                  <b-table striped show-empty :items="filtered"  :fields="fields">

               <template v-slot:cell(fio)="props">    
                   <a :href="'/employees/details?id='+props.item.id">{{props.item.fio}} </a>
                  </template>

                  <template v-slot:cell(actions)="props"> 
                    <b-button size="sm"  @click="removeFromtaskmodel(props.item, props.index, $event.target)" class="mr-2"  variant="outline-danger" 
                        v-if="!props.item.istaskmodelManager">
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
      title="Удаление исполнителя"
      @ok="removeConfirm"
    >
      <template v-slot:modal-ok="props">
        Да
      </template>
      <template v-slot:modal-cancel="props">
        Нет
      </template>
      <template v-slot:default="{ hide }">
        Вы уверены, что хотите удалить исполнителя?
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
     
        <b-table show-empty :items="filteredAdd"  :fields="addModalFields" :tbody-tr-class="rowClass">

           <template v-slot:cell(fio)="props">    
               <a :href="'/employees/details?id='+props.item.id">{{props.item.fio}} </a>
              </template>

              <template v-slot:cell(actions)="props"> 
                <b-button size="sm"  @click="removeFromtaskmodel(props.item, props.index, $event.target)" class="mr-2"  variant="outline-danger" >
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

         <b-alert variant="danger" style="position: fixed;"
             :show="successDismissCountDown"
            dismissible
            @dismissed="successDismissCountDown=0"
            @dismiss-count-down="successCountDownChanged"
            >
            Рекомендуется увеличить оценочное время выполнения до {{recomMinutes}}
          </b-alert>
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

            recomMinutes: 0,
            successAlertShow: false,
            successDismissSecs: 5,
            successDismissCountDown: 0,
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

            axios.get("/taskmodels/GetUsersToChoose", {
                    params: {
                        id: this.taskmodelid
                    }
                })
                .then(response => {
                    this.usersToAdd = response.data
                    this.usersToAdd.forEach(function(item) {
                        item.checkbox = false;
                    });
                })
        },
        removeFromtaskmodel(item) {
            this.deletedId = item.id
            this.$bvModal.show('delete-modal')
        },
        removeConfirm(bvModalEvt) {Taskmodel
            axios.get("/taskmodels/removeFromtaskmodel", {
                params: {
                    employeeId: this.deletedId,
                    taskModelId: this.taskmodelid,
                }
            })
                .then(response => {
                    this.allUsers = this.allUsers.filter(item => { return item.id != this.deletedId });

                    this.checkRecom();
                })

        },
        addConfirm() {
            axios.post("/taskmodels/AddUsersTotaskmodel?taskmodelId=" + this.taskmodelid,
                this.usersToAdd.filter(item => { return item.checkbox }).map(x => x.id)
            )
                .then(response => {
                    var to = this.allUsers;
                    this.usersToAdd.filter(item => { return item.checkbox }).forEach(function (item) {
                        to.push(item);
                    });
                    this.checkRecom();
                })
        },
        checkRecom() {
            axios.get("/taskmodels/TimeMatch", {
                params: {
                    id: this.taskmodelid
                }
            }).then(response => {
                if (!response.data.match) {
                    this.successDismissCountDown = this.successDismissSecs
                    this.recomMinutes = response.data.minutes
                }
            })
        },
        successCountDownChanged(dismissCountDown) {
            this.successDismissCountDown = dismissCountDown
        },
        rowClass(item, type) {
            if (!item) return
            if (item.taskMatch) return 'table-matches'
        },
    },

    mounted() {
        axios.get("/taskmodels/GettaskmodelUsers" ,{
                params: {
                    id: this.taskmodelid
                }
            })
            .then(response => {
                this.allUsers = response.data
            })
    }
})
