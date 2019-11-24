Vue.component('taskmodeledit', {
    props: ["taskmodelid"],
    template: `
    <div>
        <legend>{{currentItem.id == -1?"Новая задача":"Редактирование задачи"}}</legend>
      <b-form @submit="onSubmit" class="col-sm-9">
        <div class="form-group row ">
          <label for="name"class="col-sm-4 col-form-label required">Номер задачи</label>
          <b-form-input class="col-sm-8"
            v-model="currentItem.taskNumber"
            required   
          ></b-form-input>     
        </div>

         <div class="form-group row ">
              <label for="project" class="col-sm-4 col-form-label required">Проект</label>         
              <v-select  placeholder=" " v-model="currentItem.project" as="name::id" :from="allProjects" tagging class="col-sm-8" ></v-select>              
              <div class="invalid-feedback col-sm-8 offset-sm-4"" style="display:block" v-if="!currentItem.project || (currentItem.project.name == ' ')">Выберите проект</div>
        </div>
         <div class="form-group row ">
              <label for="parent" class="col-sm-4 col-form-label">Задача-родитель</label>         
              <v-select  placeholder=" " v-model="currentItem.parent" as="taskNumber::id" :from="allParents" tagging class="col-sm-8" ></v-select>              
        </div>

        <div class="form-group row ">
          <label for="name"class="col-sm-4 col-form-label required">Название задачи</label>
          <b-form-input class="col-sm-8"
            v-model="currentItem.taskName"
            required   
          ></b-form-input>     
        </div>

        <div class="form-group row ">
          <label for="description" class="col-sm-4 col-form-label">Описание</label>          
         <b-form-textarea class="col-sm-8"
              id="description"
              v-model="currentItem.taskDescription"
              placeholder=""
              rows="3"
            ></b-form-textarea>
        </div>

        <div class="form-group row ">
              <label for="type" class="col-sm-4 col-form-label required">Тип задачи</label>         
              <v-select  placeholder=" " v-model="currentItem.type" as="name::id" :from="allTypes" tagging class="col-sm-8"></v-select>              
              <div class="invalid-feedback col-sm-8 offset-sm-4"" style="display:block" v-if="!currentItem.type || (currentItem.type.name == ' ')">Выберите тип</div>
        </div>
        <div class="form-group row ">
              <label for="position" class="col-sm-4 col-form-label required">Приоритет задачи</label>         
              <v-select  placeholder=" " v-model="currentItem.priority" as="name::id" :from="allPrioritys" tagging class="col-sm-8"></v-select>              
              <div class="invalid-feedback col-sm-8 offset-sm-4"" style="display:block" v-if="!currentItem.priority || (currentItem.priority.name == ' ')">Выберите приоритет</div>
        </div>
        <div class="form-group row ">
              <label for="position" class="col-sm-4 col-form-label required">Сложность задачи</label>         
              <v-select  placeholder=" " v-model="currentItem.complexity" as="name::id" :from="allComplexitys" tagging class="col-sm-8"></v-select>              
              <div class="invalid-feedback col-sm-8 offset-sm-4"" style="display:block" v-if="!currentItem.complexity || (currentItem.complexity.name == ' ')">Выберите сложность</div>
        </div>

        <div class="form-group row " >
         <div class="invalid-feedback col-sm-8 offset-sm-4"" style="display:block; color: #f9a711;" >Рекомендуемое время: {{currentItem.recomMinutes}}</div>  
          <label for="estimatedTime" class="col-sm-4 col-form-label">Оценочное время задачи(в минутах)</label>
          <b-form-input class="col-sm-8" type=number 
            id="estimatedTime"
            v-model="currentItem.estimatedTime"
            required     
          ></b-form-input>       
        </div>
        <div class="form-group row ">
         <div class="invalid-feedback col-sm-8 offset-sm-4"" style="display:block; color: #f9a711;" >
                Рекомендуемая дата: {{recomDateDisplay}}</div>  
              <label for="date" class="col-sm-4 col-form-label required">Дата выпонения</label>
                 <date-picker name="date" v-model="currentItem.date" lang="ru" format="DD.MM.YYYY" class="col-sm-8" placeholder=" "
                                            style="padding-left:0px;padding-right:0px;"></date-picker>
                <div class="invalid-feedback col-sm-8 offset-sm-4"" style="display:block" v-if="!this.currentItem.date ">Выберите дату</div>  
        </div>

        <div class="form-group row"  v-if="isAdmin">
          <label for="manager" class="col-sm-4 col-form-label required">Менеджер</label>         
            <v-select placeholder=" " v-model="currentItem.manager" as="fio::id" :from="allManagers" tagging  class="col-sm-8"></v-select>  
            <div class="invalid-feedback col-sm-8 offset-sm-4"" style="display:block" v-if="!this.currentItem.manager || (this.currentItem.manager.fio == ' ')">Выберите менеджера проекта</div>
        </div>

        <div class="form-group">
          <b-button type="submit" variant="primary">
            {{currentItem.id == ''?"Добавить":"Сохранить"}}</b-button>
        </div>
      </b-form>

    </div>
    `,
    data: function () {
        return {
            isAdmin: false,
            currentItem: {
                id: -1,
                project: '',
                parent: '',
                priority: '',
                type: '',
                complexity: '',
                estimatedTime: 0,
                taskDescription: "",
                taskName: "",
                taskNumber: "",
                date: null,
                recomMinutes: 0,
                recomDate: null,
            },
            allProjects: [],
            allParents: [],
            allTypes: [],
            allPrioritys: [],
            allComplexitys: [],
        }
    },
    computed: {
        recomDateDisplay() {
            if (!this.currentItem.recomDate) return ''
            var date = new Date(this.currentItem.recomDate);
            return ('0' + date.getDate()).slice(-2) + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' + ('000' + (date.getFullYear())).slice(-4)
        }
    },
    watch: {
        'currentItem.complexity': function (newVal, oldVal) {
            this.recommend();
        },
        'currentItem.type': function (newVal, oldVal) {
            this.recommend();
        },
        'currentItem.priority': function (newVal, oldVal) {
            this.recommend();
        },
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault()
            
            if (this.currentItem.project && this.currentItem.project != ' ' && this.currentItem.project.id != -1 &&
                this.currentItem.type &&
                this.currentItem.priority &&
                this.currentItem.complexity
                && this.currentItem.date 
            ) {
                this.currentItem.projectId = this.currentItem.project.id
                this.currentItem.project = this.currentItem.project.name

                if (this.currentItem.parent) {
                    this.currentItem.parentId = this.currentItem.parent.id
                    this.currentItem.parent = this.currentItem.parent.taskNumber
                } else {
                    this.currentItem.parentId = -1
                }

                this.currentItem.date.setHours(this.currentItem.date.getHours() + 11);

                this.currentItem.type = this.currentItem.type.id
                this.currentItem.priority = this.currentItem.priority.id
                this.currentItem.complexity = this.currentItem.complexity.id

                if (this.currentItem.id == -1) {
                    axios.post("/taskmodels/Add", Object.assign({}, this.currentItem))
                        .then(response => {
                            document.location.href = '/taskmodels/details?id=' + response.data.id
                        })
                } else {
                    axios.post("/taskmodels/Update", Object.assign({}, this.currentItem))
                        .then(response => {
                            document.location.href = '/taskmodels/details?id=' + response.data.id
                        })
                }
            }
        },
        recommend() {
            var data = {
                id: this.currentItem.id,
                type: this.currentItem.type.id,
                priority: this.currentItem.priority.id,
                complexity: this.currentItem.complexity.id,
            }
            axios.post("/taskmodels/GetEstimate", data)
                .then(response => {
                    this.currentItem.recomMinutes = response.data.minutes
                    this.currentItem.recomDate = response.data.date
                })
        }
    },
    mounted() {
        axios.get("/taskmodels/get", {
                params: {
                    id: this.taskmodelid
                }
            })
            .then(response => {
                this.currentItem.id = response.data.id;
                this.currentItem.taskNumber = response.data.taskNumber;
                this.currentItem.taskName = response.data.taskName;
                this.currentItem.taskDescription = response.data.taskDescription;
                this.currentItem.estimatedTime = response.data.estimatedTime;
                this.currentItem.date = response.data.date ? new Date(response.data.date) : '';
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
                if (response.data.complexityName) {
                    this.currentItem.complexity = {
                        id: response.data.complexity,
                        name: response.data.complexityName
                    };
                } else {
                    this.currentItem.complexity = {
                        id: -1,
                        name: ' '
                    };
                }
                if (response.data.parent) {
                    this.currentItem.parent = {
                        id: response.data.parentId,
                        taskNumber: response.data.parent
                    };
                } else {
                    this.currentItem.parent = {
                        id: -1,
                        taskNumber: ' '
                    };
                }

                axios.get("/taskmodels/getparents?id=" + this.currentItem.id).then(response => {
                    this.allParents = response.data
                })

                window.document.title = this.currentItem.taskNumber || "Новая задача"
            })

        axios.get("/labors/GetAllTypes").then(response => {
            this.allTypes = response.data
        })
        axios.get("/labors/GetAllPrioritys").then(response => {
            this.allPrioritys = response.data
        })
        axios.get("/taskmodels/GetAllComplexitys").then(response => {
            this.allComplexitys = response.data
        })

        axios.get("/projects/GetAllMine").then(response => {
            this.allProjects = response.data
        })
        
    },
    components: {
        vSelect: VueSelect.vSelect,
    },
})
new Vue({
    el: '#Taskmodel',
})