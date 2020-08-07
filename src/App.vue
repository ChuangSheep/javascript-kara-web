<template>
  <v-app>
    <GameOptionOverlay></GameOptionOverlay>
    <v-navigation-drawer app v-model="drawer">
      <v-list>
        <v-list-item link to="/playground">
          <v-list-item-action>
            <v-icon>mdi-apps</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Playground</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <div id="coding">
          <v-list-item link to="/coding">
            <v-list-item-action>
              <v-icon>mdi-code-array</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Coding</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </div>
        <v-list-item link to="/help">
          <v-list-item-action>
            <v-icon>mdi-help-circle</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Help</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Javascript Kara - Web</v-toolbar-title>
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
export default {
  name: "App",
  components: { GameOptionOverlay, ErrorDialog },
  data: () => ({
    drawer: null,
    snackbar: {
      open: false,
      timeout: 2000,
      content: "",
    },
  }),
};
</script>
