Vue.component('employeedetails',
    {
        props: ["employeeid"],
        template: `
    <div>
       <div class="card mb-3">
          <h3 class="card-header">{{currentItem.fio||'Сотрудник'}} 
            <b-button size="sm" @click="edit()" class="mr-2"  variant="outline-primary" v-if="canEdit">
              <i class="fas fa-edit"></i>
            </b-button>
            </h3>
          <div class="card-body">
            <h5 class="card-title">{{currentItem.position}} <slot v-if="canEdit">, оклад: {{currentItem.salary}}р.</slot></h5>
            <h6 class="card-subtitle text-muted">Дата рождения: {{birthDateDisplay}}</h6>
          </div>
          <div class="card-body">
            <p class="card-text">{{currentItem.education}}</p>
          </div>   
          <ul class="list-group list-group-flush">
            <li class="list-group-item">
                <p class="card-text">Серия и номер паспорта: {{currentItem.passportSeriesNumber}}</p>
                <p class="card-text">Выдан: {{currentItem.passportGiven}}</p>
            </li>
            <li class="list-group-item">
                <p class="card-text">Адрес: {{currentItem.address}}</p>
            </li>
          </ul>
          <div class="card-footer text-muted">
            {{currentItem.role}}
          </div>
        </div>
        <div class="card" v-if="currentItem.additionalInfo">
          <div class="card-body">            
            <p class="card-text" style="white-space: pre-line;">{{currentItem.additionalInfo}}</p>
          </div>
    </div>

    </div>
    `,
        data: function() {
            return {
                currentItem: {
                    id: '',
                    positionId: null,
                    position: '',
                    fio: "",
                    education: "",
                    birthDate: null,
                    passportGiven: "",
                    passportSeriesNumber: "",
                    additionalInfo: "",
                    address: "",
                    role: 'Employee',
                    salary: 0,
                },
                canEdit:false
            }
        },
        computed: {
            birthDateDisplay() {
                if (!this.currentItem.birthDate) return ''
                var date = new Date(this.currentItem.birthDate);
                return ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('000' + (date.getFullYear())).slice(-4)
            }
        },
        methods: {
            edit() {
                document.location.href = '/employees/edit?id='+this.currentItem.id
            },
        },
        mounted() {
            axios.get("/employees/get", {
                    params: {
                        id: this.employeeid
                    }
                })
                .then(response => {
                    this.currentItem.id = response.data.id;
                    this.currentItem.positionId = response.data.positionId;
                    this.currentItem.fio = response.data.fio;
                    this.currentItem.education = response.data.education;
                    this.currentItem.birthDate = response.data.birthDate;
                    this.currentItem.passportGiven = response.data.passportGiven;
                    this.currentItem.passportSeriesNumber = response.data.passportSeriesNumber;
                    this.currentItem.additionalInfo = response.data.additionalInfo;
                    this.currentItem.address = response.data.address;
                    this.currentItem.role = response.data.role;
                    this.currentItem.position = response.data.position;
                    this.currentItem.salary = response.data.salary;

                    window.document.title = this.currentItem.fio 
                })
            
            axios.get("/employees/canEditUser", {
                    params: {
                        id: this.employeeid
                    }
                })
                .then(response => {
                    this.canEdit = response.data
                })

            //this.eventHub.$on('editPosition',
            //    data => {
            //        this.currentItem.key = data.key
            //        this.currentItem.id = data.id
            //        this.currentItem.name = data.name
            //        this.currentItem.minSalary = data.minSalary
            //    })
        }
    });

new Vue({
    el: '#Employee'
})