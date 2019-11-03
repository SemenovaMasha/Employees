Vue.component('projectedit', {
    props: ["projectid"],
    template: `
    <div>
        <legend>{{currentItem.id == ''?"Новый проект":"Редактирование проекта"}}</legend>
      <b-form @submit="onSubmit" class="col-sm-9">
        <div class="form-group row ">
          <label for="name" class="col-sm-4 col-form-label required">Название</label>
          <b-form-input class="col-sm-8"
            id="name"
            v-model="currentItem.name"
            required
            placeholder="Название"        
          ></b-form-input>     
        </div>

        <div class="form-group row ">
          <label for="description" class="col-sm-4 col-form-label">Описание</label>          
         <b-form-textarea class="col-sm-8"
              id="description"
              v-model="currentItem.description"
              placeholder=""
              rows="3"
            ></b-form-textarea>
        </div>

        <div class="form-group row"  v-if="isAdmin">
          <label for="manager" class="col-sm-4 col-form-label required">Менеджер</label>         
            <v-select placeholder=" " v-model="currentItem.manager" as="fio::id" :from="allManagers" tagging  class="col-sm-8"></v-select>  
            <div class="invalid-feedback col-sm-8 offset-sm-4"" style="display:block" v-if="!this.currentItem.manager || (this.currentItem.manager.fio == ' ')">Выберите менеджера проекта</div>
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
                id: -1,
                name: '',
                description: '',
                manager: '',
                managerId: -1,
            },
            allManagers: [],
        }
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault()
            
            if (this.currentItem.manager && this.currentItem.manager != ' ' && this.currentItem.manager.id !=-1) {
                this.currentItem.managerId = this.currentItem.manager.id
                this.currentItem.manager = this.currentItem.manager.fio
                if (this.currentItem.id == '') {
                    axios.post("/projects/Add", Object.assign({}, this.currentItem))
                        .then(response => {
                            document.location.href = '/projects/details?id=' + response.data.id
                        })
                } else {
                    axios.post("/projects/Update", Object.assign({}, this.currentItem))
                        .then(response => {
                            document.location.href = '/projects/details?id=' + response.data.id
                        })
                }
            }
        },
    },
    mounted() {
        axios.get("/employees/GetAllManagers")
            .then(response => {
                this.allManagers = response.data
            })

        axios.get("/projects/get", {
                params: {
                    id: this.projectid
                }
            })
            .then(response => {
                this.currentItem.id = response.data.id;
                this.currentItem.managerId = response.data.managerId;
                this.currentItem.name = response.data.name;
                this.currentItem.description = response.data.description;
                if (response.data.manager) {
                    this.currentItem.manager = {
                        id: response.data.managerId,
                        fio: response.data.manager
                    };
                } else {
                    this.currentItem.manager = {
                        id: -1,
                        fio: ' '
                    };
                }

                window.document.title = this.currentItem.name || "Новый проект"
            })
        
        axios.get("/employees/isAdmin")
            .then(response => {
                this.isAdmin = response.data
            })
    },
    components: {
        vSelect: VueSelect.vSelect,
    },
})
new Vue({
    el: '#Project',
})