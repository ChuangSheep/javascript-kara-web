<template>
  <div>
    <v-container>
      <v-row justify="start" @dragover.prevent @drop.prevent="handleDisposeDrop">
        <v-col cols="12" md="6" id="playground">
          <h1>Playground</h1>
        </v-col>
        <v-spacer></v-spacer>
        <v-col md="2" id="worldName">
          <v-text-field
            v-model="worldName"
            label="World Name"
            :rules="rules.worldName"
            spellcheck="false"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row justify="start">
        <v-col cols="auto" id="runCode">
          <v-tooltip :disabled="!isEvaling" bottom>
            <template v-slot:activator="{ on, attrs }">
              <div v-on="on">
                <v-btn
                  :loading="isEvaling"
                  v-bind="attrs"
                  color="primary"
                  @click="runCode"
                  :disabled="isEvaling"
                >Run</v-btn>
              </div>
            </template>
            <span>Your code is running</span>
          </v-tooltip>
        </v-col>
        <v-col cols="auto">
          <v-btn
            :loading="isSelectingExport"
            @click="exportWorld"
            :disabled="isEvaling"
          >Export World</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn
            :loading="isSelectingImport"
            @click="importWorld"
            :disabled="isEvaling"
          >Import World</v-btn>
          <input
            ref="worldUploader"
            class="d-none"
            type="file"
            accept=".world, text/xml"
            @change="onFileChanged"
          />
        </v-col>
        <v-col class="text-right">
          <v-dialog v-model="dialog" max-width="600px" :disabled="isEvaling">
            <template v-slot:activator="{ on, attrs }">
              <v-btn class="mb-2" v-bind="attrs" v-on="on" :disabled="isEvaling">Resize</v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">Change Playground Size</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col class="text-right">
                      <v-text-field
                        v-model="dialogData.width"
                        label="Width"
                        :rules="rules.width"
                        type="number"
                        autofocus
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="dialogData.height"
                        label="Height"
                        :rules="rules.height"
                        type="number"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="saveSize" :disabled="!dataValid">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
        <v-col cols="auto">
          <v-btn color="error" @click="uResetWorld()" :disabled="isEvaling">Reset World</v-btn>
        </v-col>
      </v-row>

      <v-row
        align="center"
        justify="center"
        justify-content="center"
        style="height: 60vh"
        @dragover.prevent
        @drop.prevent="resetEvaling"
        id="canvas"
      >
        <v-list>
          <v-list-item>
            <v-list-item-content class="legend">
              <img
                :draggable="allowKaraDrag"
                @dragstart="handleDragStart"
                :src="karaPng"
                alt="Kara"
                :srcset="karaSvg"
                class="legend"
              />
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content class="legend">
              <img
                :draggable="!isEvaling"
                @dragstart="handleDragStart"
                :src="leafPng"
                alt="Leaf"
                :srcset="leafSvg"
                class="legend"
              />
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content class="legend">
              <img
                :draggable="!isEvaling"
                @dragstart="handleDragStart"
                :src="mashroomPng"
                alt="Mashroom"
                :srcset="mashroomSvg"
                class="legend"
              />
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content class="legend">
              <img
                :draggable="!isEvaling"
                @dragstart="handleDragStart"
                :src="treePng"
                alt="Tree"
                :srcset="treeSvg"
                class="legend"
              />
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-col class="playground" cols="auto" id="gameboard">
          <Gameboard :width="parseInt(width)" :height="parseInt(height)"></Gameboard>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style lang="css">
.playground {
  overflow: auto;
  max-height: 60vh;
  max-width: 80%;
}

.legend {
  width: max(2.5vw, 20px);
  -webkit-user-select: none;
  -moz-user-select: -moz-none;
  -ms-user-select: none;
  user-select: none;
}
</style>

<script>
import Gameboard from "@/components/Gameboard.vue";
import {
  getDataAsXMLString,
  setDataFromXMLString,
  runUserCode,
} from "@/userInterfaceKernal.js";

// eslint-disable-next-line no-unused-vars
const { GameObject, Kara, Leaf, Mashroom, Tree } = require("@/gameLogic.js");

import Driver from "driver.js";
import "driver.js/dist/driver.min.css";

import errorPng from "@/assets/game-img/error-64.png";
import errorSvg from "@/assets/game-img/error-64.svg";
import karaPng from "@/assets/game-img/kara-64.png";
import karaSvg from "@/assets/game-img/kara-64.svg";
import leafPng from "@/assets/game-img/leaf-64.png";
import leafSvg from "@/assets/game-img/leaf-64.svg";
import mashroomPng from "@/assets/game-img/mashroom-64.png";
import mashroomSvg from "@/assets/game-img/mashroom-64.svg";
import treePng from "@/assets/game-img/tree-64.png";
import treeSvg from "@/assets/game-img/tree-64.svg";

let driver = new Driver();

export default {
  components: {
    Gameboard,
  },
  props: {
    developer: Boolean,
  },
  data() {
    return {
      isEvaling: false,
      width: 50,
      height: 30,
      dialog: false,
      dialogData: {
        width: null,
        height: null,
      },
      rules: {
        width: [
          (value) => !!value || "Field cannot be empty",
          (value) => parseInt(value) < 51 || "Max width ist set to 50",
          (value) => parseInt(value) > 0 || "Width must be greater than 0",
        ],
        height: [
          (value) => !!value || "Field cannot be empty",
          (value) => parseInt(value) < 31 || "Max height ist set to 30",
          (value) => parseInt(value) > 0 || "Height must be greater than 0",
        ],
        worldName: [
          (value) => !!value || "Field cannot be empty",
          (value) =>
            /^(?!\.)(?!com[0-9]$)(?!con$)(?!lpt[0-9]$)(?!nul$)(?!prn$)[^|*?\\:<>/$"]*[^.|*?\\:<>/$"]+$/.test(
              value
            ) || "Character not allowed",
        ],
      },
      fileName:
        localStorage.getItem("worldName") != null
          ? localStorage.getItem("worldName")
          : "",
      preferenceSetting:
        localStorage.getItem("userPreference") != null
          ? JSON.parse(localStorage.getItem("userPreference"))
          : {
              legacy: false,
              advancedMode: false,
            },
      worldFile: null,
      worldName: "Unnamed",
      isSelectingImport: null,
      isSelectingExport: null,
      errorPng,
      errorSvg,
      karaPng,
      karaSvg,
      leafPng,
      leafSvg,
      mashroomPng,
      mashroomSvg,
      treePng,
      treeSvg,
      guideSteps1: [
        {
          element: "#playground",
          popover: {
            title: "Where it all starts",
            description:
              "This is the playground page. Here you can run your code and see how the kara moves. Also, you can put game objects on the canvas. ",
            position: "right",
            nextBtnText: "Start the tour",
          },
        },
        {
          element: "#worldName",
          popover: {
            title: "Name your own world",
            description:
              "You are able to give your world a name. This name will be used when you export your code and world. ",
            position: "left",
          },
        },
        {
          element: "#canvas",
          popover: {
            title: "See your world",
            description: "This is the world. Try to drag the kara on a block!",
            position: "top",
          },
        },
        {
          element: "#gameboard",
          popover: {
            title: "Delete something",
            description:
              "To remove any object from your world, just right click on it. ",
            position: "top",
          },
          onNext: () => {
            let firstTime = JSON.parse(localStorage.getItem("firstTime"));
            firstTime.tour1 = false;
            localStorage.setItem("firstTime", JSON.stringify(firstTime));
          },
        },
        {
          element: "#runCode",
          popover: {
            title: "Test it",
            description:
              "Clicking this button will execute the code you written in the Coding page. But now, let's <strong>go to the Coding page</strong> and write something awesome!",
            position: "right",
            doneBtnText: "Go to coding!",
          },
          onNext: () => {
            let firstTime = JSON.parse(localStorage.getItem("firstTime"));
            firstTime.tour1 = false;
            localStorage.setItem("firstTime", JSON.stringify(firstTime));
            window.$app.$router.push("/coding");
          },
        },
      ],
      guideSteps2: [
        {
          element: "#runCode",
          popover: {
            title: "The end of the beginning",
            description:
              "Finally, we are at the end of our tour. Click the <i>Run</i> button, and look how kara moves. ",
            position: "right",
            closeBtnText: "Start your new journey",
          },
          onNext: () => {
            let firstTime = JSON.parse(localStorage.getItem("firstTime"));
            firstTime.tour3 = false;
            localStorage.setItem("firstTime", JSON.stringify(firstTime));
          },
        },
      ],
    };
  },
  computed: {
    dataValid() {
      return (
        this.dialogData.width > 0 &&
        this.dialogData.width < 51 &&
        this.dialogData.height > 0 &&
        this.dialogData.height < 31
      );
    },
    allowKaraDrag() {
      return (
        !this.isEvaling &&
        !this.$root.$data.createdObjects.some((i) => i.type === "Kara")
      );
    },
  },
  watch: {
    dialog(val) {
      if (val) {
        this.dialogData.width = parseInt(this.width.valueOf());
        this.dialogData.height = parseInt(this.height.valueOf());
      }
      val || this.close();
    },
    width(now) {
      this.$root.$data.boardWidth = parseInt(now);
    },
    height(now) {
      this.$root.$data.boardHeight = parseInt(now);
    },
    worldName() {
      if (
        /^(?!\.)(?!com[0-9]$)(?!con$)(?!lpt[0-9]$)(?!nul$)(?!prn$)[^|*?\\:<>/$"]*[^.|*?\\:<>/$"]+$/.test(
          this.worldName
        )
      ) {
        localStorage.setItem("worldName", this.worldName);
      }
    },
  },
  methods: {
    handleDragStart(e) {
      this.$root.$data.isEvaling = true;
      let data;
      switch (e.srcElement.alt) {
        case "Kara":
          data = new Kara(-1, -1, { init: false });
          break;
        case "Leaf":
          data = new Leaf(-1, -1, { init: false });
          break;
        case "Mashroom":
          data = new Mashroom(-1, -1, { init: false });
          break;
        case "Tree":
          data = new Tree(-1, -1, { init: false });
          break;
      }
      e.dataTransfer.setData("text", JSON.stringify(data));
    },
    handleDisposeDrop(e) {
      this.$root.$data.isEvaling = false;
      let obj = JSON.parse(e.dataTransfer.getData("text"));
      switch (obj.type) {
        case "Kara":
          obj = Object.assign(new Kara(-1, -1, { init: false }), obj);
          break;
        case "Leaf":
          obj = Object.assign(new Leaf(-1, -1, { init: false }), obj);
          break;
        case "Mashroom":
          obj = Object.assign(new Mashroom(-1, -1, { init: false }), obj);
          break;
        case "Tree":
          obj = Object.assign(new Tree(-1, -1, { init: false }), obj);
          break;
        default:
          obj = Object.assign(new GameObject(-1, -1, { init: false }), obj);
          break;
      }

      if (obj.x !== -1 && obj.y !== -1) {
        this.$root.$emit("deleteObject", { obj: obj, save: true });
      }
    },
    resetEvaling() {
      this.$root.$data.isEvaling = false;
    },
    close() {
      this.dialog = false;
    },
    saveSize() {
      let width = parseInt(this.dialogData.width.valueOf());
      let height = parseInt(this.dialogData.height.valueOf());

      if (
        height <= this.$root.$data.boardHeight &&
        width <= this.$root.$data.boardWidth
      ) {
        this.$root.$data.board.splice(
          width,
          this.$root.$data.boardWidth - width
        );
        for (let i = 0; i < width; i++) {
          this.$root.$data.board[i].splice(
            height,
            (this.$root.$data.boardHeight = height)
          );
        }
      } else if (
        height > this.$root.$data.boardHeight &&
        width <= this.$root.$data.boardWidth
      ) {
        this.$root.$data.board.splice(
          width,
          this.$root.$data.boardWidth - width
        );
        for (let i = 0; i < width; i++) {
          for (let j = 0; j < height - this.$root.$data.boardHeight; j++) {
            this.$root.$data.board[i].push([]);
          }
        }
      } else if (
        height <= this.$root.$data.boardHeight &&
        width > this.$root.$data.boardWidth
      ) {
        for (let i = this.$root.$data.boardWidth; i < width; i++) {
          this.$root.$data.board.push([]);
          for (let j = 0; j < height; j++) {
            this.$root.$data.board[i].push([]);
          }
        }
        for (let i = 0; i < this.$root.$data.boardWidth; i++) {
          this.$root.$data.board[i].splice(
            height,
            (this.$root.$data.boardHeight = height)
          );
        }
      } else if (
        height > this.$root.$data.boardHeight &&
        width > this.$root.$data.boardWidth
      ) {
        for (let i = 0; i < this.$root.$data.boardWidth; i++) {
          for (let j = 0; j < height - this.$root.$data.boardHeight; j++) {
            this.$root.$data.board[i].push([]);
          }
        }
        for (let i = this.$root.$data.boardWidth; i < width; i++) {
          this.$root.$data.board.push([]);
          for (let j = 0; j < height; j++) {
            this.$root.$data.board[i].push([]);
          }
        }
      }

      this.width = parseInt(this.dialogData.width.valueOf());
      this.height = parseInt(this.dialogData.height.valueOf());
      this.$root.$data.boardHeight = this.height.valueOf();
      this.$root.$data.boardWidth = this.width.valueOf();
      this.close();
      this.saveWorld();
    },
    saveWorld() {
      let world = getDataAsXMLString();
      localStorage.setItem("userWorld", world);
    },
    showSavedData() {
      let world = localStorage.getItem("userWorld");
      this.resetWorld();
      setDataFromXMLString(world);
      this.worldName = localStorage.getItem("worldName");
      let item = {
        width: parseInt(this.width.valueOf()),
        height: parseInt(this.height.valueOf()),
      };
      Object.assign(this.dialogData, item);
    },
    runCode() {
      let firstTime = JSON.parse(localStorage.getItem("firstTime"));
      if (firstTime.tour3) {
        driver.reset();
        firstTime.tour3 = false;
        localStorage.setItem("firstTime", JSON.stringify(firstTime));
      }

      let old = getDataAsXMLString();
      localStorage.setItem("userWorld", old);
      this.$root.$emit("reset");
      this.$root.$data.createdObjects.splice(
        0,
        this.$root.$data.createdObjects.length
      );
      let world = localStorage.getItem("userWorld");
      setDataFromXMLString(world);
      window.setTimeout(() => {
        runUserCode();
      }, 10);
    },
    exportWorld() {
      this.isSelectingExport = true;
      window.addEventListener(
        "focus",
        () => {
          this.isSelectingExport = false;
        },
        { once: true }
      );
      var data = getDataAsXMLString();
      var blob = new Blob([data], { type: "application/octet-stream" });
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(
          blob,
          localStorage.getItem("worldName") + ".world"
        );
      } else {
        var elem = window.document.createElement("a");
        elem.href = window.URL.createObjectURL(blob);
        elem.download = localStorage.getItem("worldName") + ".world";
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
      }
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

      this.$refs.worldUploader.click();
    },
    async onFileChanged(e) {
      this.resetWorld();
      let selectedFile = await e.target.files[0].text();
      setDataFromXMLString(selectedFile);
      this.$nextTick(() => {
        this.saveWorld();
      });
    },
    uResetWorld() {
      this.$confirm(
        "Are you sure that you want to reset the world?<br/>This CANNOT be undone.",
        { title: "Are you sure?" }
      ).then((res) => {
        if (res) {
          this.resetWorld();
          this.saveWorld();
        }
      });
    },
    resetWorld() {
      this.width = 10;
      this.height = 10;
      this.$root.$data.boardHeight = this.height.valueOf();
      this.$root.$data.boardWidth = this.width.valueOf();

      this.$root.$emit("reset");

      this.$root.$data.board.splice(0, this.$root.$data.board.length);
      for (let i = 0; i < this.width; i++) {
        this.$root.$data.board.push([]);
        for (let j = 0; j < this.height; j++) {
          this.$root.$data.board[i].push([]);
        }
      }
      this.$root.$data.createdObjects.splice(
        0,
        this.$root.$data.createdObjects.length
      );
    },
  },
  created() {
    this.$root.$on("updateBoardInfo", (info) => {
      this.width = info.width.valueOf();
      this.height = info.height.valueOf();
    });
    this.$root.$on("saveWorld", () => {
      this.saveWorld();
    });
    this.$root.$on("resetWorld", () => {
      this.resetWorld();
    });
    this.$root.$on("evalingChange", (state) => {
      this.isEvaling = state.valueOf();
    });
    this.width = localStorage.getItem("width");
    this.height = localStorage.getItem("height");
  },
  mounted() {
    if (localStorage.getItem("userWorld") !== undefined) {
      window.setTimeout(() => {
        this.showSavedData();
      }, 20);
    }

    window.setTimeout(() => {
      let firstTime = JSON.parse(localStorage.getItem("firstTime"));
      if (firstTime !== null) {
        if (firstTime.tour1) {
          driver.defineSteps(this.guideSteps1);
          driver.start();
        } else if (firstTime.tour3) {
          driver.defineSteps(this.guideSteps2);
          driver.start();
        }
      }
    }, 50);
  },
};
</script>
