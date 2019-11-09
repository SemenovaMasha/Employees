
Vue.component('finance',
{
    template: `
    <div>
        <div class="form-group row">
            <label for="reportType" class="col-sm-2 col-form-label ">Вид отчета</label> 
            <b-form-select v-model="reportType" :options="reportTypes" class="col-sm-8" disable="true"></b-form-select>
        </div>              

        <div class="form-group row" v-if="reportType!='Salary'">
            <label for="project" class="col-sm-2 col-form-label ">Проект</label>         
            <v-select placeholder=" " v-model="project" as="name::id" :from="allProjects" tagging class="col-sm-4" ></v-select>  

        </div>              

        <div class="form-group row" >
            <label for="user" class="col-sm-2 col-form-label ">Сотрудник</label>         
            <v-select placeholder=" " v-model="user" as="fio::id" :from="allUsers" tagging class="col-sm-4" v-if="(reportType=='Salary' ||(project && (project.managerId==currentUser.id)))"></v-select> 
            <b-form-input readonly class="col-sm-4" :value="user ? user.fio :''" v-else></b-form-input> 
            <div class="invalid-feedback col-sm-8 offset-sm-2"" style="display:block" v-if="(reportType == 'Salary') && !user">Для выбранного типа отчета необходимо выбрать сотрудника</div>    

        </div>  

        <div class="form-group row">
            <label for="user" class="col-sm-1 col-form-label ">Период</label>     
            <date-picker type="month" name="date" v-model="monthDate" lang="ru" format="MM.YYYY" class="col-sm-2" placeholder=" "></date-picker> 
            <div class="col-sm-9 "></div>
            <div class="invalid-feedback col-sm-8 offset-sm-1"" style="display:block" v-if="reportType=='Salary'&&!monthDate">Выберите месяц</div>    

        </div>  

        <div class="form-group row">
            <b-button  @click="formReport()"  variant="success" class="col-sm-2"  v-if="reportType!='Salary'">Сформировать</b-button>
            <b-button-group style="margin-left: 10px;">
                <b-dropdown right text="Экспорт" variant="info">
                  <b-dropdown-item  @click="exportPdf()" >PDF</b-dropdown-item>
                  <b-dropdown-item  @click="exportExcel()"  v-if="reportType!='Salary'">Excel</b-dropdown-item>
                </b-dropdown>
              </b-button-group>
        </div>
        <div class="form-group row">
           
        </div>

         <b-table striped show-empty :items="reportTableData"   v-if="reportType!='Salary'">
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

            reportType: 'Salary',
            user: '',
            userId: '',
            project: '',
            projectId: '',
            startDate: moment().startOf('month'),
            endDate: moment().endOf('month'),
            monthDate: moment().startOf('month'),

            reportTypes: [],
            allReportTypes: [
                { value: 'Salary', text: 'Итоговый отчет по заработной плате сотрудника за определенный месяц' },
                { value: 'Bonus', text: 'Отчет о сумме премирования' },
            ],
            employeeReportTypes: [
                { value: 'Salary', text: 'Итоговый отчет по заработной плате сотрудника за определенный месяц' },
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
                    this.reportType = 'Salary'
                }
            }
        },
        'reportType': function (newVal, oldVal) {
            if (this.reportType != 'Salary') {
                axios.get("/Employees/GetAll").then(response => {
                    this.allUsers = response.data

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
        axios.get("/Employees/GetAll").then(response => {
            this.allUsers = response.data

        })
    },
    methods: {
        getSettings() {
            //console.log(moment(this.monthDate).endOf('month'))
            return {
                reportType: this.reportType,
                userId: this.user ? this.user.id : '',
                projectId: this.project ? this.project.id : -1,
                startDate: this.monthDate?new Date(moment(this.monthDate).startOf('month')):null,
                endDate: this.monthDate?new Date(moment(this.monthDate).endOf('month')):null,
            };
        },
        formReport() {
            if ((this.reportType == 'Salary') && !this.user)
                return

            axios.get("/reports/GetReportTable", {
                params: this.getSettings()
            }).then(response => {
                this.reportTableData = response.data
            })
        },
        exportPdf() {
            if (this.reportType == 'Salary' &&( !this.monthDate || !this.user))
                return

            if (this.reportType != 'Salary') {
                axios.post("/reports/exportPdf",
                    this.getSettings(),
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/pdf'
                        },
                        responseType: "blob"
                    }).then((response) => {
                    var filename = this.allReportTypes.filter(item => { return item.value == this.reportType })[0].text;

                    var blob = new Blob([response.data], { type: "application/pdf" });
                    var link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = filename + moment(new Date()).format(" DD-MM-YYYY") + ".pdf";
                    link.click();
                });
            } else {
                axios.post("/reports/exportSalaryPdf",
                    this.getSettings(),
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/pdf'
                        },
                        responseType: "blob"
                    }).then((response) => {
                    var filename = this.allReportTypes.filter(item => { return item.value == this.reportType })[0].text;

                    var blob = new Blob([response.data], { type: "application/pdf" });
                    var link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = filename + moment(new Date()).format(" DD-MM-YYYY") + ".pdf";
                    link.click();
                });
            }
        },
        exportExcel() {
            axios.post("/reports/exportExcel",
                this.getSettings(),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    },
                    responseType: "blob"
                }).then((response) => {
                    var filename = this.allReportTypes.filter(item => { return item.value == this.reportType })[0].text;

                    var blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                    var link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = filename + moment(new Date()).format(" DD-MM-YYYY") + ".xlsx";
                    link.click();
                });
        },
    },
    components: {
        vSelect: VueSelect.vSelect,
        //VueMonthlyPicker
        //monthPicker: VueMonthlyPicker
    },
})

new Vue({
    el: '#Finance',
    template: '<finance></finance>'
});
