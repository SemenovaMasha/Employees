import list from './list.js';

// Vue.component('Positions', {
//     template: `
//     <list></list>
    
//     `
//   })
new Vue({ el: '#Positions' ,
data: {
  filters: {
    id: '',
    issuedBy: '',
    issuedTo: ''
  },
  items: [{id:1234,issuedBy:'Operator',issuedTo:'abcd-efgh'},{id:5678,issuedBy:'User',issuedTo:'ijkl-mnop'}]
},
computed: {
  filtered () {
    const filtered = this.items.filter(item => {
      return Object.keys(this.filters).every(key =>
          String(item[key]).includes(this.filters[key]))
    })
    return filtered.length > 0 ? filtered : [{
      id: '',
      issuedBy: '',
      issuedTo: ''
    }]
  }
}
})
