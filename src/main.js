import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false

import VuetifyConfirm from 'vuetify-confirm'
import i18n from './i18n'
Vue.use(VuetifyConfirm, { vuetify })


const app = new Vue({
  data() {
    return {
      isEvaling: false,
      timeoutPool: [],
      createdObjects: [],
      board: [],
      boardHeight: null,
      boardWidth: null,
      coTimeout: null,
      setting: { speed: 1000, detailed: false },
    }
  },

  watch: {
    isEvaling() {
      this.$root.$emit("evalingChange", this.isEvaling);
    },
    board(now) {
      if (now.length !== 0) {
        window.clearTimeout(this.coTimeout);
        this.coTimeout = window.setTimeout(() => {
          this.createdObjects.splice(0, this.createdObjects.length);
          for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
              for (let obj of this.board[i][j]) {
                this.createdObjects.push(obj);
              }
            }
          }
        }, 50)
      }
    },
    boardHeight() {
      localStorage.setItem("height", this.boardHeight);
    },
    boardWidth() {
      localStorage.setItem("width", this.boardWidth);
    }
  },
  mounted() {
    this.$on("settingChange", (data) => {
      Object.assign(this.setting, data);
      localStorage.setItem("setting", JSON.stringify(data));
    })
    if (localStorage.getItem("setting"))
      Object.assign(this.setting, JSON.parse(localStorage.getItem("setting")));
  },
  router,
  vuetify,
  i18n,
  render: h => h(App)
}).$mount('#app')


window.$app = app;
console.log(window.NOTICE);
