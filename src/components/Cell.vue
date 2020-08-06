<template>
  <div
    @dragover.prevent
    @drop.prevent="handleDrop"
    :draggable="draggable && !isEvaling"
    @dragstart="handleDragStart"
    @mouseup="handleRightClick"
    oncontextmenu="return false;"
  >
    <img
      v-for="obj in upperObjects"
      :key="obj.__id"
      :style="'z-index:' + obj.zIndex "
      :src="getImg(obj.state).png"
      alt="Game object icon"
      :srcset="getImg(obj.state).svg"
      class="cell"
      :class="obj.type === 'Kara' && 'direction-' + obj.direction"
    />
  </div>
</template>

<style lang="css">
.cell {
  position: absolute;
  top: 0;
  left: 0;
  width: 2vw;
  height: 2vw;
}

.direction-1 {
  transform: rotate(90deg);
}

.direction-2 {
  transform: rotate(180deg);
}

.direction-3 {
  transform: rotate(270deg);
}
</style>

<script>
// eslint-disable-next-line no-unused-vars
const { GameObject, Kara, Leaf, Mashroom, Tree } = require("@/gameLogic.js");
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

export default {
  props: {
    x: Number,
    y: Number,
  },
  data() {
    return {
      upperObjects: [],
      isEvaling: false,
      displayImgs: [],
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
    };
  },
  computed: {
    draggable() {
      return this.upperObjects.length !== 0;
    },
  },
  watch: {
    upperObjects() {
      this.$root.$data.board[this.x - 1][this.y - 1].splice(
        0,
        this.$root.$data.board[this.x - 1][this.y - 1].length
      );
      for (let obj of this.upperObjects) {
        this.$root.$data.board[this.x - 1][this.y - 1].push(obj);
      }
    },
  },
  methods: {
    getImg(t) {
      switch (t) {
        case "Kara":
          return { png: this.karaPng, svg: this.karaSvg };
        case "Leaf":
          return { png: this.leafPng, svg: this.leafSvg };
        case "Mashroom":
          return { png: this.mashroomPng, svg: this.mashroomSvg };
        case "Tree":
          return { png: this.treePng, svg: this.treeSvg };

        default:
          return { png: this.errorPng, svg: this.errorSvg };
      }
    },
    handleDrop(e) {
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

      // Test if already object on same z index
      for (let i of this.upperObjects) {
        if (i.zIndex === obj.zIndex) return false;
      }

      if (!this.upperObjects.some((i) => i.__id === obj.__id)) {
        if (obj.x !== -1 && obj.y !== -1) {
          this.$root.$emit("deleteObject", { obj: obj, save: false });
        }
        obj.x = this.x.valueOf();
        obj.y = this.y.valueOf();
        this.$root.$emit("addObject", { obj: obj });
      }
    },
    handleDragStart(e) {
      this.$root.$data.isEvaling = true;
      let index = 0;
      for (let obj of this.upperObjects) {
        if (obj.zIndex > this.upperObjects[index].zIndex)
          index = this.upperObjects.findIndex((i) => i.__id === obj.__id);
      }
      e.dataTransfer.setData("text", JSON.stringify(this.upperObjects[index]));
    },
    handleRightClick(e) {
      if (event.which === 3 && this.upperObjects.length > 0 && !this.$root.$data.isEvaling) {
        let index = 0;
        for (let obj of this.upperObjects) {
          if (obj.zIndex > this.upperObjects[index].zIndex)
            index = this.upperObjects.findIndex((i) => i.__id === obj.__id);
        }
        this.$root.$emit("deleteObject", {
          obj: this.upperObjects[index],
          save: true,
        });
        e.preventDefault();
      }
    },
  },
  mounted() {
    // ? : Can be null or empty
    // dataObj = {obj?: the Object, instanceName?: xxx, x?: xxxx, y?: xxx}
    this.$root.$on("deleteObject", (args) => {
      // If the object is given
      if (args.obj !== undefined) {
        if (args.obj.x === this.x && args.obj.y === this.y) {
          this.$root.$data.createdObjects.splice(
            this.$root.$data.createdObjects.findIndex(
              (i) => i.__id === args.obj.__id
            ),
            1
          );
          this.upperObjects.splice(
            this.upperObjects.findIndex((i) => i.__id == args.obj.__id),
            1
          );

          args.save === undefined ? (args.save = false) : (args.save = true);
          args.save && this.$root.$emit("saveWorld");
        }
        // Otherwise if the name of the object is given
      } else {
        if (args.x === this.x && args.y === this.y) {
          this.$root.$data.createdObjects.splice(
            this.$root.$data.createdObjects.findIndex(
              (i) =>
                i.x == args.x && i.y == args.y && i.type == args.instanceName
            ),
            1
          );
          this.upperObjects.splice(
            this.upperObjects.findIndex((i) => i.type == args.instanceName),
            1
          );

          args.save === undefined ? (args.save = false) : (args.save = true);
          args.save && this.$root.$emit("saveWorld");
        }
      }
    });
    this.$root.$on("addObject", (args) => {
      if (args.obj.x === this.x && args.obj.y === this.y) {
        this.$root.$data.createdObjects.push(args.obj);
        this.upperObjects.push(args.obj);

        // Check created objects
        let arr = [];
        for (let obj of this.$root.$data.createdObjects) {
          if (arr.some((i) => i.__id === obj.__id))
            this.$root.$data.createdObjects.splice(
              this.$root.$data.createdObjects.findIndex(
                (i) => i.__id === obj.__id
              ),
              1
            );
          else arr.push(obj);
        }

        args.save === undefined ? (args.save = true) : (args.save = false);
        args.save && this.$root.$emit("saveWorld");
      }
    });
    this.$root.$on("reset", () => {
      this.upperObjects.splice(0, this.upperObjects.length);
    });
    this.$root.$on("evalingChange", (state) => {
      this.isEvaling = state.valueOf();
    });
  },
  created() {},
};
</script>