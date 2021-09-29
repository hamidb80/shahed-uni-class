<template>
  <div lang="app">
    <div :class="['overly', { active: showMenu }]">
      <div class="forms" v-if="form && showMenu">
        <login-form v-if="form === 'login'" @submit="login" />
        <class-form
          v-else-if="form === 'class'"
          :data="selectedClassId ? classes[selectedClassId] : {}"
          :isAdmin="isVerifed"
          @delete="deleteClass"
          @createOrUpadte="createOrUpadteClass"
        />
      </div>
    </div>

    <header class="app-header">
      <h1 class="title">مهندسی کامپیوتر دانشگاه شاهد 99</h1>
    </header>

    <div class="table program">
      <div class="column times">
        <div class="corner cell"></div>
        <div class="time cell" v-for="time in classTimes" :key="time">
          {{ time }}
        </div>
      </div>

      <div class="column" v-for="(day, di) in program" :key="di">
        <div class="day cell">{{ weekDays[di] }}</div>
        <div
          :class="['time', 'cell', `size-${time.length}`]"
          v-for="(time, ti) in day"
          :key="ti"
        >
          <template v-if="time.length">
            <div
              class="class"
              v-for="clsId in time"
              :key="clsId"
              @click="clickOnClass(clsId)"
            >
              {{ classes[clsId].lesson }}
            </div>
          </template>
          <div v-else class="class empty"></div>
        </div>
      </div>
    </div>

    <footer class="app-footer">
      <div class="tool-bar">
        <div class="btn" @click="showMenu = !showMenu">
          <closeI v-if="showMenu" class="icon" />
          <moreI v-else class="icon" />
        </div>

        <template v-if="showMenu">
          <div class="btn" v-if="isVerifed" @click="changeForm('class')">
            <schoolI class="icon" />
          </div>
          <template v-else>
            <div class="btn" @click="changeForm('login')">
              <loginI class="icon" />
            </div>
          </template>
        </template>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { weekDays, classTimes } from "./utils/meta";
import axios from "axios";

import loginI from "./icons/vue/login.vue";
import moreI from "./icons/vue/more.vue";
import schoolI from "./icons/vue/school.vue";
import closeI from "./icons/vue/close.vue";

import loginF from "./forms/login.vue";
import classF from "./forms/class.vue";

const httpClient = axios.create({
  baseURL: "http://localhost:3000/api/",
  timeout: 10 * 1000,
});

@Options({
  name: "main-page",
  components: {
    loginI,
    moreI,
    schoolI,
    closeI,

    "class-form": classF,
    "login-form": loginF,
  },

  data: () => ({
    weekDays,
    classTimes,

    isVerifed: false,
    showMenu: false,
    form: "",
    secretKey: "",

    selectedClassId: "",

    classes: {}, // classId => class{teacher, lesson, program}
    program: [],
  }),

  computed: {
    reqCfg() {
      return {
        headers: {
          "secret-key": this.secretKey,
        },
      };
    },
  },

  methods: {
    clickOnClass(classId: string) {
      this.showMenu = true;
      this.form = "class";
      this.selectedClassId = classId;
    },

    changeForm(formName: string) {
      this.form = formName;
      this.selectedClassId = "";
    },

    async login(secretKey: string) {
      this.secretKey = secretKey;
      let res = await httpClient.post("/verify", { secretKey }, this.reqCfg);
      this.isVerifed = res.data["result"];
    },

    async createOrUpadteClass(classId: string, classObject: unknown) {
      if (classId)
        await httpClient.put(`/class/${classId}`, classObject, this.reqCfg);
      else await httpClient.post("/class", classObject, this.reqCfg);

      await this.update();
    },

    async deleteClass(classId: string) {
      await httpClient.delete(`/class/${classId}`, this.reqCfg);
      await this.update();
    },

    async update() {
      let res = await httpClient.get("/getAll");
      this.classes = res.data.classes;
      this.program = res.data.program;
    },
  },

  mounted() {
    this.update();
  },
})
export default class App extends Vue {
  secretKey!: string;
}
</script>

<style lang="less">
@import url("./styles/global.less");

.app-header {
  color: #424242;
  box-shadow: 0 4px 5px #00000030;
  z-index: 1;
  position: relative;

  .title {
    direction: rtl;
    font-size: 26px;
    padding: 4px 16px;
    text-align: center;
    .fa();
  }
}

.table.program {
  display: flex;
  max-width: 100%;
  overflow-x: scroll;

  .column {
    display: flex;
    flex-direction: column;

    .cell {
      display: flex;
      align-items: center;
      justify-content: center;
      border: 0.5px solid #aaa;
      width: 200px;
      height: 80px;
      .fa();

      &.day,
      &.corner {
        font-size: 1.4rem;
        font-weight: bold;
        height: 60px;
        color: white;
      }
      &.day {
        border-right-color: white;
        border-left-color: white;
      }

      .class {
        height: 100%;
        flex-grow: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;

        &:hover {
          background-color: #ffecc8;
        }
      }

      &.size-2,
      &.size-3 {
        .class {
          border: 0.5px solid #aaa;
          border-bottom: none;
          border-top: none;

          &:first-child {
            border-left: none;
          }
          &:last-child {
            border-right: none;
          }
        }
      }
    }

    &.times {
      .cell {
        width: 100px;
      }
    }

    &:nth-child(even) {
      .cell {
        background-color: #f3f3f3;
      }
      .day {
        background-color: #ff5555;
      }
    }

    &:nth-child(odd) {
      .cell {
        background-color: white;
      }
      .day {
        background-color: #ff6b00;
      }
    }

    &.times {
      .cell {
        color: white;
        font-weight: bold;
        background-color: #212121;

        border-top-color: #565656;
        border-bottom-color: #565656;
      }
      .corner {
        background-color: transparent;
      }
    }
  }
}

.app-footer {
  position: fixed;
  bottom: 0;
  z-index: 2;
  width: 100%;
  padding: 24px;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;

  .tool-bar {
    display: inline-flex;
    flex-direction: column-reverse;
    pointer-events: all;

    .btn {
      display: flex;
      justify-content: center;
      cursor: pointer;
      align-items: center;
      margin: 12px;
      background: #212121;
      .circle(48px);

      .icon {
        .square(70%);
        fill: white;
      }
    }
  }
}

.overly {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 2;

  &.active {
    background-color: rgba(0, 0, 0, 0.3);
    pointer-events: all;
  }
}

.forms {
  z-index: 2;
  width: 70%;
  padding-top: 30px;
  padding-bottom: 50px;
  .px(20px);
  border-radius: 4px;
  box-shadow: 0 4px 5px #00000030;
  background-color: white;

  header {
    text-align: center;
    .fa();
    font-size: 26px;
  }
  .form {
    display: flex;
    flex-direction: column;

    .class-time-settings {
      display: flex;
      flex-direction: column;

      .day {
        display: flex;
        flex-direction: row-reverse;
        border-top: 1px solid #eee;

        .name {
          .fa();
          width: 160px;
          text-align: right;
        }

        .times {
          flex-grow: 1;
          flex-wrap: wrap;
          display: inline-flex;
          flex-direction: row;

          .time {
            .mx(6px);
            .my(4px);
            border-radius: 4px;
            background-color: #eee;
            color: #212121;
            .fa();
            cursor: pointer;
            padding: 6px 12px;

            &:first-child {
              margin-left: 0;
            }
            &:last-child {
              margin-right: 0;
            }
            &.active {
              color: white;
              background-color: tomato;
            }
          }
        }
      }
    }

    .days {
      display: flex;
      flex-direction: row-reverse;
      justify-content: space-between;
      .my(40px);

      .day {
        border-radius: 4px;
        width: 80px;
        text-align: center;
        .fa();
        .px(8px);
        .py(2px);
        .mx(-16px);
        font-size: 16px;
        transform: rotate(90deg);
        color: #424242;
        background-color: #eee;
        cursor: pointer;

        &.active {
          color: white;
          background-color: tomato;
        }
      }
    }

    input {
      padding: 10px;
      border-radius: 4px;
      .fa();
      direction: rtl;
      border: 2px solid #565656;
      outline: none;
      font-size: 18px;
    }

    .btn {
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      .px(16px);
      .py(6px);
      border: 2px solid tomato;
      background-color: tomato;
      color: white;
      .fa();
      font-size: 18px;

      &:hover {
        background-color: transparent;
        color: tomato;
      }
    }
  }
}
</style>
