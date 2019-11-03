
Vue.component('projectdetails',
    {
        props: ["projectid"],
        template: `
    <div>
       <div class="card mb-3">
          <h3 class="card-header">{{currentItem.name||'Проект'}} 
            <b-button size="sm" @click="edit()" class="mr-2"  variant="outline-primary" v-if="canEdit">
              <i class="fas fa-edit"></i>
            </b-button>
            </h3>
          <div class="card-body" v-if="currentItem.description">
            <h5 class="card-title" style="white-space: pre-wrap;">{{currentItem.description}}</h5>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">
                <p class="card-text">Менеджер проекта: {{currentItem.manager}}</p>
            </li>
          </ul>
        </div>


    </div>
    `,
        data: function() {
            return {
                currentItem: {
                    id: -1,
                    name: '',
                    description: '',
                    manager: "",
                },
                canEdit:false
            }
        },
        methods: {
            edit() {
                document.location.href = '/projects/edit?id='+this.currentItem.id
            },
        },
        mounted() {
            axios.get("/projects/get", {
                    params: {
                        id: this.projectid
                    }
                })
                .then(response => {
                    this.currentItem.id = response.data.id;
                    this.currentItem.name = response.data.name;
                    this.currentItem.description = response.data.description;
                    this.currentItem.manager = response.data.manager;

                    window.document.title = this.currentItem.name 
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
    });

new Vue({
    el: '#Project',
});