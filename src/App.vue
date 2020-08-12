<template>
  <v-app>
    <GameOptionOverlay></GameOptionOverlay>
    <v-navigation-drawer app v-model="drawer">
      <v-list>
        <v-list-item link to="/playground" :disabled="isEvaling">
          <v-list-item-action>
            <v-icon>mdi-apps</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{$t("playground.title")}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <div id="coding">
          <v-list-item link to="/coding" :disabled="isEvaling">
            <v-list-item-action>
              <v-icon>mdi-code-array</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{$t("coding.title")}}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </div>
        <v-list-item link to="/help" :disabled="isEvaling">
          <v-list-item-action>
            <v-icon>mdi-help-circle</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{$t("help.title")}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <Setting :disabled="isEvaling" @close="closeSetting" @save="saveSetting"></Setting>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Javascript Kara - Web</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu
        bottom
        open-on-hover
        transition="slide-y-transition"
        close-on-click
        close-on-content-click
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>fa-globe</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item v-for="(lang, i) in langs" :key="i" @click="handleLangMenuClick(lang.code)">
            <v-list-item-title>{{lang.name}}</v-list-item-title>
          </v-list-item>
          <v-list-item href="https://github.com/ChuangSheep/javascript-kara-web" target="_blank">
            <v-list-item-title class="grey--text">Help us to translate</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <v-snackbar v-model="snackbar.open" :timeout="snackbar.timeout">
        {{ snackbar.content }}
        <template v-slot:action="{ attrs }">
          <v-btn color="blue" text v-bind="attrs" @click="snackbar.open = false">Close</v-btn>
        </template>
      </v-snackbar>

      <ErrorDialog></ErrorDialog>

      <v-container fluid>
        <transition name="slide-x-transition" mode="out-in">
          <router-view></router-view>
        </transition>
      </v-container>
    </v-main>

    <v-footer app style="z-index: 30">
      <v-row dense>
        <v-col>
          <span>Copyright (c) 2020 Chuyang Wang | Some Rights Reserved</span>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>



<script>
import GameOptionOverlay from "@/components/GameOptionOverlay.vue";
import ErrorDialog from "@/components/ErrorDialog.vue";
import Setting from "@/components/Setting.vue";
import langList from "@/language-list.json";

export default {
  name: "App",
  components: { GameOptionOverlay, ErrorDialog, Setting },
  data: () => ({
    isEvaling: false,
    drawer: null,
    snackbar: {
      open: false,
      timeout: 2000,
      content: "",
    },
    // [{name: "xxx", code="en"}]
    langs: [],
  }),
  methods: {
    handleLangMenuClick(lang) {
      if (lang != this.$root.$i18n.locale) {
        this.$root.$i18n.locale = lang;
        localStorage.setItem("userLang", lang);

        this.snackbar.open = true;
        this.snackbar.content = `${this.$t("common.changedToLang")}`;
      }
    },
    closeSetting() {
      this.drawer = null;
    },
    saveSetting(data) {
      this.closeSetting();
      this.$root.$emit("settingChange", data);
      this.snackbar.open = true;
      this.snackbar.content = `${this.$t("common.saved")}`;
    },
  },
  mounted() {
    this.$root.$on("evalingChange", (state) => {
      this.isEvaling = state.valueOf();
    });

    let l = [];
    for (let i in this.$i18n.messages) {
      l.push({
        name: `${langList[i].name.split(",")[0]} (${
          langList[i].nativeName.split(",")[0]
        })`,
        code: i,
      });
    }
    this.langs = l;
  },
};
</script>
