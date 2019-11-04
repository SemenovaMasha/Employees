export default Vue.component('bonusDetails', {
    template: `
    <div>
      <b-form @submit="onSubmit" @reset="onReset" class="col-sm-10 ">
         <div class="form-group row ">
              <label for="project" class="col-sm-4 col-form-label required">Проект</label>         
              <v-select  placeholder=" " v-model="currentItem.project" as="name::id" :from="allProjects" tagging class="col-sm-8" ></v-select>              
              <div class="invalid-feedback col-sm-8 offset-sm-4"" style="display:block" v-if="!currentItem.project || (currentItem.project.name == ' ')">Выберите проект</div>
        </div>

        <div class="form-group row ">
          <label for="deltaPercent" class="col-sm-4 col-form-label">Процент оклонения затраченного времени от оценочного времени</label>
          <b-form-input class="col-sm-8" type=number step="0.01"
            id="deltaPercent"
            v-model="currentItem.deltaPercent"
            required
            placeholder=""        
          ></b-form-input>     
        </div>
        <div class="form-group row ">
          <label for="bonusPercent" class="col-sm-4 col-form-label">Процент премирования (депремирования)</label>
          <b-form-input class="col-sm-8" type=number step="0.01"
            id="bonusPercent"
            v-model="currentItem.bonusPercent"
            required
            placeholder=""        
          ></b-form-input>     
        </div>

        <div class="form-group row ">
          <label for="noCoef" class="col-sm-4 col-form-label">Не применять коэффициент</label>
            <b-form-checkbox v-model="currentItem.noCoef" @change="noCoefChanged">
            </b-form-checkbox>    
        </div>
  
        <div class="form-group row ">
          <label for="coef" class="col-sm-4 col-form-label">Коэффициент</label>
          <b-form-input class="col-sm-8" type=number step="0.01" :readonly="currentItem.noCoef"
            id="coef"
            v-model="currentItem.coef"
            required
            placeholder=""        
          ></b-form-input>     
        </div>

        <div class="form-group">
          <b-button size="sm" type="submit" variant="primary">
            {{currentItem.id == -1?"Добавить":"Сохранить"}}</b-button>
          <b-button size="sm" type="reset" variant="danger"> 
            {{currentItem.id == -1?"Очистить":"Отменить"}}</b-button>
        </div>
      </b-form>

    </div>
    `,
    data: function (){         
      return {
        currentItem: {
            key: -1,
            id: -1,
            project: '',
            projectId: -1,
            deltaPercent: 0,
            bonusPercent: 0,
            coef: 1,
            noCoef: true,
          },
        allProjects: [],
      }
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault()

            this.currentItem.projectId = this.currentItem.project.id
            this.currentItem.project = this.currentItem.project.name
            if (this.currentItem.id == -1) {
                axios.post("/bonusSettings/Add", Object.assign({}, this.currentItem))
                    .then(response => {
                        this.eventHub.$emit('saveNewBonus', response.data)
                        this.resetValues()
                    })
            } else {
                axios.post("/bonusSettings/Update", Object.assign({}, this.currentItem))
                    .then(response => {
                        this.eventHub.$emit('updateBonus', { data: response.data, key: this.key })
                        this.resetValues()
                    })
            }
        },
        onReset(evt) {
            evt.preventDefault()
            this.resetValues()
        },
        resetValues() {
            this.currentItem.key = -1
            this.currentItem.id = -1
            this.currentItem.deltaPercent = 0
            this.currentItem.bonusPercent = 0
            this.currentItem.coef = 1
            this.currentItem.noCoef = true
            this.currentItem.project = ''
            this.currentItem.projectId = -1
        },
        noCoefChanged(value) {
            if (value) {
                this.currentItem.coef = 1
            }
        }
    },
    mounted(){
      this.eventHub.$on('editBonus', data => {
            this.currentItem.key = data.key
          this.currentItem.id = data.id
          this.currentItem.deltaPercent = data.deltaPercent
          this.currentItem.bonusPercent = data.bonusPercent
          this.currentItem.coef = data.coef
          this.currentItem.noCoef = data.noCoef
          this.currentItem.projectId = data.projectId

          this.currentItem.project = {};
          this.currentItem.project.name = data.project
          this.currentItem.project.id = data.projectId
        })

        axios.get("/projects/GetAll")
            .then(response => {
                this.allProjects = response.data
            })
    },
    components: {
        vSelect: VueSelect.vSelect,
    },
  })
