export default Vue.component('positionDetails', {
    template: `
    <div>
      <b-form @submit="onSubmit" @reset="onReset" class="col-sm-6 ">
        <div class="form-group row ">
          <label for="positionName" class="col-sm-4 col-form-label">Наименование</label>
          <b-form-input class="col-sm-8"
            id="positionName"
            v-model="currentItem.name"
            required
            placeholder="Наименование"        
          ></b-form-input>     
        </div>
        <div class="form-group row ">
          <label for="positionMinSalary" class="col-sm-4 col-form-label">Минимальная ставка</label>
          <b-form-input class="col-sm-8"  type=number step="0.01"
            id="positionMinSalary"
            v-model="currentItem.minSalary"
            required
            placeholder="Минимальная ставка"        
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
            name: '',
            minSalary: 0
        }
      }
    },
    methods: {
      onSubmit(evt) {
        evt.preventDefault()

        if(this.currentItem.id == -1){
          axios.post("/position/Add", Object.assign({}, this.currentItem))
          .then(response => {
            this.eventHub.$emit('saveNewPosition', response.data)          
            this.resetValues() 
          })   
        }else{
          axios.post("/position/Update", Object.assign({}, this.currentItem))
          .then(response => {
            this.eventHub.$emit('updatePosition', {data:response.data, key:this.key})          
            this.resetValues() 
          })   
        }      
      },
      onReset(evt) {
        evt.preventDefault()
        this.resetValues()    
      },
      resetValues(){
        this.currentItem.key = -1
        this.currentItem.id = -1
        this.currentItem.name = ''
        this.currentItem.minSalary = 0
      }
    },
    mounted(){
      this.eventHub.$on('editPosition', data => {
        this.currentItem.key = data.key
        this.currentItem.id = data.id
        this.currentItem.name = data.name
        this.currentItem.minSalary = data.minSalary
        })
    }
  })
