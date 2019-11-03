Vue.component('employeeedit', {
    props: ["employeeid"],
    template: `
    <div>
        <legend>{{currentItem.id == ''?"Новый сотрудник":"Редактирование сотрудника"}}</legend>
      <b-form @submit="onSubmit" class="col-sm-9">
        <div class="form-group row ">
          <label for="fio" class="col-sm-4 col-form-label required">ФИО</label>
          <b-form-input class="col-sm-8"
            id="fio"
            v-model="currentItem.fio"
            required
            placeholder="ФИО"        
          ></b-form-input>     
        </div>
        <div class="form-group row ">
          <label for="positionMinSalary" class="col-sm-4 col-form-label required">Дата рождения</label>
         <date-picker name="birthDate" v-model="currentItem.birthDate" lang="ru" format="DD.MM.YYYY" class="col-sm-8" placeholder=" "
                                    style="padding-left:0px;padding-right:0px;"></date-picker>

        <div class="invalid-feedback col-sm-8 offset-sm-4"" style="display:block" v-if="!this.currentItem.birthDate ">Выберите дату</div>
        

        </div>

        <div class="form-group row ">
          <label for="passportSeriesNumber" class="col-sm-4 col-form-label required">Номер и серия паспорта</label>
          <b-form-input class="col-sm-8"
            id="passportSeriesNumber"
            v-model="currentItem.passportSeriesNumber"
            required
            placeholder="Номер и серия"        
          ></b-form-input>     
        </div>
        <div class="form-group row ">
          <label for="passportGiven" class="col-sm-4 col-form-label required">Когда и кем выдан</label>          
         <b-form-textarea class="col-sm-8"
              id="passportGiven"
              v-model="currentItem.passportGiven"
              placeholder="Выдан"
                required
              rows="2"
            ></b-form-textarea>
        </div>

        <div class="form-group row ">
          <label for="address" class="col-sm-4 col-form-label">Адрес проживания</label>          
         <b-form-textarea class="col-sm-8"
              id="address"
              v-model="currentItem.address"
              placeholder=""
              rows="2"
            ></b-form-textarea>
        </div>
        <div class="form-group row ">
          <label for="education" class="col-sm-4 col-form-label">Образование</label>          
         <b-form-textarea class="col-sm-8"
              id="education"
              v-model="currentItem.education"
              placeholder=""
              rows="2"
            ></b-form-textarea>
        </div>

        <div class="form-group row " v-if="isAdmin">
          <label for="position" class="col-sm-4 col-form-label required">Должность</label>         
            <v-select placeholder=" " v-model="currentItem.position" as="name::id" :from="allPositions" tagging  class="col-sm-8"></v-select>
  
        <div class="invalid-feedback col-sm-8 offset-sm-4"" style="display:block" v-if="!this.currentItem.position || (this.currentItem.position.name == ' ')">Выберите должность</div>
        </div>
        <div class="form-group row " v-if="isAdmin">
          <label for="salary" class="col-sm-4 col-form-label required">Оклад</label>
          <b-form-input class="col-sm-8"  type=number step="0.01"
            id="salary"
            v-model="currentItem.salary"
            required
            placeholder="Оклад"        
          ></b-form-input>     
        </div>

        <div class="form-group row ">
          <label for="additionalInfo" class="col-sm-4 col-form-label">Дополнительная информация</label>          
         <b-form-textarea class="col-sm-8"
              id="additionalInfo"
              v-model="currentItem.additionalInfo"
              placeholder=""
              rows="2"
            ></b-form-textarea>
        </div>


        <div class="form-group row " v-if="isAdmin">
          <label for="role" class="col-sm-4 col-form-label">Роль</label>  
         <b-form-radio-group
            id="role"
            v-model="currentItem.role"
            :options="allRoles"
            name="radio-options"
          ></b-form-radio-group>
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
                id: '',
                position: '',
                positionId: -1,
                fio: "",
                education: "",
                birthDate: null,
                passportGiven: "",
                passportSeriesNumber: "",
                additionalInfo: "",
                address: "",
                role: 'Сотрудник',
                salary: 0,
            },
            allPositions: [],
            allRoles: [
                { text: 'Сотрудник' },
                { text: 'Менеджер' },
                { text: 'Администратор' },
            ]
        }
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault()
            
            if (this.currentItem.position && this.currentItem.birthDate && this.currentItem.position != ' ' && this.currentItem.position.id !=-1) {
                this.currentItem.positionId = this.currentItem.position.id
                this.currentItem.position = this.currentItem.position.name
                if (this.currentItem.id == '') {
                    axios.post("/employees/Add", Object.assign({}, this.currentItem))
                        .then(response => {
                            document.location.href = '/employees/details?id=' + response.data.id
                        })
                } else {
                    axios.post("/employees/Update", Object.assign({}, this.currentItem))
                        .then(response => {
                            document.location.href = '/employees/details?id=' + response.data.id
                        })
                }
            }
        },
    },
    mounted() {
        axios.get("/position/GetAll")
            .then(response => {
                this.allPositions = response.data
            })

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
                this.currentItem.birthDate = response.data.birthDate?new Date(response.data.birthDate):'';
                this.currentItem.passportGiven = response.data.passportGiven;
                this.currentItem.passportSeriesNumber = response.data.passportSeriesNumber;
                this.currentItem.additionalInfo = response.data.additionalInfo;
                this.currentItem.address = response.data.address;
                this.currentItem.role = response.data.role;
                //this.currentItem.position = response.data.position;
                if (response.data.position) {
                    this.currentItem.position = {
                        id: response.data.positionId,
                        name: response.data.position
                    };
                } else {
                    this.currentItem.position = {
                        id: -1,
                        name: ' '
                    };
                }
                this.currentItem.salary = response.data.salary;

                window.document.title = this.currentItem.fio || "Новый сотрудник"
            })

        axios.get("/employees/ListReadonly")
            .then(response => {
                this.isAdmin = !response.data
            })
    },
    components: {
        vSelect: VueSelect.vSelect,
    },
})
new Vue({
    el: '#Employee',
})