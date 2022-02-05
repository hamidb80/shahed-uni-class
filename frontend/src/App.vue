<template>
  <div class="wrapper">
    <div :class="['overly', { active: form || showMenu }]">
      <div class="forms" v-if="form">
        <div v-if="loading" class="loading">صبر کنید ...</div>
        <login-form v-else-if="form === 'login'" @submit="login" />
        <class-form
          v-else-if="form === 'class'"
          :data="selectedItemId ? classes[selectedItemId] : {}"
          :isAdmin="isVerifed"
          @delete="deleteClass"
          @createOrUpadte="createOrUpadteClass"
        />
        <reminder-form
          v-else-if="form === 'training'"
          type="training"
          :data="selectedItemId ? reminders[selectedItemId] : {}"
          :isAdmin="isVerifed"
          :classes="classes"
          @delete="deleteReminder"
          @createOrUpadte="createOrUpadteReminder"
        />
        <reminder-form
          v-else-if="form === 'event'"
          type="event"
          :data="selectedItemId ? reminders[selectedItemId] : {}"
          :isAdmin="isVerifed"
          :classes="classes"
          @delete="deleteReminder"
          @createOrUpadte="createOrUpadteReminder"
        />
        <send-message-form
          v-else-if="form === 'send-message'"
          @send="sendMessage"
        />
        <class-list-form
          v-else-if="form === 'class-list'"
          :classes="classes"
          @redirect="handleClassRedirect"
        />
      </div>
    </div>

    <header class="app-header">
      <h1 class="title">مهندسی کامپیوتر دانشگاه شاهد ۹۹</h1>
    </header>

    <div class="table program" @scroll="onTableScroll" ref="program_table">
      <div
        :class="{'column times': true, 'float': tableScroll> 20}"
        :style="{ transform: `translateX(${tableScroll}px)`}"
      >
        <div class="corner cell"></div>
        <div class="time cell" v-for="t in times" :key="t">
          <span class="text">
            {{ toPersianTime(t) }}
          </span>
        </div>
      </div>

      <div class="column" v-for="(day, di) in program" :key="di">
        <div class="day cell">
          <span class="text">
            {{ weekDays[di] }}
          </span>
        </div>

        <div class="time cell" v-for="(time, ti) in times" :key="ti"></div>
        <div
          class="classes"
          :style="{ marginTop: `-${times.length * timeCellHeight}px` }"
        >
          <div
            class="class"
            v-for="(clsItem, ci) in program[di]"
            :key="ci"
            :style="{
              transform: `translate(
                ${(ci % 4) * classItemWidth}px,  
                ${
                  (-clsItem.timeOffset / 30) * timeCellHeight +
                  calcOffset(clsItem)
                }px
              )`,
              height: `${calcLen(clsItem)}px`,
              backgroundColor: clsItem.color,
            }"
            @click="clickOnItem('class', clsItem._id)"
          >
            <div class="lesson">
              {{ classes[clsItem._id].lesson }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <section class="tranings-wrapper">
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
          @click="clickOnItem('training', tr._id)"
        >
          <td>{{ tr["name"] }}</td>
          <td>{{ classes[tr["classId"]]["lesson"] }}</td>
          <td>{{ classes[tr["classId"]]["teacher"] }}</td>
          <td>{{ toPersianDate(tr["datetime"]) }}</td>
        </tr>
      </table>
    </section>

    <section class="events-wrapper">
      <header>
        <h2>رویداد ها</h2>
      </header>

      <table class="events">
        <tr>
          <th>نام</th>
          <th>کلاس</th>
          <th>استاد</th>
          <th>تاریخ</th>
        </tr>
        <tr
          v-for="(ev, id) in events"
          :key="id"
          @click="clickOnItem('event', ev._id)"
        >
          <td>{{ ev["name"] }}</td>
          <td>{{ classes[ev["classId"]]["lesson"] }}</td>
          <td>{{ classes[ev["classId"]]["teacher"] }}</td>
          <td>{{ toPersianDate(ev["datetime"]) }}</td>
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
            <div class="btn" @click="changeForm('class-list')">
              <uniI class="icon" />
            </div>
            <div class="btn" @click="changeForm('class')">
              <schoolI class="icon" />
            </div>
            <div class="btn" @click="changeForm('training')">
              <bookI class="icon" />
            </div>
            <div class="btn" @click="changeForm('event')">
              <calendarI class="icon" />
            </div>
            <div class="btn" @click="changeForm('send-message')">
              <botI class="icon" />
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
import {
  weekDays,
  times,
  toPersianTime,
  genProgram,
  timeSpace,
} from "./utils/helper.js";

import axios from "axios";

import loginI from "./icons/vue/login.vue";
import moreI from "./icons/vue/more.vue";
import schoolI from "./icons/vue/school.vue";
import closeI from "./icons/vue/close.vue";
import bookI from "./icons/vue/book.vue";
import calendarI from "./icons/vue/calendar.vue";
import botI from "./icons/vue/bot.vue";
import uniI from "./icons/vue/university.vue";

import loginF from "./forms/login.vue";
import classF from "./forms/class.vue";
import eventF from "./forms/reminder.vue";
import sendMsgF from "./forms/send-msg.vue";
import classListF from "./forms/class-list.vue";

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
    botI,
    uniI,
    calendarI,

    "class-form": classF,
    "login-form": loginF,
    "reminder-form": eventF,
    "send-message-form": sendMsgF,
    "class-list-form": classListF,
  },

  data: () => ({
    weekDays,
    times,
    timeCellHeight: 32,
    classItemWidth: 50,

    tableScroll: 0,

    isVerifed: false,
    showMenu: false,
    form: "",
    secretKey: "",
    selectedItemId: "",

    classes: {}, // classId => class{teacher, lesson, program}
    reminders: {},

    trainings: [],
    events: [],

    program: [[], [], [], [], [], [], []],

    loading: false,
  }),

  computed: {
    reqCfg() {
      return { headers: { "secret-key": this.secretKey } };
    },
  },

  methods: {
    toPersianTime,

    calcOffset(clsItem) {
      return (
        ((clsItem.start - this.times[0]) / timeSpace) * this.timeCellHeight
      );
    },

    calcLen(clsItem) {
      return ((clsItem.end - clsItem.start) / timeSpace) * this.timeCellHeight;
    },

    toPersianDate(dt) {
      return new Date(dt).toLocaleDateString("fa-IR");
    },

    async sendMessage(text) {
      this.loading = true;
      await httpClient.post(`/bot/sendText`, { msg: text }, this.reqCfg);
      this.loading = false;
    },

    clickOnItem(formName, itemId) {
      this.showMenu = true;
      this.form = formName;

      if (formName === "class") this.selectedItemId = itemId;
      else if (formName === "training") this.selectedItemId = itemId;
      else if (formName === "event") this.selectedItemId = itemId;
    },

    handleClassRedirect(classId) {
      this.clickOnItem("class", classId);
    },

    changeForm(formName) {
      this.form = formName;
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
      this.selectedItemId = "";

      await httpClient.delete(`/class/${classId}`, this.reqCfg);
      await this.update();
    },

    async createOrUpadteReminder(trId, trainingObject) {
      this.loading = true;

      if (trId)
        await httpClient.put(`/reminder/${trId}`, trainingObject, this.reqCfg);
      else await httpClient.post("/reminder", trainingObject, this.reqCfg);

      await this.update();
    },
    async deleteReminder(trId) {
      this.loading = true;
      this.selectedItemId = "";

      await httpClient.delete(`/reminder/${trId}`, this.reqCfg);
      await this.update();
    },

    async update() {
      this.loading = true;

      let res = await httpClient.get("/getAll");

      this.classes = res.data["classes"];
      this.reminders = res.data["reminders"];

      this.trainings = res.data["trainings"];
      this.events = res.data["events"];

      this.program = genProgram(this.classes);

      this.loading = false;
    },

    closeMenu() {
      this.showMenu = false;
      this.form = "";
      this.selectedItemId = "";
    },

    onTableScroll() {
      this.tableScroll = this.$refs.program_table.scrollLeft;
    },
  },

  mounted() {
    this.update();
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") this.closeMenu();
    });
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
  color: @almostBlack;
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
@dayCellHeight: 56px;
@timeCellHeight: 32px;

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
    width: 210px;

    .classes {
      .class {
        width: 40px;
        cursor: pointer;
        border-radius: 4px;
        .px(6px);
        .py(2px);
        margin-left: 10px;
        // display: inline-block;

        overflow: hidden;

        .lesson {
          .fa();
          color: white;
          width: 200px;
          transform: translate(-86px, 93px) rotate(-90deg);
        }
      }
    }

    .cell {
      display: flex;
      align-items: center;
      justify-content: center;
      border: 0.5px solid #d1d1d1;
      width: 100%;
      height: @timeCellHeight;

      .text {
        .fa();
        text-align: center;
      }

      &.day,
      &.corner {
        font-size: 1.3rem;
        font-weight: bold;
        color: white;
        height: @dayCellHeight;
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
          background-color: #c8f6ed;
        }
      }
    }

    &:nth-child(even) {
      .cell {
        background-color: @almostWhite;
      }
      .day {
        background-color: @c2;
      }
    }

    &:nth-child(odd) {
      .cell {
        background-color: white;
      }
      .day {
        background-color: @c1;
      }
    }

    &.times {
      width: 100px;
      z-index: 3;
      transition: 0.5s width;
      will-change: width;

      &.float {
        width: 72px;
      }

      .cell {
        color: white;
        font-weight: bold;
        background-color: @c3;

        border-top-color: #565656;
        border-bottom-color: #565656;
        direction: ltr;
        border-top: 2px solid lighten(@c3, 40%);
      }
      .text {
        direction: ltr;
        transform: translateY(-16px);
        display: inline-block;
        background-color: darken(@c3, 8%);
        .px(8px);
        .py(1px);
        border-radius: 12px;
      }
      .corner {
        border: none;
        background-color: transparent;
      }
    }

    @media screen and (max-width: @mobile-width) {
      .cell {
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
        background-color: @almostWhite;
      }

      &:first-child {
        background-color: @c3;
        color: white;
      }
      &:hover {
        cursor: pointer;
        td {
          background-color: @highlight;
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
      background: @almostBlack;
      .circle(48px);

      .icon {
        .square(60%);
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
