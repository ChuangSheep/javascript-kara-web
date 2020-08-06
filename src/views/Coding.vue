<template>
  <v-container>
    <v-row>
      <v-col cols="auto">
        <h1>Coding</h1>
      </v-col>
      <v-col class="btnPosition" cols="auto">
        <div>
          <v-col cols="auto" style="display: inline-block">
            <v-btn @click="gotoPlayground" color="primary" id="backToPlayground">Goto Playground</v-btn>
          </v-col>
          <v-col cols="auto" style="display: inline-block">
            <v-btn :loading="isSelectingImport" @click="importWorld">Import Code</v-btn>
            <input
              ref="codeUploader"
              class="d-none"
              type="file"
              accept=".js"
              @change="onFileChanged"
            />
          </v-col>
          <v-col cols="auto" style="display: inline-block">
            <v-btn :loading="isSelectingExport" @click="exportCode">Export Code</v-btn>
          </v-col>
          <v-col cols="auto" style="display: inline-block">
            <v-btn @click="clearEditor" color="error">Clear Editor</v-btn>
          </v-col>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div id="codeEditorThen">
          <editor
            ref="editor"
            id="codeEditor"
            v-model="userCode"
            lang="javascript"
            height="min(550px, 65vh)"
            class="widthEditor"
            @init="initEditor"
          ></editor>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="css">
.btnPosition {
  margin-left: auto;
}

.widthEditor {
  width: 65vw !important;
}

@media screen and (max-width: 900px) {
  .btnPosition {
    margin-left: unset;
  }

  .widthEditor {
    width: 100% !important;
  }
}
</style>

<script>
import Driver from "driver.js";
import "driver.js/dist/driver.min.css";

export default {
  components: {
    editor: require("vue2-ace-editor"),
  },
  data() {
    return {
      userCode: "",
      INITCODE:
        "let kara;\n//If the kara is already put on the board by hand\nkara = getKaraInstance();\n//If the kara is not put on the board, uncomment the line below\n//kara = new Kara(1, 1);\n\n//Your code here\nkara.move();\n\n\n",
      isSelectingImport: null,
      isSelectingExport: null,
      guideSteps: [
        {
          element: "#codeEditor",
          popover: {
            title: "1001011101",
            description:
              "This is the coding editor. By writing javascript code, you will be able to control kara to do almost everything. So, be <b>creative</b>!",
            position: "top",
          },
        },
        {
          element: "#codeEditorThen",
          popover: {
            title: "And a lot more",
            description:
              "To let kara move: kara.move()<br>For more methods, see <a target='_blank' href='https://google.com'>full references here</a>.",
            position: "top",
          },
        },
        {
          element: "#backToPlayground",
          popover: {
            title: "Time to go back",
            description:
              "After you finished writing your code, it's time to test it! Go to the Playground page and click the <i>Run</i> button we discussed before. ",
            position: "bottom",
            doneBtnText: "Go to Playground!",
          },
          onNext: () => {
            let firstTime = JSON.parse(localStorage.getItem("firstTime"));
            firstTime.tour2 = false;
            localStorage.setItem("firstTime", JSON.stringify(firstTime));
            window.$app.$router.push("/playground");
          },
        },
      ],
    };
  },
  watch: {
    userCode(val) {
      localStorage.setItem("userCode", val);
    },
  },
  methods: {
    initEditor: function () {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/html");
      require("brace/mode/javascript"); //language
      require("brace/mode/less");
      require("brace/theme/chrome");
      require("brace/snippets/javascript"); //snippet
    },
    clearEditor() {
      this.$confirm(
        "Are you sure that you want to reset the editor?<br/>This CANNOT be undone.",
        { title: "Are you sure?" }
      ).then((res) => {
        if (res) {
          this.userCode = this.INITCODE.valueOf();
        }
      });
    },
    importWorld() {
      this.isSelectingImport = true;
      window.addEventListener(
        "focus",
        () => {
          this.isSelectingImport = false;
        },
        { once: true }
      );

      this.$refs.codeUploader.click();
    },
    exportCode() {
      this.isSelectingExport = true;
      window.addEventListener(
        "focus",
        () => {
          this.isSelectingExport = false;
        },
        { once: true }
      );
      var data = this.userCode;
      var blob = new Blob([data], { type: "application/octet-stream" });
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(
          blob,
          localStorage.getItem("worldName") + ".js"
        );
      } else {
        var elem = window.document.createElement("a");
        elem.href = window.URL.createObjectURL(blob);
        elem.download = localStorage.getItem("worldName") + ".js";
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
      }
    },
    async onFileChanged(e) {
      let selectedFile = await e.target.files[0].text();
      this.userCode = selectedFile;
      this.$nextTick(() => {
        localStorage.setItem("userCode", this.userCode);
      });
    },
    gotoPlayground() {
      this.$router.push("/playground");
    },
  },
  mounted() {
    if (localStorage.getItem("userCode") != "") {
      this.userCode = localStorage.getItem("userCode");
    } else {
      this.userCode = this.INITCODE.valueOf();
    }

    let driver = new Driver();
    let firstTime = JSON.parse(localStorage.getItem("firstTime"));
    if (firstTime !== null) {
      if (firstTime.tour2) {
        driver.defineSteps(this.guideSteps);
        driver.start();
      }
    }
  },
};
</script>