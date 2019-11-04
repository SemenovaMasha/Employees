import list from './list.js';
import bonusDetails from './bonusDetails.js';

const eventHub = new Vue() 
Vue.mixin({
    data: function () {
        return {
            eventHub: eventHub
        }
    }
})

new Vue({ el: '#Bonuses' ,
  template: `  
    <div>
      <bonusDetails ></bonusDetails>
      <br>
      <list ></list>
    </div>
  `,
})
