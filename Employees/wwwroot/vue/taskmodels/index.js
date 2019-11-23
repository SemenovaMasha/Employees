
new Vue({
    el: '#Taskmodels',
    template: `
    <div>
       <div style="margin-bottom: 10px" > 
            <div class="form-group row ">
                <b-button  @click="addTaskmodel()"  variant="success" class="col-sm-2" v-if="isAdmin">
                  <i class="fas fa-plus"> Добавить</i>
                </b-button>

                <b-form-radio-group  v-model="allTaskmodelsRadio" name="radioAllTaskmodels" @change="changeAllTaskmodels"  class="col-sm-4 offset-sm-1" style="padding-top: 7px;">
                    <b-form-radio value="mine">Мои задачи</b-form-radio>
                    <b-form-radio value="all">Все задачи</b-form-radio>
              </b-form-radio-group>
            </div>
        </div>


    <b-table striped show-empty :items="filtered"  :fields="fields">

      <template v-slot:cell(actions)="props">    
        <b-button size="sm"  @click="deleteTaskmodel(props.item, props.index, $event.target)" class="mr-2"  variant="outline-danger" >
          <i class="fas fa-trash-alt"></i>
        </b-button>
      </template>
  
        <template v-slot:cell(progress)="props">    
           <b-progress>
              <b-progress-bar :max="props.item.progressMax" :value="props.item.progressValue" :variant="progressVariant(props.item.progressValue,props.item.progressMax)" >{{ props.item.progressValue }}/{{ props.item.progressMax }}
              </b-progress-bar>
        </b-progress>   
      </template>

      <template v-slot:cell(taskNumber)="props">    
       <a :href="'/taskmodels/details?id='+props.item.id">{{props.item.taskNumber}} </a>
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
      title="Удаление задачи"
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
            allTaskmodelsRadio: 'mine',
            isAdmin: false,
            fields: [
                {
                    key: 'taskNumber',
                    label: 'Номер',
                    sortable: true,
                    width: 2
                },
                {
                    key: 'project',
                    label: 'Проект',
                    sortable: true,
                    width: 4
                },
                {
                    key: 'taskName',
                    label: 'Название',
                    sortable: true,
                    width: 4
                },
                {
                    key: 'priorityName',
                    label: 'Приоритет',
                    sortable: true,
                    width: 4
                },
                //{
                //    key: 'statusName',
                //    label: 'Статус',
                //    sortable: true,
                //    width: 4
                //},
                {
                    key: 'progress',
                    label: '',
                    width:3,
                },
                {
                    key: 'actions',
                    label: '',
                    width: 1,
                    tdClass: 't',
                },

            ],
            allTaskmodels: [],
            filters: {
                taskNumber: '',
                project: '',
                taskName: '',
                priorityName: '',
                statusName: '',
            },
            deletedId: ''
        }
    },
    computed: {
        filtered() {
            const filtered = this.allTaskmodels.filter(item => {
                return Object.keys(this.filters).every(key =>
                    String(item[key]).toLowerCase().includes(this.filters[key].toLowerCase()))
            })
            return filtered.length > 0 ? filtered : []
        }
    },

    mounted() {
        //axios.get("/taskmodels/GetAll")
        //    .then(response => {
        //        this.allTaskmodels = response.data
        //    })

        if (this.allTaskmodelsRadio == 'mine') {
            axios.get("/taskmodels/GetAllMine")
                .then(response => {
                    this.allTaskmodels = response.data
                })
        } else {
            axios.get("/taskmodels/GetAll")
                .then(response => {
                    this.allTaskmodels = response.data
                })
        }

        axios.get("/employees/isAdmin")
            .then(response => {
                this.isAdmin = response.data
                if (!this.isAdmin)
                    this.fields = this.fields.filter(item => { return item.key != 'actions' && item.key != 'salary' });
            })
    },
    methods: {
        changeAllTaskmodels(value) {
            if (value == 'mine') {
                axios.get("/taskmodels/GetAllMine")
                    .then(response => {
                        this.allTaskmodels = response.data
                    })
            } else {
            axios.get("/taskmodels/GetAll")
                .then(response => {
                    this.allTaskmodels = response.data
                })
            }
        },
        deleteTaskmodel(item) {
            this.deletedId = item.id
            this.$bvModal.show('delete-modal')
        },
        deleteConfirm(bvModalEvt) {
            axios.get("/taskmodels/delete", {
                    params: {
                        id: this.deletedId
                    }
                })
                .then(response => {
                    this.allTaskmodels = this.allTaskmodels.filter(item => { return item.id != response.data.id });
                })

        },
        addTaskmodel() {
            document.location.href = '/taskmodels/edit?id=-1' 
        },
        progressVariant(value, max) {
            var div = value / max * 100;

            if (div < 50) {
                return 'success'
            }
            if (div < 100) {
                return 'warning'
            }

            return 'danger'
        }
    }
})
