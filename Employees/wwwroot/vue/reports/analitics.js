Vue.component('analitics',
{
    template: `
    <div>
        <div class="form-group row ">
            <label for="reportType" class="col-sm-2 col-form-label ">Вид отчета</label> 
            <b-form-select v-model="reportType" :options="reportTypes" class="col-sm-8"></b-form-select>
        </div>              

        <div class="form-group row ">
            <label for="project" class="col-sm-2 col-form-label ">Проект</label>         
            <v-select placeholder=" " v-model="project" as="name::id" :from="allProjects" tagging class="col-sm-4" ></v-select>       
        </div>              

        <div class="form-group row "">
            <label for="user" class="col-sm-2 col-form-label ">Сотрудник</label>         
            <v-select placeholder=" " v-model="user" as="fio::id" :from="allUsers" tagging class="col-sm-4" v-if="(project && (project.managerId==currentUser.id))"></v-select> 
            <b-form-input readonly class="col-sm-4" :value="user ? user.fio :''" v-else></b-form-input> 
        </div>  

        <div class="form-group row "">
            <label for="user" class="col-sm-1 col-form-label ">Период</label>     
            <label for="user" class="col-form-label ">c</label>  
             <date-picker name="date" v-model="startDate" lang="ru" format="DD.MM.YYYY" class="col-sm-2" placeholder=" "></date-picker>
               
            <label for="user" class="col-form-label ">по</label>  
            <date-picker name="date" v-model="endDate" lang="ru" format="DD.MM.YYYY" class="col-sm-2" placeholder=" "></date-picker>
        </div>  

        <div class="form-group row ">
            <b-button  @click="formReport()"  variant="success" class="col-sm-2">Сформировать</b-button>
        </div>

         <b-table striped show-empty :items="reportTableData" >
             <template v-slot:empty="scope"><div style="text-align: center;">Нет записей для отображения</div></template>
        </b-table>

    
    </div>
    `,
    data: function () {
        return {
            currentUser: {},
            allProjects: [],
            allUsers: [],

            reportType: 'Labors',
            user: '',
            userId: '',
            project: '',
            projectId: '',
            startDate: moment().startOf('month'),
            endDate: moment().endOf('month'),
            monthDate: null,

            reportTypes: [
                { value: 'Labors', text: 'Отчет «Трудозатраты» сотрудников' },
                { value: 'MatchEstimate', text: 'Отчет по сотрудникам, укладывающимся в оценочное время' },
                { value: 'NotMatchEstimate', text: 'Отчет по сотрудникам, не укладывающимся в оценочное время' },
                { value: 'OverTime', text: 'Отчет по сотрудникам, не укладывающимся в оценочное время' },
                { value: 'TaskTypes', text: 'Распределение времени сотрудника по типам задач' },
                { value: 'TaskTimes', text: 'Отчет об оценочном и фактическом затраченном времени на задачу' },
            ],
            reportTableData:[]
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
        formReport() {
            axios.get("/reports/GetReportTable", {
                params: {
                    id: this.project.id
                }
            }).then(response => {
                this.reportTableData = response.data
            })
        }
    },
    components: {
        vSelect: VueSelect.vSelect,
    },
})

new Vue({
    el: '#Analitics',
    template: '<analitics></analitics>'
});
