import list from './list.js';
import positionDetails from './positionDetails.js';

const eventHub = new Vue() 
Vue.mixin({
    data: function () {
        return {
            eventHub: eventHub
        }
    }
})

new Vue({ el: '#Positions' ,
  template: `  
    <div>
      <positionDetails ></positionDetails>
      <br>
      <list ></list>
    </div>
  `,
})
