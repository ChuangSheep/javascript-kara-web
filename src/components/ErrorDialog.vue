<template>
  <div>
    <v-overlay v-if="show" opacity="0.25" z-index="40">
      <v-row justify="center">
        <v-col cols="10" md="7">
          <v-card color="error">
            <v-card-title>Opps, an error has occured.</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <h3 class="white--text">Details</h3>
                </v-col>
                <v-col cols="12">
                  <span>
                    <strong>{{type}}</strong>
                  </span>
                  <span v-if="lineno > 0">&nbsp;at line {{lineno}}, column {{colno}}:&nbsp;</span>
                  <span class="code" v-if="lineno > 0">{{errorLine}}</span>
                  <br />
                  <span class="white--text">{{mainMsg}}</span>
                  <br />
                  <span>
                    <i>Your code editor may give you addtional information.</i>
                  </span>
                </v-col>
                <v-col cols="12">
                  <span class="white--text italic" id="suggestion" v-html="suggestion"></span>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-btn text @click="close">Close</v-btn>
              <v-btn text @click="gotoCoding">Goto Coding</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-overlay>
  </div>
</template>

<style lang="css">
.code {
  background-color: grey;
  color: white;
}

.italic {
  font-style: italic;
}

#suggestion a {
  color: white;
}

#suggestion a:hover {
  color: #d0d0d0;
}
</style>

<script>
export default {
  props: {},
  data() {
    return {
      show: false,
      type: "",
      mainMsg: "",
      lineno: -1,
      colno: -1,
      errorLine: "",
      suggestion: "",
    };
  },
  watch: {
    show() {
      this.show || this.close();
    },
  },
  methods: {
    close() {
      this.show = false;
    },
    gotoCoding() {
      this.close();
      this.$router.push("/coding");
    },
  },
  mounted() {
    // args: {errorStack, detail: {type, showMsg, lineno, colno, suggestion}}
    this.$root.$on("userCodeError", (args) => {
      let stack = args.errorStack.split("\n")[0];
      this.type = args.detail.type;
      this.mainMsg = stack;
      this.lineno = args.detail.lineno;
      this.colno = args.detail.colno;
      this.suggestion = args.detail.suggestion;

      let code = localStorage.getItem("userCode");
      let lines = code.split("\n");
      if (lines.length >= this.lineno && this.lineno > 0) {
        this.errorLine = lines[this.lineno - 1];
      } else if (lines.length < this.lineno && this.lineno > 0) {
        this.errorLine = "End of the code";
      }

      this.show = true;
    });
  },
};
</script>