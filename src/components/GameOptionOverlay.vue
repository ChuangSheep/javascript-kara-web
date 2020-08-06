<template>
  <v-overlay absolute="absolute" opacity="0.5" :value="show" :z-index="40">
    <v-card max-width="800" width="75vw" min-width="300" color="#8AD9D6">
      <v-card-title center>
        <span>Welcome to Javascript Kara (web)!</span>
        <v-spacer></v-spacer>
        <v-btn text small @click="jumpTour">Jump the tour</v-btn>
      </v-card-title>
      <v-card-text>Tell us something about yourself.</v-card-text>
      <v-row justify="space-around">
        <v-col cols="11" md="5">
          <v-card
            color="#4C8C8A"
            class="height-fit-content hover-effect"
            min-height="240"
            @click="handleBasicClick"
          >
            <v-card-title>Beginner</v-card-title>
            <v-card-text>
              <ul class="option-list">
                <li>I have not learned programming, or</li>
                <li></li>
                <li></li>
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
            <v-card-title>Advanced</v-card-title>
            <v-card-text>
              <ul class="option-list">
                <li>I have learned at least one programming language, or</li>
                <li>I have a basic understanding of javascript, or</li>
                <li>I want to have more challenge...</li>
              </ul>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-card-actions>
        <v-spacer></v-spacer>
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
export default {
  data() {
    return {
      show: false,
      level: null,
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
  },
};
</script>