
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
            </h3>
      
          <div class="card-body" >
            <p class="card-title" style="white-space: pre-wrap;">Проект:  <a :href="'/projects/details?id='+currentItem.projectId">{{currentItem.project}} </a></p>
            <h5 class="card-title" style="white-space: pre-wrap;">{{currentItem.taskName}}</h5>
            <p class="card-title" style="white-space: pre-wrap;">{{currentItem.taskDescription}}</p>
            <p class="card-title" style="white-space: pre-wrap;">Оценочное время: {{currentItem.estimatedTime}}</p>
            <p class="card-title" style="white-space: pre-wrap;">Дата выполнения: {{dateDisplay}}</p>
            <p class="card-title" style="white-space: pre-wrap;">Дата создания: {{createdDateDisplay}}</p>
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
                    createdDate: null
                },
                canEdit:false
            }
        },
        computed: {
            dateDisplay() {
                if (!this.currentItem.date) return ''
                var date = new Date(this.currentItem.date);
                return ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('000' + (date.getFullYear())).slice(-4)
            },

            createdDateDisplay() {
                if (!this.currentItem.createdDate) return ''
                var date = new Date(this.currentItem.createdDate);
                return ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('000' + (date.getFullYear())).slice(-4)
            }
        },
        methods: {
            edit() {
                document.location.href = '/taskmodels/edit?id='+this.currentItem.id
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
                   

                    window.document.title = this.currentItem.taskNumber 
                })
            
        }
    });

new Vue({
    el: '#Taskmodel',
});