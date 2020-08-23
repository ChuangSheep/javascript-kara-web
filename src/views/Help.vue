<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <h1>{{$t("help.title")}}</h1>
      </v-col>
      <v-col cols="12" md="8" class="text-right" id="left-on-mobile">
        <v-menu open-on-hover bottom offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn text v-bind="attrs" v-on="on">
              <v-icon left>mdi-code-tags</v-icon>
              {{currentDocDisplay}}
            </v-btn>
          </template>

          <v-list>
            <v-list-item v-for="(doc, index) in docTypes" :key="index" @click="changeDoc(doc)">
              <v-list-item-title>{{ doc }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>

      <v-col cols="12"><h3>API Documentation</h3></v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title>
            Methods / Functions
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="docs[currentDoc]"
            :search="search"
            item-key="name"
            show-expand
            :expanded.sync="expanded"
            :single-expand="false"
          >
            <!-- Ignore this eslint error since it is not actually an error -->
            <template v-slot:item.name="{ item }">
              <b>{{item.name}}</b>
            </template>
            <!-- Ignore this eslint error since it is not actually an error -->
            <template v-slot:item.params="{ item }">
              <ul class="params">
                <li v-if="item.params.length === 0">None</li>
                <li v-for="(i, index) in item.params" :key="index">{{i}}</li>
              </ul>
            </template>
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length">
                <div class="addition-info">
                  <p>
                    <b>Description:</b>
                    {{item.desc}}
                  </p>
                  <div>
                    <b>Exceptions:</b>
                    <ul class="exceptions">
                      <li v-if="item.throws.length === 0">None</li>
                      <li v-for="(i, index) in item.throws" :key="index">{{i}}</li>
                    </ul>
                  </div>
                </div>
              </td>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="css">
.params {
  padding: 10px 0;
}

.params li {
  padding: 3px 0;
}

.exceptions {
  padding: 10px 0;
}

.exceptions li {
  padding: 3px 0;
  margin-left: 15px;
}

.v-data-table__mobile-row {
  height: fit-content !important;
}

.v-data-table__mobile-row ul {
  list-style-type: none;
}

.addition-info {
  padding: 15px 0 5px 2.5vw;
}

@media screen and (max-width: 600px) {
  #left-on-mobile {
    margin-left: 0;
    text-align: left !important;
  }
}
</style>

<script>
import utilFuncs from "@/api-docs/utilityFunctions.json";
import kara from "@/api-docs/kara.json";

export default {
  data() {
    return {
      search: "",
      currentDoc: "",
      expanded: [],
      headers: [
        {
          text: "Function Name",
          value: "name",
        },
        {
          text: "Parameters",
          value: "params",
          sortable: false,
        },
        {
          text: "Return",
          value: "return",
          sortable: false,
        },
        { text: "", value: "data-table-expand" },
      ],
      docs: {},
      docTypes: [],
    };
  },
  computed: {
    currentDocDisplay() {
      switch (this.currentDoc) {
        case "utilFuncs":
          return "Utility Functions";
        case "kara":
          return "Class Kara";
        default:
          return "null";
      }
    },
  },
  methods: {
    changeDoc(doc) {
      switch (doc) {
        case "Utility Functions":
          this.currentDoc = "utilFuncs";
          break;
        case "Class Kara":
          this.currentDoc = "kara";
          break;
      }
    },
  },
  mounted() {
    let doc = {};
    doc.utilFuncs = utilFuncs;
    this.docTypes.push("Utility Functions");
    doc.kara = kara;
    this.docTypes.push("Class Kara");

    Object.assign(this.docs, doc);
    this.currentDoc = "utilFuncs";
  },
};
</script>