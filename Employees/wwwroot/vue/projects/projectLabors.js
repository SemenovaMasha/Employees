Vue.component('projectLabors', {
    props: ["projectid"],
    template: `
    <div>
        <div class="card mb-3">
          <h6 class="card-header">Трудозатраты проекта</h6>    
             <div class="card-body">            

                <div class="form-group row">
                    <label for="user" class="col-sm-1 col-form-label ">Период</label>     
                    <label for="user" class="col-form-label ">c</label>  
                     <date-picker name="date" v-model="startDate" lang="ru" format="DD.MM.YYYY" class="col-sm-2" placeholder=" "></date-picker>
               
                    <label for="user" class="col-form-label ">по</label>  
                    <date-picker name="date" v-model="endDate" lang="ru" format="DD.MM.YYYY" class="col-sm-2" placeholder=" "></date-picker>
                </div>  


                <b-table striped show-empty :items="filtered"  :fields="fields">
               <template v-slot:cell(fio)="props">    
                   <a :href="'/employees/details?id='+props.item.id">{{props.item.fio}} </a>
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
            </div>
        </div>
  
    </div>
    `,
    data: function () {
        return {
            fields: [
                {
                    key: 'fio',
                    label: 'ФИО',
                    sortable: true,
                    width: 14
                },
                {
                    key: 'elapsedSum',
                    label: 'Затрачено минут',
                    sortable: true,
                    width: 7
                }
            ],
            startDate: moment().startOf('month'),
            endDate: moment().endOf('month'),
            allUsers: [],
            filters: {
                fio: '',
            },
        }
    },
    watch: {
        'startDate': function (newVal, oldVal) {
            this.loadData();
        },
        'endDate': function (newVal, oldVal) {
            this.loadData();
        },
    },
    computed: {
        filtered() {
            const filtered = this.allUsers.filter(item => {
                return Object.keys(this.filters).every(key =>
                    String(item[key]).toLowerCase().includes(this.filters[key].toLowerCase()))
            })
            return filtered.length > 0 ? filtered : []
        },

    },

    methods: {
        loadData() {
            axios.get("/labors/GetByProject", {
                params: {
                    projectId: this.projectid,
                    startDate: new Date(this.startDate),
                    endDate: new Date(this.endDate),
                }
            }).then(response => {
                this.allUsers = response.data
            })
        }
    },

    mounted() {
        this.loadData();
    }
})
