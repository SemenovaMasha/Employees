export default Vue.component('list', {

    template: `
    <div>
    <b-table striped show-empty :items="filtered"  :fields="fields">

      <template v-slot:cell(actions)="props">    
        <b-button size="sm"  @click="edit(props.item, props.index, $event.target)" class="mr-2" variant="outline-info">
          <i class="fas fa-edit"></i>
        </b-button>
        <b-button size="sm"  @click="deletePosition(props.item, props.index, $event.target)" class="mr-2"  variant="outline-danger" >
          <i class="fas fa-trash-alt"></i>
        </b-button>
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
      title="Удаление должности"
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
    data: function (){
      // items: [{id:1234,issuedBy:'Operator',issuedTo:'abcd-efgh'},
      // {id:5678,issuedBy:'User',issuedTo:'ijkl-mnop'}]
    
      return {
        fields: [
          {
            key: 'name',
            label: 'Наименование',
            sortable: true,
            width: 8
          },
          {
            key: 'minSalary',
            label: 'Минимальная ставка',
            sortable: true,
            width: 4
          },
          {
            key: 'actions',
            label: '',
            width: 1
          }
        ],
        allPositions: [],
        filters: {
          name:'',
        },
        deletedId: -1
      }
    },
    computed: {
      filtered () {
        const filtered = this.allPositions.filter(item => {
            return Object.keys(this.filters).every(key =>
                String(item[key]).toLowerCase().includes(this.filters[key].toLowerCase()))
        })
        return filtered.length > 0 ? filtered : []
      }
    },

    methods:{
      edit(item,key){
        item.key = key
        this.eventHub.$emit('editPosition', item)
      },
      deletePosition(item){
         this.deletedId = item.id
         this.$bvModal.show('delete-modal')
      },
      deleteConfirm(bvModalEvt) {        
        axios.get("/position/delete", {
          params: {
            id: this.deletedId
          }
        })
        .then(response => {
          this.allPositions=this.allPositions.filter(item => {return item.id != response.data.id});
        })      
        
      },
    },
    
    mounted() {
      axios.get("/position/GetAll")
      .then(response => {
        this.allPositions = response.data
      })

      this.eventHub.$on('saveNewPosition', data => {
         this.allPositions.unshift(data)
      })
      this.eventHub.$on('updatePosition', data => {
        var el = this.allPositions.filter(item => {
          return item.id == data.data.id
        });

        Vue.set(this.allPositions, el[0].key, data.data)
        
      })
    }
  })
