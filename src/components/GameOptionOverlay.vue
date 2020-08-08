<template>
  <v-overlay absolute="absolute" opacity="0.5" :value="show" :z-index="40">
    <v-card max-width="800" width="75vw" min-width="300" color="#8AD9D6">
      <v-row justify="space-between">
        <v-col cols="12" md="8">
          <v-card-title center>
            <span>{{$t("intro.tour0.title")}}</span>
          </v-card-title>
          <v-card-subtitle style="padding-bottom:0;">{{$t("intro.tour0.subtitle")}}</v-card-subtitle>
        </v-col>
        <v-col cols="auto">
          <v-btn text small @click="jumpTour">{{$t("intro.tour0.skipTour")}}</v-btn>
        </v-col>
      </v-row>
      <v-row justify="space-around">
        <v-col cols="11" md="5">
          <v-card
            color="#4C8C8A"
            class="height-fit-content hover-effect"
            min-height="240"
            @click="handleBasicClick"
          >
            <v-card-title>{{$t("intro.tour0.beginner.title")}}</v-card-title>
            <v-card-text>
              <ul class="option-list">
                <li>{{$t("intro.tour0.beginner.opt1")}}</li>
                <li>{{$t("intro.tour0.beginner.opt2")}}</li>
                <li>{{$t("intro.tour0.beginner.opt3")}}</li>
              </ul>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="11" md="5">
          <v-card
            color="#4C8C8A"
            class="height-fit-content hover-effect"
            min-height="240"
            @click="handleAdvancedClick"
          >
            <v-card-title>{{$t("intro.tour0.advanced.title")}}</v-card-title>
            <v-card-text>
              <ul class="option-list">
                <li>{{$t("intro.tour0.advanced.opt1")}}</li>
                <li>{{$t("intro.tour0.advanced.opt2")}}</li>
                <li>{{$t("intro.tour0.advanced.opt3")}}</li>
              </ul>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-menu
          bottom
          open-on-hover
          transition="slide-y-transition"
          close-on-click
          close-on-content-click
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on" style="margin-right: 30px;">
              <v-icon left>fa-globe</v-icon> {{$i18n.locale.toUpperCase()}}
            </v-btn>
          </template>

          <v-list>
            <v-list-item
              v-for="(lang, i) in langs"
              :key="i"
              @click="handleLangMenuClick(lang.code)"
            >
              <v-list-item-title>{{lang.name}}</v-list-item-title>
            </v-list-item>
            <v-list-item href="https://github.com/ChuangSheep/javascript-kara-web" target="_blank">
              <v-list-item-title class="grey--text">Help us to translate</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-card-actions>
    </v-card>
  </v-overlay>
</template>

<style lang="css">
.height-fit-content {
  height: fit-content;
  height: -moz-fit-content;
  height: -webkit-fit-content;
}
.option-list li {
  padding: 5px 10px;
}

.hover-effect {
  background-color: #4c8c8a;
}

.hover-effect:hover {
  background-color: #395958 !important;
}
</style>

<script>
import langList from "@/language-list.json";

export default {
  data() {
    return {
      show: false,
      level: null,
      langs: [],
    };
  },
  watch: {
    level(now) {
      if (now !== null) {
        let rtr = {
          tour0: false,
          tour1: true,
          tour2: true,
          tour3: true,
          level: now.valueOf(),
        };
        localStorage.setItem("firstTime", JSON.stringify(rtr));
        this.show = false;
        if (this.$route.path !== "/playground")
          this.$router.push("/playground");
        else location.reload();
      }
    },
  },
  methods: {
    jumpTour() {
      let rtr = {
        tour0: false,
        tour1: false,
        tour2: false,
        tour3: false,
        level: 1,
      };
      localStorage.setItem("firstTime", JSON.stringify(rtr));
      this.show = false;
      if (this.$route.path !== "/playground") this.$router.push("/playground");
      else location.reload();
    },
    handleBasicClick() {
      this.level = 0;
    },
    handleAdvancedClick() {
      this.level = 1;
    },
    handleLangMenuClick(lang) {
      this.$root.$i18n.locale = lang;
      localStorage.setItem("userLang", lang);
    },
  },
  mounted() {
    // firstTime: {tour0: Boolean (false: not finished; true: finished), tour1: Boolean, tour2: Boolean, tour3: Boolean, level: Number} ==> level: 0 = Beginner, 1 = Known JS
    let firstTime = localStorage.getItem("firstTime");
    if (firstTime == null) {
      // DO something with overlay
      this.show = true;
    } else {
      firstTime.tour0 ? (this.show = firstTime.tour0) : 0;
    }

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