Vue.component('list',
    {
    template: `
    <div>
       <div style="margin-bottom: 10px" > 
            <div class="form-group row ">
                <b-button  @click="addLabor()"  variant="success" class="col-sm-2">
                  <i class="fas fa-plus"> Добавить</i>
                </b-button>

            </div>
            <div class="form-group row ">
                <b-form-radio-group  v-model="allLaborsRadio" name="radioAllLabors"
                        class="col-sm-4" style="padding-top: 7px;" v-if="isAdmin||isManager" stacked>
                    <b-form-radio value="mine">Мои трудозатраты</b-form-radio>
                    <b-form-radio value="projects" v-if="isManager">Трудозатраты на моих проектах</b-form-radio>
                    <b-form-radio value="all" v-if="isAdmin">Все трудозатраты</b-form-radio>
              </b-form-radio-group>

                <b-form-radio-group  v-model="allTimeRadio" name="allTimeRadio" 
                        class="col-sm-7" style="padding-top: 7px;" stacked>
                    <b-form-radio value="week">Текущая неделя</b-form-radio>
                    <b-form-radio value="month" >Текущий месяц</b-form-radio>
                    <b-form-radio value="range">Выбранный диапазон: 
                                    <slot v-if="allTimeRadio=='range'">
                                    с 
                                     <date-picker name="date" v-model="rangeStartDate" lang="ru" format="DD.MM.YYYY" class="col-sm-8" placeholder=" "
                                                                style="padding-left:2px;padding-right:0px;"></date-picker>
                                    по
                                    <date-picker name="date" v-model="rangeEndDate" lang="ru" format="DD.MM.YYYY" class="col-sm-8" placeholder=" "
                                                                style="padding-left:2px;padding-right:0px;"></date-picker>
                                    </slot>
                    </b-form-radio>

              </b-form-radio-group>

            </div>
        </div>

    <b-table striped show-empty :items="filtered"  :fields="fields"  :sort-by.sync="defaultSort"  :sort-desc.sync="defaultSortDesc">

    <template v-slot:cell(date)="data">
       {{new Date(data.item.date).toLocaleDateString('ru-RU')}}
      </template>

      <template v-slot:cell(user)="props">    
       <a :href="'/employees/details?id='+props.item.userId">{{props.item.user}} </a>
      </template>
      <template v-slot:cell(project)="props">    
       <a :href="'/projects/details?id='+props.item.projectId">{{props.item.project}} </a>
      </template>

      <template v-slot:cell(taskNumber)="props">    
        {{(props.item.taskNumber||'') + ' ' + (props.item.taskName||'')}}
      </template>

      <template v-slot:cell(actions)="props">    
        <b-button size="sm" @click="props.toggleDetails" class="mr-2" variant="outline-info" title="Подробнее" style="margin-right: 0.1rem !important">
            <i :class="'fas fa-arrow-'+(props.detailsShowing ? 'up':'down')" ></i>
        </b-button>
       
        <b-button size="sm"  @click="editLabor(props.item, props.index, $event.target)" class="mr-2"  variant="outline-primary" title="Редактировать" style="margin-right: 0.1rem !important">
          <i class="fas fa-edit"></i>
        </b-button> 
        <b-button size="sm"  @click="deleteLabor(props.item, props.index, $event.target)" class="mr-2"  variant="outline-danger"  title="Удалить" style="margin-right: 0.1rem !important">
          <i class="fas fa-trash-alt"></i>
        </b-button>
      </template>

        <template slot="bottom-row" slot-scope="data">
            <td/><td/><td/><td>Всего: </td>
              <td>{{totalElapsed}}</td><td/><td/>
        </template>

    <template v-slot:row-details="row">

            <div class="card mb-3">
              <div class="card-body">
                <p><h6 class="card-subtitle text-muted">Дата: {{new Date(row.item.date).toLocaleDateString('ru-RU')}}</h6></p>
                <p><h6 class="card-subtitle text-muted">Проект: {{row.item.project}}</h6></p>
                <p><h6 class="card-subtitle text-muted">Сотрудник: {{row.item.user}}</h6></p>
                <p><h6 class="card-subtitle text-muted">Номер задачи: {{row.item.taskNumber}}</h6></p>
                <p><h6 class="card-subtitle text-muted">Наименование задачи: {{row.item.taskName}}</h6></p>
              </div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item">
                    <p class="card-text">Тип задачи: {{row.item.typeName}}</p>
                    <p class="card-text">Приоритет задачи: {{row.item.priorityName}}</p>
                </li>
                <li class="list-group-item">
                    <p class="card-text">Оценочное время: {{row.item.estimatedTime}}</p>
                    <p class="card-text">Затраченное время: {{row.item.elapsedTime}}</p>
                </li>
                <li class="list-group-item">
                    <p class="card-text" style="white-space: pre-wrap;">Примечание: {{row.item.note}}</p>
                </li>
              </ul>
            </div>
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
      title="Удаление трудозатрат"
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



    <b-modal  size="lg"
      id="edit-modal"     
      :title="(editId==-1?'Добавление':'Редактирование')+' трудозатрат'"
      @ok="editConfirm"
    >
      <template v-slot:modal-ok="props">
        {{editId==-1?'Добавить':'Сохранить'}}
      </template>
      <template v-slot:modal-cancel="props">
        Отмена
      </template>
     <div class="container">
            <b-form class="col-sm-11">
                <div class="form-group row ">
                      <label for="date" class="col-sm-4 col-form-label required">Дата</label>
                         <date-picker name="date" v-model="currentItem.date" lang="ru" format="DD.MM.YYYY" class="col-sm-8" placeholder=" "
                                                    style="padding-left:0px;padding-right:0px;"></date-picker>
                        <div class="invalid-feedback col-sm-8 offset-sm-4"" style="display:block" v-if="!this.currentItem.date ">Выберите дату</div>  
                </div>

                 <div class="form-group row ">
                      <label for="project" class="col-sm-4 col-form-label required">Проект</label>         
                      <v-select  placeholder=" " v-model="currentItem.project" as="name::id" :from="allProjects" tagging class="col-sm-8" ></v-select>              
                      <div class="invalid-feedback col-sm-8 offset-sm-4"" style="display:block" v-if="!currentItem.project || (currentItem.project.name == ' ')">Выберите проект</div>
                </div>
                 <div class="form-group row ">
                      <label for="taskmodel" class="col-sm-4 col-form-label required">Задача</label>         
                      <v-select  placeholder=" " v-model="currentItem.taskmodel" as="taskNumber::id" :from="allTaskmodels" tagging class="col-sm-8" ></v-select>              
                      <div class="invalid-feedback col-sm-8 offset-sm-4"" style="display:block" v-if="!currentItem.taskmodel || (currentItem.taskmodel.name == ' ')">Выберите задачу</div>
                </div>

               <div class="form-group row ">
                  <label for="taskNumber" class="col-sm-4 col-form-label required">Номер задачи</label>
                  <b-form-input class="col-sm-8"
                    id="taskNumber"
                    v-model="currentItem.taskNumber"
                    required       
                    readonly
                  ></b-form-input>     
                      <div class="invalid-feedback col-sm-8 offset-sm-4"" style="display:block" v-if="!taskNumberFilled">Заполните номер задачи</div>
                </div>
               <div class="form-group row ">
                  <label for="taskName" class="col-sm-4 col-form-label">Наименование</label>
                  <b-form-input class="col-sm-8"
                    id="taskName"
                    v-model="currentItem.taskName"   
                    readonly
                  ></b-form-input>     
                </div>

                <div class="form-group row ">
                      <label for="type" class="col-sm-4 col-form-label required">Тип задачи</label>         
                    <b-form-input class="col-sm-8"
                        id="typeName"
                        v-model="currentItem.type.name"   
                        readonly
                      ></b-form-input>  
                </div>
                <div class="form-group row ">
                      <label for="position" class="col-sm-4 col-form-label required">Приотритет задачи</label>         
                      <b-form-input class="col-sm-8"
                        id="priority"
                        v-model="currentItem.priority.name"   
                        readonly
                      ></b-form-input> 
                </div>

                <div class="form-group row " >
                  <label for="estimatedTime" class="col-sm-4 col-form-label required">Оценочное время (в минутах)</label>
                  <b-form-input class="col-sm-8" type=number 
                    id="estimatedTime"
                    v-model="currentItem.estimatedTime"
                    required     
                  ></b-form-input>     
                </div>
                <div class="form-group row " >
                  <label for="elapsedTime" class="col-sm-4 col-form-label required">Затраченное время (в минутах)</label>
                  <b-form-input class="col-sm-8" type=number 
                    id="elapsedTime"
                    v-model="currentItem.elapsedTime"
                    required     
                  ></b-form-input>     
                </div>
                
                <div class="form-group row ">
                  <label for="note" class="col-sm-4 col-form-label">Примечание</label>          
                 <b-form-textarea class="col-sm-8"
                      id="note"
                      v-model="currentItem.note"
                      placeholder=""
                      rows="2"
                    ></b-form-textarea>
                </div>

                <div class="form-group row " v-if="isAdmin || isManager">
                      <label for="user" class="col-sm-4 col-form-label required">Сотрудник</label>         
                      <v-select placeholder=" " v-model="currentItem.user" as="fio::id" :from="allUsers" tagging class="col-sm-8"></v-select>              
                      <div class="invalid-feedback col-sm-8 offset-sm-4"" style="display:block" v-if="!currentItem.user || (currentItem.user.fio == ' ')">Выберите сотрудника</div>
                </div>                

              </b-form>        
        </div>
    </b-modal>

    </div>
    `,
    data: function () {
        return {
            rangeStartDate: moment().startOf('year'),
            rangeEndDate: moment().endOf('year'),
            allTimeRadio:'week',
            defaultSort: 'date',
            defaultSortDesc: true,
            allLaborsRadio: 'mine',
            isAdmin: false,
            isManager: false,
            fields: [
                {
                    key: 'date',
                    label: 'Дата',
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
                    key: 'taskNumber',
                    label: 'Задача',
                    sortable: true,
                    width: 6
                },
                {
                    key: 'typeName',
                    label: 'Тип задачи',
                    sortable: true,
                    width: 4
                },
                {
                    key: 'elapsedTime',
                    label: 'Затраченное время',
                    sortable: true,
                    width: 2
                },
                {
                    key: 'user',
                    label: 'Сотрудник',
                    sortable: true,
                    width: 4
                },
                {
                    key: 'actions',
                    label: '',
                    width: 5,
                }
            ],
            allLabors: [],
            filters: {
                project: '',
                taskNumber: '',
                typeName: '',
                key: '',
                user: '',
            },
            deletedId: '',
            editId: -1,

            currentItem: {
                id: -1,
                project: '',
                projectId: -1,
                taskmodel: '',
                taskmodelId: -1,
                taskNumber: '',
                taskName: '',
                type: '',
                typeId: -1,
                priority: '',
                prioriyId: -1,
                estimatedTime: 0,
                elapsedTime: 0,
                note: '',
                user: '',
                userId: '',
                date: null,
            },
            allProjects: [],
            allTaskmodels: [],
            allTypes: [],
            allPrioritys: [],
            allUsers: [],
            editKey:-1
    }
        },
        watch: {
            'currentItem.project': function (newVal, oldVal) {
                axios.get("/projects/GetProjectUsers",
                        {
                            params: {
                                id: this.currentItem.project.id
                            }
                        })
                    .then(response => {
                        this.allUsers = response.data
                    })
            },
            'currentItem.taskmodel': function (newVal, oldVal) {
                if (this.currentItem.taskmodel && this.currentItem.taskmodel.id) {
                    axios.get("/taskModels/get?id=" + this.currentItem.taskmodel.id)
                        .then(response => {
                            this.allUsers = response.data
                            this.currentItem.taskNumber = response.data.taskNumber;
                            this.currentItem.taskName = response.data.taskName;

                            if (response.data.typeName) {
                                this.currentItem.type = {
                                    id: response.data.type,
                                    name: response.data.typeName
                                };
                            } else {
                                this.currentItem.type = {
                                    id: -1,
                                    name: ' '
                                };
                            }
                            if (response.data.priorityName) {
                                this.currentItem.priority = {
                                    id: response.data.priority,
                                    name: response.data.priorityName
                                };
                            } else {
                                this.currentItem.priority = {
                                    id: -1,
                                    name: ' '
                                };
                            }
                        })
                }
            },
        'allLaborsRadio': function (newVal, oldVal) {
            this.reloadTable();
        },
        'allTimeRadio': function (newVal, oldVal) {
            this.reloadTable();
        },
        'rangeStartDate': function (newVal, oldVal) {
            this.reloadTable();
        },
        'rangeEndDate': function (newVal, oldVal) {
            this.reloadTable();
        },
    },
    computed: {
        filtered() {
            const filtered = this.allLabors.filter(item => {
                return Object.keys(this.filters).every(key =>
                    String(item[key]).toLowerCase().includes(this.filters[key].toLowerCase()))
            })
            return filtered.length > 0 ? filtered : []
        },
        totalElapsed() {
            var t = this.filtered;
            return t.reduce((a, b) => a + (b['elapsedTime'] || 0), 0);
        },
        taskNumberFilled() {
            return this.currentItem.taskNumber && $.trim(this.currentItem.taskNumber)
        }
    },
        mounted() {
            this.reloadTable()

        axios.get("/employees/isAdmin").then(response => {
                this.isAdmin = response.data

                axios.get("/employees/isManager")
                    .then(response => {
                        this.isManager = response.data
                        if (!this.isManager && !this.isAdmin)
                            this.fields = this.fields.filter(item => { return  item.key != 'user' });
                    })
            })

        axios.get("/projects/GetAllMine").then(response => {
                this.allProjects = response.data
            })

        axios.get("/labors/GetAllTypes").then(response => {
                this.allTypes = response.data
            })
        axios.get("/labors/GetAllPrioritys").then(response => {
                this.allPrioritys = response.data
            })

        axios.get("/projects/GetProjectUsers", {
                params: {
                    id: this.currentItem.project.id
                }
            }).then(response => {
                this.allUsers = response.data
                })

        axios.get("/taskModels/GetAllMine").then(response => {
            this.allTaskmodels = response.data
        })
    },
        methods: {
            reloadTable() {
                var startDate;
                var endDate;
                switch (this.allTimeRadio) {
                    case 'week':
                        startDate = moment().startOf('isoWeek')
                        endDate = moment().endOf('isoWeek')
                        break;
                    case 'month':
                        startDate = moment().startOf('month')
                        endDate = moment().endOf('month')
                        break;
                    case 'range':
                        startDate = this.rangeStartDate
                        endDate = this.rangeEndDate
                        break;
                }
                var params = {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate)
                }
                if (this.allLaborsRadio == 'mine') {
                    axios.get("/labors/GetAllMine", {
                        params: params
                    })
                        .then(response => {
                            this.allLabors = response.data
                        })
                } else if (this.allLaborsRadio == 'projects') {
                    axios.get("/labors/GetAllMyProjects", {
                        params: params
                    })
                        .then(response => {
                            this.allLabors = response.data
                        })
                } else {
                    axios.get("/labors/GetAll", {
                        params: params
                    })
                        .then(response => {
                            this.allLabors = response.data
                        })
                }
            },
        deleteLabor(item) {
            this.deletedId = item.id
            this.$bvModal.show('delete-modal')
        },
        deleteConfirm(bvModalEvt) {
            axios.get("/labors/delete", {
                    params: {
                        id: this.deletedId
                    }
                })
                .then(response => {
                    this.allLabors = this.allLabors.filter(item => { return item.id != response.data.id });
                })

        },
        addLabor() {
            this.editId = -1;
            this.loadInfo()
        },
        loadInfo() {

            axios.get("/labors/get", {
                params: {
                    id: this.editId
                }
            })
                .then(response => {
                    this.currentItem.id = response.data.id;
                    this.currentItem.taskNumber = response.data.taskNumber;
                    this.currentItem.taskName = response.data.taskName;
                    this.currentItem.elapsedTime = response.data.elapsedTime;
                    this.currentItem.estimatedTime = response.data.estimatedTime;
                    this.currentItem.passportGiven = response.data.elapsedTime;
                    this.currentItem.note = response.data.note;

                    this.currentItem.date = response.data.date ? new Date(response.data.date) : '';
                    
                    //this.currentItem.positionId = response.data.positionId;
                    if (response.data.project) {
                        this.currentItem.project = {
                            id: response.data.projectId,
                            name: response.data.project
                        };
                    } else {
                        this.currentItem.project = {
                            id: -1,
                            name: ' '
                        };
                    }
                    if (response.data.taskModel) {
                        this.currentItem.taskmodel = {
                            id: response.data.taskModelId,
                            taskNumber: response.data.taskModel
                        };
                    } else {
                        this.currentItem.taskmodel = {
                            id: -1,
                            taskNumber: ' '
                        };
                    }
                    if (response.data.typeName) {
                        this.currentItem.type = {
                            id: response.data.type,
                            name: response.data.typeName
                        };
                    } else {
                        this.currentItem.type = {
                            id: -1,
                            name: ' '
                        };
                    }
                    if (response.data.priorityName) {
                        this.currentItem.priority = {
                            id: response.data.priority,
                            name: response.data.priorityName
                        };
                    } else {
                        this.currentItem.priority = {
                            id: -1,
                            name: ' '
                        };
                    }
                    if (response.data.user) {
                        this.currentItem.user = {
                            id: response.data.userId,
                            fio: response.data.user
                        };
                    } else {
                        this.currentItem.priority = {
                            id: -1,
                            fio: ' '
                        };
                    }

                    this.$bvModal.show('edit-modal')
                })
        },
        editLabor(item, key) {
            this.editId = item.id;
            this.editKey = key;
            this.loadInfo()
        },
        editConfirm(evt) {

            if (this.currentItem.project&& this.currentItem.date &&                
                this.currentItem.project != ' ' &&
                this.currentItem.project.id != -1 &&
                this.currentItem.taskmodel && 
                this.currentItem.taskmodel != ' ' &&
                this.currentItem.taskmodel.id != -1 &&
                this.currentItem.type &&
                this.currentItem.priority &&
                this.currentItem.user &&
                this.currentItem.taskNumber &&
                $.trim(this.currentItem.taskNumber)
            ) {
                this.currentItem.projectId = this.currentItem.project.id
                this.currentItem.project = this.currentItem.project.name
                this.currentItem.type = this.currentItem.type.id
                this.currentItem.priority = this.currentItem.priority.id
                this.currentItem.userId = this.currentItem.user.id
                this.currentItem.user = this.currentItem.user.fio
                this.currentItem.date.setHours(this.currentItem.date.getHours() + 11);
                this.currentItem.taskmodelId = this.currentItem.taskmodel.id
                this.currentItem.taskmodel = this.currentItem.taskmodel.taskNumber

                if (this.currentItem.id == -1) {
                    axios.post("/labors/Add", Object.assign({}, this.currentItem))
                        .then(response => {
                            response.data.project = this.currentItem.project
                            response.data.user = this.currentItem.user
                            this.allLabors.unshift(response.data)
                        })
                } else {
                    axios.post("/labors/Update", Object.assign({}, this.currentItem))
                        .then(response => {
                            response.data.project = this.currentItem.project
                            response.data.user = this.currentItem.user

                            var editLabor = this.allLabors.filter(item => { return item.id == response.data.id })[0];
                            Vue.set(this.allLabors, this.allLabors.indexOf(editLabor), response.data)
                        })
                }
            } else {
                evt.preventDefault()

            }
        } 
    },
    components: {
        vSelect: VueSelect.vSelect,
    },
})

new Vue({
    el: '#Labors',
});
