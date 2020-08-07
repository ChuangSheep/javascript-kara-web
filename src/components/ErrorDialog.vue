<template>
  <div>
    <v-overlay v-if="show" opacity="0.25" z-index="40">
      <v-row justify="center">
        <v-col cols="10" md="7">
          <v-card color="error">
            <v-card-title>{{$t("errorDialog.title")}}</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <h3 class="white--text">{{$t("errorDialog.details")}}</h3>
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
                    <i>{{$t("errorDialog.infoCodeEditor")}}</i>
                  </span>
                </v-col>
                <v-col cols="12">
                  <i18n
                    id="suggestion"
                    :path="suggestion.path"
                    tag="span"
                    class="white--text italic"
                  >
                    <a :href="suggestion.link" target="_blank">{{suggestion.linkText}}</a>
                  </i18n>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-btn text @click="close">{{$t("common.closeBtn")}}</v-btn>
              <v-btn text @click="gotoCoding">{{$t("common.goto")}} Coding</v-btn>
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
      suggestion: {
        path: "",
        link: "",
        linkText: "",
      },
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
    getSuggestion(type, detail) {
      const apiReferenceSite = "#";
      const GithubIssueSite = "#";
      const MDNJavascriptReferences = {
        RefError_VarNotDefined:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Not_defined",
        TypeError_AssignConstVar:
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_const_assignment",
        SyxError_UnexpToken: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Unexpected_token",
      };
      let suggestion = {};
      if (type === "TypeError") {
        if (detail.includes("is not a function")) {
          suggestion.path = "errorDialog.suggestions.TypeError_NotAFunc";
          suggestion.link = apiReferenceSite;
          suggestion.linkText = "Api References";
        } else if (detail.toLowerCase().includes("assignment to const")) {
          suggestion.path = "errorDialog.suggestions.TypeError_AssignConstVar";
          suggestion.link = MDNJavascriptReferences.TypeError_AssignConstVar;
          suggestion.linkText =
            'Javascript Reference: TypeError - invalid assignment to const "x"';
        }
      } else if (type === "ReferenceError") {
        if (detail.includes("is not defined")) {
          suggestion.path = "errorDialog.suggestions.RefError_VarNotDefined";
          suggestion.link = MDNJavascriptReferences.RefError_VarNotDefined;
          suggestion.linkText =
            "Javascript Reference: ReferenceError - Variable is not defined";
        }
      } else if (type === "SyntaxError") {
        if (detail.toLowerCase().includes("unexpected token")) {
          suggestion.path = "errorDialog.suggestions.SyxError_UnexpToken";
          suggestion.link = MDNJavascriptReferences.SyxError_UnexpToken;
          suggestion.linkText =
            "Javascript Reference: SyntaxError - Unexpected token";
        }
      } else if (type === "GameLogicError") {
        suggestion.path = "errorDialog.suggestions.GameLogicError";
        suggestion.link = "#";
        suggestion.linkText = "";
      } else if (type === "GameKernalError") {
        suggestion.path = "errorDialog.suggestions.GameKernalError.text";
        suggestion.link = GithubIssueSite;
        suggestion.linkText = `${this.$t("errorDialog.suggestions.GameKernalError.contact")}`;
      }

      // Fallback
      if (suggestion.path == undefined) {
        suggestion.path = "errorDialog.suggestions.fallback";
        suggestion.link = "#";
        suggestion.linkText = "";
      }

      return suggestion;
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
      this.suggestion = this.getSuggestion(
        args.detail.type,
        args.errorStack.split("\n")[0]
      );

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