Vue.component('analitics',
{
    template: `
    <div>

        <div class="form-group row ">
            <label for="project" class="col-sm-4 col-form-label required">Проект</label>         
            <v-select placeholder=" " v-model="project" as="name::id" :from="allProjects" tagging class="col-sm-8" ></v-select>       
        </div>              

        <div class="form-group row "">
            <label for="user" class="col-sm-4 col-form-label required">Сотрудник</label>         
            <v-select placeholder=" " v-model="user" as="fio::id" :from="allUsers" tagging class="col-sm-8" v-if="(project && (project.managerId==currentUser.id))"></v-select> 
            <b-form-input readonly class="col-sm-8" :value="user ? user.fio :''" v-else></b-form-input> 
        </div>  
    </div>
    `,
    data: function () {
        return {
            currentUser: {},
            allProjects: [],
            allUsers: [],

            reportType: '',
            user: '',
            userId: '',
            project: '',
            projectId: '',
            startDate: null,
            endDate: null,
            monthDate: null,
        }
    },
    watch: {
        'project': function (newVal, oldVal) {
            
            if (this.project && (this.project.managerId == this.currentUser.id)) {
                axios.get("/projects/GetProjectUsers", {
                    params: {
                        id: this.project.id
                    }                   
                }).then(response => {
                    this.allUsers = response.data

                    if (this.allUsers.filter(item => { return item.id != this.user.id }).lenght == 0) {
                        this.user = {
                            id: this.currentUser.id,
                            fio: this.currentUser.fio,
                        }
                    }
                })
            } else {
                this.user = {
                    id: this.currentUser.id,
                    fio: this.currentUser.fio,                    
                }
                this.allUsers = [this.user]
            }
        },
    },
    computed: {

    },
    mounted() {
        axios.get("/employees/GetCurrentUser").then(response => {
                this.currentUser = response.data
                this.user = {
                    id: this.currentUser.id,
                    fio: this.currentUser.fio,
                }
            })

        axios.get("/projects/GetAllMine").then(response => {
            this.allProjects = response.data
        })


    },
    methods: {
            
    },
    components: {
        vSelect: VueSelect.vSelect,
    },
})

new Vue({
    el: '#Analitics',
    template: '<analitics></analitics>'
});
