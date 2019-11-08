Vue.component('analitics',
{
    template: `
    <div>
        <div class="form-group row">
            <label for="reportType" class="col-sm-2 col-form-label ">Вид отчета</label> 
            <b-form-select v-model="reportType" :options="reportTypes" class="col-sm-8" disable="true"></b-form-select>
        </div>              

        <div class="form-group row" v-if="reportType!='OverTime'">
            <label for="project" class="col-sm-2 col-form-label ">Проект</label>         
            <v-select placeholder=" " v-model="project" as="name::id" :from="allProjects" tagging class="col-sm-4" ></v-select>  
            <div class="invalid-feedback col-sm-8 offset-sm-2"" style="display:block" v-if="(reportType == 'MatchEstimate'||reportType == 'NotMatchEstimate') && !project">Для выбранного типа отчета необходимо выбрать проект</div>    

        </div>              

        <div class="form-group row"  v-if="reportType!='MatchEstimate' && reportType!='NotMatchEstimate' && reportType!='OverTime'">
            <label for="user" class="col-sm-2 col-form-label ">Сотрудник</label>         
            <v-select placeholder=" " v-model="user" as="fio::id" :from="allUsers" tagging class="col-sm-4" v-if="(project && (project.managerId==currentUser.id))"></v-select> 
            <b-form-input readonly class="col-sm-4" :value="user ? user.fio :''" v-else></b-form-input> 
        </div>  

        <div class="form-group row">
            <label for="user" class="col-sm-1 col-form-label ">Период</label>     
            <label for="user" class="col-form-label ">c</label>  
             <date-picker name="date" v-model="startDate" lang="ru" format="DD.MM.YYYY" class="col-sm-2" placeholder=" "></date-picker>
               
            <label for="user" class="col-form-label ">по</label>  
            <date-picker name="date" v-model="endDate" lang="ru" format="DD.MM.YYYY" class="col-sm-2" placeholder=" "></date-picker>
        </div>  

        <div class="form-group row">
            <b-button  @click="formReport()"  variant="success" class="col-sm-2">Сформировать</b-button>
        </div>

         <b-table striped show-empty :items="reportTableData" >
             <template v-slot:empty="scope"><div style="text-align: center;">Нет записей для отображения</div></template>

              <template v-slot:head()="data">{{data.label.charAt(0).toUpperCase() + data.label.slice(1)}}</template>
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

            reportTypes: [],
            allReportTypes: [
                { value: 'Labors', text: 'Отчет «Трудозатраты» сотрудников' },
                { value: 'MatchEstimate', text: 'Отчет по сотрудникам, укладывающимся в оценочное время' },
                { value: 'NotMatchEstimate', text: 'Отчет по сотрудникам, не укладывающимся в оценочное время' },
                { value: 'OverTime', text: 'Отчет по сотрудникам, отработавшим сверх нормы' },
                { value: 'TaskTypes', text: 'Распределение времени сотрудника по типам задач' },
                { value: 'TaskTimes', text: 'Отчет об оценочном и фактическом затраченном времени на задачу' },
                { value: 'Bonus', text: 'Bonus' },
            ],
            employeeReportTypes: [
                { value: 'Labors', text: 'Отчет «Трудозатраты» сотрудников' },
            ],
            reportTableData: [],
            isManager: false,
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
                this.reportTypes = this.allReportTypes
            } else {
                this.user = {
                    id: this.currentUser.id,
                    fio: this.currentUser.fio,
                }
                this.allUsers = [this.user]
                if (this.isManager)
                    this.reportTypes = this.allReportTypes
                else {
                    this.reportTypes = this.employeeReportTypes
                    this.reportType = 'Labors'
                }
            }
        },
        'reportType': function (newVal, oldVal) {
            if (this.reportType != 'Labors') {
                axios.get("/projects/GetProjectByManager", {
                    params: {
                        id: this.currentUser.id
                    }
                }).then(response => {
                    this.allProjects = response.data
                    if (this.project) {
                        if (this.allProjects.filter(item => { return item.id != this.project.id }).lenght == 0) {
                            this.project = ''
                        }
                    }                    
                })
            } else {
                axios.get("/projects/GetAllMine").then(response => {
                    this.allProjects = response.data
                    if (this.project) {
                        if (this.allProjects.filter(item => { return item.id != this.project.id }).lenght == 0) {
                            this.project = ''
                        }
                    }
                })

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

        axios.get("/employees/isManager")
            .then(response => {
                this.isManager = response.data
                if (this.isManager)
                    this.reportTypes = this.allReportTypes
                else
                    this.reportTypes = this.employeeReportTypes
            })

    },
    methods: {
        formReport() {
            if ((this.reportType == 'MatchEstimate' || this.reportType == 'NotMatchEstimate') && !this.project)
                return

            axios.get("/reports/GetReportTable", {
                params: {
                    reportType: this.reportType,
                    userId: this.user ? this.user.id : '',
                    projectId: this.project ? this.project.id : -1,
                    startDate: new Date(this.startDate),
                    endDate: new Date(this.endDate),
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
