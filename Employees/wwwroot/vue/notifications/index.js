
new Vue({
    el: '#Notifications',
    template: `
    <div>      
          <div v-for="item in allNotifications" style="margin-bottom:20px">              
                <b-card footer-tag="footer" >     
                    <b-card-title :class="rowClass(item)">{{item.name}}</b-card-title>
                  <b-card-text style="white-space: pre-wrap;">{{item.text}}</b-card-text>
                  <template v-slot:footer>
                    <em>{{dateDisplay(item.date)}}</em>
                  </template>
                </b-card>
          </div>
    </div>
    `,
    data: function () {
        return {
            allNotifications: [],
        }
    },

    mounted() {
        axios.get("/notifications/GetAllMine")
            .then(response => {
                this.allNotifications = response.data

                axios.get("/notifications/readAll").then(response => { })
            })

    },
    methods: {
        dateDisplay(date) {
            if (!date) return ''
            var date = new Date(date);
            return ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('000' + (date.getFullYear())).slice(-4) + ' ' 
                + ('0' + date.getHours()).slice(-2) + ':'  + ('0' + date.getMinutes()).slice(-2) 
        },
        rowClass(item, type) {
            if (!item) return
            if (item.new) return 'notification-new'
        },
    }
})
