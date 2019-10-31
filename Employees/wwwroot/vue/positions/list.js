export default Vue.component('list', {
  props: ["filtered"],
    template: `
    <div>
    <div>test</div>
    <b-table striped show-empty :items="filtered">
 
</b-table>

</div>
    `
  })
