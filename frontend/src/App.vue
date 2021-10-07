<template>
  <div class="wrapper">
    <div :class="['overly', { active: form || showMenu }]">
      <div class="forms" v-if="form">
        <div v-if="loading" class="loading">صبر کنید ...</div>
        <login-form v-else-if="form === 'login'" @submit="login" />
        <class-form
          v-else-if="form === 'class'"
          :data="selectedClassId ? classes[selectedClassId] : {}"
          :isAdmin="isVerifed"
          @delete="deleteClass"
          @createOrUpadte="createOrUpadteClass"
        />
        <training-form
          v-else-if="form === 'training'"
          :data="selectedTrainingId ? trainings[selectedTrainingId] : {}"
          :isAdmin="isVerifed"
          :classes="classes"
          @delete="deleteEvent"
          @createOrUpadte="createOrUpadteEvent"
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
          <span class="text">
            {{ time }}
          </span>
        </div>
      </div>

      <div
        :class="['column', `max-classes-${maxDaysClasses[di]}`]"
        v-for="(day, di) in program"
        :key="di"
      >
        <div class="day cell">
          <span class="text">
            {{ weekDays[di] }}
          </span>
        </div>
        <div class="time cell" v-for="(time, ti) in day" :key="ti">
          <template v-if="time.length">
            <div
              class="class"
              v-for="clsId in time"
              :key="clsId"
              @click="clickOnItem('class', clsId)"
            >
              {{ classes[clsId].lesson }}
            </div>
          </template>
          <div v-else class="class empty"></div>
        </div>
      </div>
    </div>

    <section>
      <header>
        <h2>تمرین ها</h2>
      </header>
      <table class="tranings">
        <tr>
          <th>نام</th>
          <th>کلاس</th>
          <th>استاد</th>
          <th>تاریخ تحویل</th>
        </tr>
        <tr
          v-for="(tr, id) in trainings"
          :key="id"
          @click="clickOnItem('training', id)"
        >
          <td>{{ tr["name"] }}</td>
          <td>{{ classes[tr["classId"]]["lesson"] }}</td>
          <td>{{ classes[tr["classId"]]["teacher"] }}</td>
          <td>{{ new Date(tr["datetime"]).toLocaleDateString("fa-IR") }}</td>
        </tr>
      </table>
    </section>

    <section>
      <header>
        <h2>رویداد ها</h2>
      </header>

      <table class="events">
        <tr>
          <th>نام</th>
          <th>کلاس</th>
          <th>تاریخ</th>
        </tr>
        <tr v-for="ev in events" :key="ev['_id']">
          <td>{{ ev["name"] }}</td>
          <td>{{ ev["classId"] }}</td>
          <td>{{ ev["datetime"] }}</td>
        </tr>
      </table>
    </section>

    <footer class="app-footer">
      <div class="tool-bar">
        <div>
          <div v-if="!(form || showMenu)" class="btn" @click="showMenu = true">
            <moreI class="icon" />
          </div>
          <div v-else class="btn" @click="closeMenu">
            <closeI class="icon" />
          </div>
        </div>

        <div v-if="showMenu && !form">
          <div v-if="isVerifed">
            <div class="btn" @click="changeForm('class')">
              <schoolI class="icon" />
            </div>
            <div class="btn" @click="changeForm('training')">
              <bookI class="icon" />
            </div>
            <div class="btn" @click="changeForm('event')">
              <calendarI class="icon" />
            </div>
          </div>
          <div v-else class="btn" @click="changeForm('login')">
            <loginI class="icon" />
          </div>
        </div>
      </div>
    </footer>

    <div class="bottom-space"></div>
  </div>
</template>

<script>
import { weekDays, classTimes } from "./utils/meta.js";
import axios from "axios";

import loginI from "./icons/vue/login.vue";
import moreI from "./icons/vue/more.vue";
import schoolI from "./icons/vue/school.vue";
import closeI from "./icons/vue/close.vue";
import bookI from "./icons/vue/book.vue";
import calendarI from "./icons/vue/calendar.vue";

import loginF from "./forms/login.vue";
import classF from "./forms/class.vue";
import trainingF from "./forms/training.vue";

const httpClient = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? // ? "http://shahed-class-bot-hamidb.fandogh.cloud/api/"
        "http://localhost:3000/api/"
      : "/api/",
  timeout: 60 * 1000,
});

export default {
  name: "main-page",
  components: {
    loginI,
    moreI,
    schoolI,
    closeI,
    bookI,

    calendarI,

    "class-form": classF,
    "login-form": loginF,
    "training-form": trainingF,
  },

  data: () => ({
    weekDays,
    classTimes,

    isVerifed: false,
    showMenu: false,
    form: "",
    secretKey: "",

    selectedClassId: "",
    selectedTrainingId: "",
    selectedEventId: "",

    classes: {}, // classId => class{teacher, lesson, program}
    program: [],
    trainings: {},
    events: {},

    maxDaysClasses: [], // array of int

    loading: false,
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
    clickOnItem(formName, itemId) {
      this.showMenu = true;
      this.form = formName;

      if (formName === "class") this.selectedClassId = itemId;
      else if (formName === "training") this.selectedTrainingId = itemId;
    },

    changeForm(formName) {
      this.form = formName;
      this.selectedClassId = "";
    },

    async login(secretKey) {
      this.loading = true;

      this.secretKey = secretKey;
      let res = await httpClient.post("/verify", { secretKey }, this.reqCfg);
      this.isVerifed = res.data["result"];

      this.form = "";
      this.showMenu = false;
      this.loading = false;
    },

    async createOrUpadteClass(classId, classObject) {
      this.loading = true;

      if (classId)
        await httpClient.put(`/class/${classId}`, classObject, this.reqCfg);
      else await httpClient.post("/class", classObject, this.reqCfg);

      await this.update();
    },
    async deleteClass(classId) {
      this.loading = true;
      this.selectedClassId = "";

      await httpClient.delete(`/class/${classId}`, this.reqCfg);
      await this.update();
    },

    async createOrUpadteEvent(trId, trainingObject) {
      this.loading = true;

      if (trId)
        await httpClient.put(`/event/${trId}`, trainingObject, this.reqCfg);
      else await httpClient.post("/event", trainingObject, this.reqCfg);

      await this.update();
    },
    async deleteEvent(trId) {
      this.loading = true;
      this.selectedTrainingId = "";

      await httpClient.delete(`/event/${trId}`, this.reqCfg);
      await this.update();
    },

    async update() {
      this.loading = true;

      let res = await httpClient.get("/getAll");

      this.classes = res.data.classes;
      this.program = res.data.program;
      this.trainings = res.data.trainings;
      this.events = res.data.events;

      this.maxDaysClasses = this.program.map((dayProgram) =>
        Math.max(...dayProgram.map((time) => time.length))
      );

      this.loading = false;
    },

    closeMenu() {
      this.showMenu = false;
      this.form = "";
    },
  },

  mounted() {
    this.update();
  },
};
</script>

<style lang="less">
@import url("./styles/global.less");

@mobile-column-width: 84px;
@mobile-column-step: 56px;
@desktop-column-width: 128px;
@desktop-column-step: 36px;

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
  max-width: 100vw;
  overflow-x: scroll;
  white-space: nowrap;

  .column {
    display: inline-flex;
    flex-shrink: 0;
    flex-direction: column;
    white-space: normal;

    .cell {
      display: flex;
      align-items: center;
      justify-content: center;
      border: 0.5px solid #aaa;
      width: 100%;
      height: 80px;

      .class,
      .text {
        .fa();
        text-align: center;
      }

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
        padding: 4px;
        justify-content: center;
        align-items: center;
        cursor: pointer;

        border: 0.5px solid #aaa;
        border-bottom: none;
        border-top: none;

        &:first-child {
          border-left: none;
        }
        &:last-child {
          border-right: none;
        }

        &:hover {
          background-color: #ffecc8;
        }
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
      width: 100px;

      .cell {
        color: white;
        font-weight: bold;
        background-color: #212121;

        border-top-color: #565656;
        border-bottom-color: #565656;
        direction: ltr;
      }
      .text {
        direction: ltr;
      }
      .corner {
        background-color: transparent;
      }
    }

    &.max-classes-0 {
      width: @desktop-column-width;
    }
    &.max-classes-1 {
      width: @desktop-column-width + @desktop-column-step;
    }
    &.max-classes-2 {
      width: @desktop-column-width + 2 * @desktop-column-step;
    }
    &.max-classes-3 {
      width: @desktop-column-width + 3 * @desktop-column-step;
    }

    @media screen and (max-width: @mobile-width) {
      &.max-classes-0 {
        width: @mobile-column-width + @mobile-column-step;
      }
      &.max-classes-1 {
        width: @mobile-column-width + @mobile-column-step;
      }
      &.max-classes-2 {
        width: @mobile-column-width + 2 * @mobile-column-step;
      }
      &.max-classes-3 {
        width: @mobile-column-width + 3 * @mobile-column-step;
      }

      .cell {
        height: 56px;

        .text,
        .class {
          font-size: 15px;
        }
      }
    }
  }
}

section {
  margin-top: 40px;
  .px(16px);

  header {
    h2 {
      .fa();
    }
  }

  table {
    direction: rtl;
    width: 100%;
    border-collapse: collapse;

    tr {
      td,
      th {
        border: 1px solid #565656;
        text-align: center;
        .fa();
      }

      &:nth-child(even) {
        background-color: #f3f3f3;
      }

      &:first-child {
        background-color: #212121;
        color: white;
      }
      &:hover {
        cursor: pointer;
        td {
          background-color: #ffecc8;
        }
      }
    }
  }

  @media screen and (max-width: @mobile-width) {
    .px(0);
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

.bottom-space {
  margin-top: 100px;
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
  max-height: 90%;
  overflow-y: scroll;
  width: 70%;
  padding-top: 30px;
  padding-bottom: 50px;
  .px(20px);
  border-radius: 4px;
  box-shadow: 0 4px 5px #00000030;
  background-color: white;

  .loading {
    .fa();
    text-align: center;
    font-size: 18px;
  }

  @media screen and (max-width: @mobile-width) {
    width: 100%;
  }
}
</style>
