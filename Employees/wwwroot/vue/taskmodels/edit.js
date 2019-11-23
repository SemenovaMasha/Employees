Vue.component('taskmodeledit', {
    props: ["taskmodelid"],
    template: `
    <div>
        <legend>{{currentItem.id == ''?"Новая задача":"Редактирование задачи"}}</legend>
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
          <label for="estimatedTime" class="col-sm-4 col-form-label">Оценочное время задачи(в минутах)</label>
          <b-form-input class="col-sm-8" type=number 
            id="estimatedTime"
            v-model="currentItem.estimatedTime"
            required     
          ></b-form-input>     
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
            },
            allProjects: [],
            allParents: [],
            allTypes: [],
            allPrioritys: [],
            allComplexitys: [],
        }
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault()
            
            if (this.currentItem.project && this.currentItem.project != ' ' && this.currentItem.project.id != -1 &&
                this.currentItem.type &&
                this.currentItem.priority &&
                this.currentItem.complexity 
            ) {
                this.currentItem.projectId = this.currentItem.project.id
                this.currentItem.project = this.currentItem.project.name

                if (this.currentItem.parent) {
                    this.currentItem.parentId = this.currentItem.parent.id
                    this.currentItem.parent = this.currentItem.parent.taskNumber
                } else {
                    this.currentItem.parentId = -1
                }
                

                this.currentItem.type = this.currentItem.type.id
                this.currentItem.priority = this.currentItem.priority.id
                this.currentItem.complexity = this.currentItem.complexity.id

                if (this.currentItem.id == '') {
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

                window.document.title = this.currentItem.name || "Новая задача"
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