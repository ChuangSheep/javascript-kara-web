<template>
  <v-dialog v-model="dialog" width="80vw" persistent>
    <template v-slot:activator="{ on, attrs }">
      <v-list-item link v-bind="attrs" v-on="on" :disabled="disabled">
        <v-list-item-action>
          <v-icon>fa-cog</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{$t("setting.title")}}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>

    <v-card>
      <v-card-title class>{{$t("setting.title")}}</v-card-title>

      <v-container>
        <v-row justify="space-around">
          <v-col cols="12" md="11">
            <v-slider :label="$t('setting.speed')" max="3000" min="50" v-model="speed">
              <template v-slot:append>
                <span>{{speed}}</span>
              </template>
            </v-slider>
          </v-col>
          <v-col cols="6" md="5">
            <v-switch :label="$t('setting.detailed')" v-model="detailed"></v-switch>
          </v-col>
          <v-col cols="6" md="5">
            <v-switch :label="$t('setting.legacy')" v-model="legacy"></v-switch>
          </v-col>
        </v-row>
      </v-container>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="close">{{$t("common.closeBtn")}}</v-btn>
        <v-btn color="primary" text @click="save">{{$t("common.saveBtn")}}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    disabled: Boolean,
  },
  data() {
    return {
      dialog: false,
      speed: 1000,
      detailed: false,
      legacy: false,
    };
  },
  watch: {
    dialog() {
      let data = this.$root.$data.setting;
      this.speed = data.speed;
      this.detailed = data.detailed;
      this.legacy = data.legacy;
    },
  },
  methods: {
    close() {
      this.dialog = false;
      this.$emit("close");
    },
    save() {
      this.dialog = false;
      let data = {
        speed: this.speed,
        detailed: this.detailed,
        legacy: this.legacy,
      };
      this.$emit("save", data);
    },
  },
};
</script>