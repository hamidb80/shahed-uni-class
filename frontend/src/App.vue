<template>
  <div lang="app">
    <div :class="['overly', { active: showMenu }]"></div>

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
            <div class="class" v-for="(cls, ci) in time" :key="ci">
              {{ cls.lesson }} - {{ cls.teacher }}
            </div>
          </template>
          <div v-else class="class empty"></div>
        </div>
      </div>
    </div>

    <div class="dialog-wrapper">
      <div class="dialog"></div>
    </div>

    <footer class="app-footer">
      <div class="tool-bar">
        <div class="btn" @click="showMenu = !showMenu">
          <moreI class="icon" />
        </div>

        <template v-if="showMenu">
          <div class="btn" v-if="secretCode === ''">
            <loginI class="icon" />
          </div>
          <template v-else>
            <div class="btn">
              <loginI class="icon" />
            </div>
            <div class="btn">
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
import { convertLatin2PersianDigits } from "./utils/persian";

import loginI from "./icons/vue/login.vue";
import moreI from "./icons/vue/more.vue";

@Options({
  name: "main-page",
  components: {
    loginI,
    moreI,
  },

  data: () => ({
    classTimes: [
      "8 - 9:30",
      "9:30 - 11",
      "11 - 12:30",
      "13:30 - 15",
      "15 - 16:30",
      "16:30 - 18",
      "18 - 19:30",
    ].map(convertLatin2PersianDigits),

    weekDays: [
      "شنبه",
      "یک شنبه",
      "دو شنبه",
      "سه شنبه",
      "چهارشنبه",
      "پنج شنبه",
      "جمعه",
    ],

    showMenu: false,
    secretCode: "",

    program: [
      [
        // sat
        [{ teacher: "زمانی", lesson: "مدار" }],
        [],
        [],
        [],
        [],
        [],
        [],
      ],

      [
        // sun
        [],
        [],
        [],
        [],
        [],
        [],
        [],
      ],

      [
        // mon
        [],
        [],
        [],
        [
          { teacher: "زمانی", lesson: "مدار" },
          { teacher: "زمانی", lesson: "مدار" },
        ],
        [{ teacher: "زمانی", lesson: "مدار" }],
        [],
        [],
      ],

      [
        // tue
        [],
        [],
        [],
        [],
        [],
        [],
        [],
      ],

      [
        // wed
        [],
        [],
        [],
        [],
        [],
        [],
        [],
      ],

      [
        // thu
        [],
        [],
        [],
        [],
        [],
        [],
        [],
      ],

      [
        // fri
        [],
        [],
        [],
        [],
        [],
        [],
        [],
      ],
    ],
  }),
})
export default class App extends Vue {}
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

.dialog-wrapper {
  .dialog {
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
  pointer-events: none;
  position: fixed;
  z-index: 2;
  width: 100vw;
  height: 100vh;
  background-color: black;
  opacity: 0;

  &.active {
    pointer-events: all;
    opacity: 0.3;
  }
}
</style>
