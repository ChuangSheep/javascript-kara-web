<template>
  <table class="gameboard" @drop="stopEvaling">
    <colgroup>
      <col v-for="_ in width" :key="_" />
    </colgroup>
    <tbody>
      <tr v-for="y in height" :key="y">
        <td v-for="x in width" :key="3*x+y-3" @drop="stopEvaling" cellspacing="0">
          <Cell :ref="x+'_'+y" :x="x" :y="y"></Cell>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style lang="css">
* {
  position: relative;
}

.gameboard {
  -webkit-user-select: none;
  -moz-user-select: -moz-none;
  -ms-user-select: none;
  user-select: none;

  table-layout: fixed;
  border-spacing: 0;
  text-align: center;

  border: black solid 1px;
}

.gameboard td:nth-child(2n) {
  background-color: lawngreen;
}

.gameboard td:nth-child(2n + 1) {
  background-color: #b2fd56;
}

.gameboard td {
  border: solid 1px black;
  width: 25px;
  width: max(2.5vw, 20px);
  height: 25px;
  height: max(2.5vw, 20px);
}

.gameboard td div {
  width: 25px;
  width: max(2.5vw, 20px);
  height: 25px;
  height: max(2.5vw, 20px);
  position: relative;
}

.gameboard td div img {
  font-size: max(2vw, 15px);
  width: 25px;
  width: max(2.5vw, 20px);
  height: 25px;
  height: max(2.5vw, 20px);
}
</style>

<script>
import Cell from "@/components/Cell.vue";

export default {
  props: {
    width: Number,
    height: Number,
  },
  components: {
    Cell,
  },
  methods: {
    stopEvaling() {
      this.$root.$data.isEvaling = false;
    },
  },
  created() {
    this.$root.$data.board = [];
    for (let i = 0; i < this.width; i++) {
      this.$root.$data.board.push([]);
      for (let j = 0; j < this.height; j++) {
        this.$root.$data.board[i].push([]);
      }
    }
    this.$root.$data.createdObjects = [];
  },
};
</script>