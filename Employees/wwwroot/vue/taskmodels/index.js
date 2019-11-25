
new Vue({
    el: '#Taskmodels',
    template: `
    <div>
       <div style="margin-bottom: 10px" > 
            <div class="form-group row ">
                <b-button  @click="addTaskmodel()"  variant="success" class="col-sm-2" >
                  <i class="fas fa-plus"> Добавить</i>
                </b-button>

            </div>
            <div class="form-group row ">
                <b-form-radio-group  v-model="allTaskmodelsRadio" name="radioAllTaskmodels"   class="col-sm-12" style="padding-top: 7px;">
                    <b-form-radio value="Mine">Мои задачи</b-form-radio>
                    <b-form-radio value="All">Все задачи</b-form-radio>
              </b-form-radio-group>
                <b-form-radio-group  v-model="allStatusRadio" name="allStatusRadio"   class="col-sm-12" >
                    <b-form-radio value="Open">В процессе</b-form-radio>
                    <b-form-radio value="Done">Сделаны</b-form-radio>
                    <b-form-radio value="All" >Все</b-form-radio>
                    <b-form-radio value="Over" >Просроченные</b-form-radio>
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
              <b-progress-bar :max="props.item.progressMax" :value="props.item.progressValue" :variant="progressVariant(props.item.progressValue,props.item.progressMax)" >{{ props.item.progressValue }}/{{ props.item.progressMax }}</b-progress-bar>
            </b-progress>   
           <b-progress  v-if="props.item.status==0">
              <b-progress-bar :max="props.item.dateProgressMax" :value="props.item.dateProgressValue" :variant="progressVariant(props.item.dateProgressValue,props.item.dateProgressMax)" >{{ props.item.dateProgressValue }}/{{ props.item.dateProgressMax }}</b-progress-bar>
        </b-progress>   
      </template>

      <template v-slot:cell(taskNumber)="props">    
       <a :href="'/taskmodels/details?id='+props.item.id">{{props.item.taskNumber}} </a>
      </template>

      <template v-slot:cell(status)="props">    
        <i class="fas fa-check-square" title="Сделано" style="color: #56CC9D" v-if="props.item.status==1"></i>
        <i class="fas fa-clock" title="Просрочено" style="color: #FF7851" v-else-if="props.item.dateProgressValue/props.item.dateProgressMax*100 > 100"></i>
        <i class="fas fa-clock" title="В процессе" style="color: #ecca7c" v-else></i>
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
            allTaskmodelsRadio: 'Mine',
            allStatusRadio: 'Open',
            isAdmin: false,
            fields: [
                {
                    key: 'status',
                    label: '',
                    sortable: true,
                    width: 1
                },
                {
                    key: 'taskNumber',
                    label: 'Номер',
                    sortable: true,
                    width: 4
                },
                {
                    key: 'project',
                    label: 'Проект',
                    sortable: true,
                    width: 8
                },
                {
                    key: 'taskName',
                    label: 'Название',
                    sortable: true,
                    width: 8
                },
                {
                    key: 'priorityName',
                    label: 'Приоритет',
                    sortable: true,
                    width: 8
                },
                //{
                //    key: 'statusName',
                //    label: 'Статус',
                //    sortable: true,
                //    width: 4
                //},
                {
                    key: 'progress',
                    label: 'Затрачено времени Прошло дней',
                    width: 6,
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
    watch: {
        'allTaskmodelsRadio': function (newVal, oldVal) {
            this.loadData()
        },
        'allStatusRadio': function (newVal, oldVal) {
            this.loadData()
        },
    },
    mounted() {
        this.loadData();

    },
    methods: {
        loadData() {   
            axios.get("/taskmodels/getBy", {
                params: {
                    byUser: this.allTaskmodelsRadio,
                    byStatus: this.allStatusRadio
                }
            })
            .then(response => {
                this.allTaskmodels = response.data
            })
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
        },
        progressValue(value, max) {
            var div = value / max * 100;
        }
    }
})
