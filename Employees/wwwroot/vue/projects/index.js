
new Vue({
    el: '#Projects',
    template: `
    <div>
       <div style="margin-bottom: 10px" > 
            <div class="form-group row ">
                <b-button  @click="addProject()"  variant="success" class="col-sm-2" v-if="isAdmin">
                  <i class="fas fa-plus"> Добавить</i>
                </b-button>

                <b-form-radio-group  v-model="allProjectsRadio" name="radioAllProjects" @change="changeAllProjects"  class="col-sm-4 offset-sm-1" style="padding-top: 7px;">
                    <b-form-radio value="mine">Мои проекты</b-form-radio>
                    <b-form-radio value="all">Все проекты</b-form-radio>
              </b-form-radio-group>
            </div>
        </div>


    <b-table striped show-empty :items="filtered"  :fields="fields">

      <template v-slot:cell(actions)="props">    
        <b-button size="sm"  @click="deleteProject(props.item, props.index, $event.target)" class="mr-2"  variant="outline-danger" >
          <i class="fas fa-trash-alt"></i>
        </b-button>
      </template>

      <template v-slot:cell(name)="props">    
       <a :href="'/projects/details?id='+props.item.id">{{props.item.name}} </a>
      </template>
      
      <template v-slot:top-row="props">
        <td v-for="field in props.fields" :key="field.key">
          <b-form-input v-model="filters[field.key]" size="sm" :placeholder="field.label"  v-if="filters[field.key] != undefined">
          </b-form-input>      
        </td>
      </template>  

      <template v-slot:table-colgroup="scope">
        <col
          v-for="field in scope.fields"
          :key="field.key"
          :style="{ width: field.width+'%' }"
        >
      </template>

    </b-table>

    <b-modal
      id="delete-modal"     
      title="Удаление проекта"
      @ok="deleteConfirm"
    >
      <template v-slot:modal-ok="props">
        Да
      </template>
      <template v-slot:modal-cancel="props">
        Нет
      </template>
      <template v-slot:default="{ hide }">
        Вы уверены, что хотите удалить запись?
      </template>
    </b-modal>
    </div>
    `,
    data: function () {
        return {
            allProjectsRadio: 'mine',
            isAdmin: false,
            fields: [
                {
                    key: 'name',
                    label: 'Название',
                    sortable: true,
                    width: 6
                },
                {
                    key: 'description',
                    label: 'Описание',
                    sortable: true,
                    width: 4
                },
                {
                    key: 'manager',
                    label: 'Менеджер',
                    sortable: true,
                    width: 4
                },
                {
                    key: 'actions',
                    label: '',
                    width: 1,
                    tdClass: 't',
                }
            ],
            allProjects: [],
            filters: {
                name: '',
                description: '',
                manager: '',
            },
            deletedId: ''
        }
    },
    computed: {
        filtered() {
            const filtered = this.allProjects.filter(item => {
                return Object.keys(this.filters).every(key =>
                    String(item[key]).toLowerCase().includes(this.filters[key].toLowerCase()))
            })
            return filtered.length > 0 ? filtered : []
        }
    },

    mounted() {
        //axios.get("/projects/GetAll")
        //    .then(response => {
        //        this.allProjects = response.data
        //    })

        if (this.allProjectsRadio == 'mine') {
            axios.get("/projects/GetAllMine")
                .then(response => {
                    this.allProjects = response.data
                })
        } else {
            axios.get("/projects/GetAll")
                .then(response => {
                    this.allProjects = response.data
                })
        }

        axios.get("/employees/isAdmin")
            .then(response => {
                this.isAdmin = response.data
                if (!this.isAdmin)
                    this.fields = this.fields.filter(item => { return item.key != 'actions' && item.key != 'salary' });
            })
    },
    methods: {
        changeAllProjects(value) {
            if (value == 'mine') {
                axios.get("/projects/GetAllMine")
                    .then(response => {
                        this.allProjects = response.data
                    })
            } else {
            axios.get("/projects/GetAll")
                .then(response => {
                    this.allProjects = response.data
                })
            }
        },
        deleteProject(item) {
            this.deletedId = item.id
            this.$bvModal.show('delete-modal')
        },
        deleteConfirm(bvModalEvt) {
            axios.get("/projects/delete", {
                    params: {
                        id: this.deletedId
                    }
                })
                .then(response => {
                    this.allProjects = this.allProjects.filter(item => { return item.id != response.data.id });
                })

        },
        addProject() {
            document.location.href = '/projects/edit?id=-1' 
        },
    }
})
