
Vue.component('taskmodeldetails',
    {
        props: ["taskmodelid"],
        template: `
    <div>
       <div class="card mb-3">
          <h3 class="card-header">{{currentItem.taskNumber||'Задача'}} 
            <b-button size="sm" @click="edit()" class="mr-2"  variant="outline-primary">
              <i class="fas fa-edit"></i>
            </b-button>
            <b-button type="submit" variant="primary" @click="changeStatus()">
                {{currentItem.status == 0?"Завершить":"Открыть"}}</b-button>
            </h3>
      
          <div class="card-body" >
            <p class="card-title" style="white-space: pre-wrap;">Проект:  <a :href="'/projects/details?id='+currentItem.projectId">{{currentItem.project}} </a></p>
            <h5 class="card-title" style="white-space: pre-wrap;">{{currentItem.taskName}}</h5>
            <p class="card-title" style="white-space: pre-wrap;">{{currentItem.taskDescription}}</p>
            <p class="card-title"  >Оценочное время: {{currentItem.estimatedTime}} <a href="#"  @click="historyToggle()"> <i class="fas fa-history" style="margin-left:10px; color:#48a5e6;"></i></a></p>
              
            <slot  style="margin-bottom:20px" v-if="showHistory">      

                <p v-for="item in history">
                    {{getDateTimeDisplay(item.date)}} Изменил: {{item.user}}, Причина: {{item.reason}}, (Старое значение: {{item.oldValue}}, Новое значение: {{item.newValue}})
                </p>
               
              </slot>

            <p class="card-title" style="white-space: pre-wrap;">Дата выполнения: {{dateDisplay}}</p>
            <p class="card-title" style="white-space: pre-wrap;">Дата создания: {{createdDateDisplay}}</p>

            <slot v-if="currentItem.hasChilds">
                <br/>
                <p class="card-title" style="white-space: pre-wrap;">Оценочное время с учетом подзадач: {{currentItem.fullEstimatedTime}}</p>
                <p class="card-title" style="white-space: pre-wrap;">Дата выполнения с учетом подзадач: {{fullDateDisplay}}</p>
            </slot>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">
                <p class="card-text">Приоритет: {{currentItem.priority}}</p>
            </li>
            <li class="list-group-item">
                <p class="card-text">Сложность: {{currentItem.complexity}}</p>
            </li>
            <li class="list-group-item">
                <p class="card-text">Тип: {{currentItem.type}}</p>
            </li>
          </ul>
        </div>


    </div>
    `,
        data: function() {
            return {
                currentItem: {
                    id: -1,
                    project: '',
                    projectId: -1,
                    priority: '',
                    type: '',
                    complexity: '',
                    estimatedTime: 0,
                    parent: '',
                    taskDescription: "",
                    taskName: "",
                    taskNumber: "",
                    status: "",
                    date: null,
                    createdDate: null,
                    fullDate: null,
                    fullEstimatedTime: 0,
                    hasChilds: false,
                    status: 0,
                },
                canEdit: false,
                showHistory: false,
                history:[]
            }
        },
        computed: {
            dateDisplay() {
                return this.getDateDisplay(this.currentItem.date);
            },
            createdDateDisplay() {
                return this.getDateDisplay(this.currentItem.createdDate);
            },
            fullDateDisplay() {
                return this.getDateDisplay(this.currentItem.fullDate);
            },
        },
        methods: {
            getDateDisplay(dateInput) {
                if (!dateInput) return ''
                var date = new Date(dateInput);
                return ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('000' + (date.getFullYear())).slice(-4)
            },
            edit() {
                document.location.href = '/taskmodels/edit?id=' + this.currentItem.id
            },
            changeStatus() {
                axios.get("/taskmodels/changeStatus", {
                    params: {
                        id: this.taskmodelid
                    }
                })
                .then(response => {
                    this.currentItem.status = 1 - this.currentItem.status;
                })            
            },
            historyToggle() {
                this.showHistory = !this.showHistory;
            },
            getDateTimeDisplay(date) {
                if (!date) return ''
                var date = new Date(date);
                return ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('000' + (date.getFullYear())).slice(-4) + ' '
                    + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2)
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
                    this.currentItem.project = response.data.project;
                    this.currentItem.projectId = response.data.projectId;
                    this.currentItem.priority = response.data.priorityName;
                    this.currentItem.type = response.data.typeName;
                    this.currentItem.complexity = response.data.complexityName;
                    this.currentItem.estimatedTime = response.data.estimatedTime;
                    this.currentItem.parent = response.data.parent;
                    this.currentItem.taskDescription = response.data.taskDescription;
                    this.currentItem.taskName = response.data.taskName;
                    this.currentItem.taskNumber = response.data.taskNumber;
                    this.currentItem.status = response.data.status;
                    this.currentItem.date = response.data.date;
                    this.currentItem.createdDate = response.data.createdDate;
                    this.currentItem.hasChilds = response.data.hasChilds;
                    this.currentItem.fullEstimatedTime = response.data.fullEstimatedTime;
                    this.currentItem.fullDate = response.data.fullDate;
                    this.currentItem.status = response.data.status;

                    window.document.title = this.currentItem.taskNumber 
                })

            axios.get("/taskmodels/getEstimateHistory", {
                params: {
                    id: this.taskmodelid
                }
            })
                .then(response => {
                    this.history = response.data
                })
        }
    });

new Vue({
    el: '#Taskmodel',
});