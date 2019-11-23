Vue.component('taskmodelSub', {
    props: ["taskmodelid"],
    template: `
    <div>
        <div class="card mb-3">
          <h6 class="card-header">Подзадачи</h6>          

             <div class="card-body">
                <div style="margin-bottom: 10px"  >       
                <b-button  @click="addEmployeeToTeam()"  variant="success" >
                  <i class="fas fa-plus"> Добавить подзадачу</i>
                </b-button>
                </div>

                  <b-table striped show-empty :items="filtered"  :fields="fields">

               <template v-slot:cell(taskNumber)="props">    
                   <a :href="'/taskmodels/details?id='+props.item.id">{{props.item.taskNumber}} </a>
                  </template>

              <template v-slot:cell(progress)="props">    
                   <b-progress>
                      <b-progress-bar :max="props.item.progressMax" :value="props.item.progressValue" :variant="progressVariant(props.item.progressValue,props.item.progressMax)" >{{ props.item.progressValue }}/{{ props.item.progressMax }}
                      </b-progress-bar>
                </b-progress>   
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
            canEdit: false,
            fields: [
                {
                    key: 'taskNumber',
                    label: 'Номер',
                    sortable: true,
                    width: 14
                },
                {
                    key: 'taskName',
                    label: 'Название',
                    sortable: true,
                    width: 4
                },
                {
                    key: 'priorityName',
                    label: 'Приоритет',
                    sortable: true,
                    width: 4
                },
                {
                    key: 'progress',
                    label: '',
                    width: 3,
                },
            ],
            allUsers:[],
            
            filters: {
                taskNumber: '',
                taskName: '',
                priorityName: '',
            },
        }
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
        addEmployeeToTeam(item, key) {
            document.location.href = '/taskmodels/edit?id=-1'
        },
        progressVariant(value, max) {
            var div = value / max * 100;

            if (div < 50) {
                return 'success'
            }
            if (div < 100) {
                return 'warning'
            }

            return 'danger'
        }
    },

    mounted() {
        axios.get("/taskmodels/GetTaskModelSub" ,{
                params: {
                    id: this.taskmodelid
                }
            })
            .then(response => {
                this.allUsers = response.data
            })
    }
})
