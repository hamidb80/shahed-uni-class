<template>
  <div class="form class">
    <input
      type="text"
      class="input"
      v-model="teacher"
      placeholder="نام استاد"
      :disabled="!isAdmin"
    />
    <input
      type="text"
      class="input"
      v-model="lesson"
      placeholder="نام درس"
      :disabled="!isAdmin"
    />

    <textarea
      type="text"
      class="input"
      v-model="description"
      placeholder="توضیحات"
      :disabled="!isAdmin"
    />

    <div class="days">
      <div
        v-for="(day, di) in weekDays"
        :key="di"
        @click="toggleDay(di)"
        :class="['day', { active: selectedDays.includes(di) }]"
      >
        <span> {{ day }} </span>
      </div>
    </div>

    <div class="class-time-settings">
      <div
        v-for="di in selectedDays"
        :key="di"
        class="day"
        v-show="program[di] !== null"
      >
        <div class="name">
          {{ weekDays[di] }}
        </div>
        <div class="times">
          <div
            v-for="(time, ti) in classTimes"
            :key="ti"
            @click="toggleTime(di, ti)"
            :class="[
              'time',
              {
                active: program[di].includes(ti),
              },
            ]"
          >
            {{ time }}
          </div>
        </div>
      </div>
    </div>

    <div class="btn" v-if="isAdmin" @click="handleSubmit">ثبت</div>
    <div class="btn" v-if="isAdmin && fromExisting" @click="handleDelete">
      حذف
    </div>
  </div>
</template>

<script>
import { classTimes, weekDays } from "../utils/meta.js";

export default {
  props: {
    data: Object,
    isAdmin: Boolean,
  },

  emits: ["delete", "createOrUpadte"],

  data: () => ({
    teacher: "",
    lesson: "",
    description: "",

    program: [[], [], [], [], [], [], []],

    // ----------------
    fromExisting: false,
    selectedDays: [],

    classTimes,
    weekDays,
  }),

  watch: {
    data(newD) {
      this.checkInput(newD);
    },
  },

  mounted() {
    this.checkInput(this.data);
  },

  methods: {
    checkInput(inputData) {
      if (Object.keys(inputData).length !== 0) {
        this.teacher = inputData["teacher"];
        this.lesson = inputData["lesson"];
        this.program = inputData["program"];
        this.description = inputData["description"];
        this.selectedDays = inputData["program"]
          .map((day, i) => (day.length !== 0 ? i : -1))
          .filter((n) => n !== -1);

        this.fromExisting = true;
      } else {
        this.fromExisting = false;
      }
    },

    toggleDay(di) {
      // di => day index
      if (!this.isAdmin) return;

      let i = this.selectedDays.findIndex((d) => d === di);

      if (i === -1) {
        this.selectedDays.push(di);
        this.selectedDays.sort();
      } else {
        this.selectedDays.splice(i, 1);
        this.program[di] = [];
      }
    },
    toggleTime(di, ti) {
      // di => day index , ti => time index
      if (!this.isAdmin) return;

      let i = this.program[di].findIndex((v) => v === ti);

      if (i === -1) this.program[di].push(ti);
      else this.program[di].splice(i, 1);
    },

    handleSubmit() {
      this.$emit("createOrUpadte", this.fromExisting ? this.data["_id"] : "", {
        teacher: this.teacher,
        lesson: this.lesson,
        program: this.program,
        description: this.description,
      });
    },

    handleDelete() {
      this.$emit("delete", this.data["_id"]);
    },
  },
};
</script>

<style scoped lang="less">
@import url("../styles/form.less");
.form {
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

  .class-time-settings {
    display: flex;
    flex-direction: column;

    .day {
      display: flex;
      flex-direction: row-reverse;
      border-top: 1px solid #eee;
      align-items: center;

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
          direction: ltr;
          cursor: pointer;
          padding: 6px 12px;

          &.active {
            color: white;
            background-color: tomato;
          }
        }
      }
    }
  }

  @media screen and (max-width: @mobile-width) {
    .days {
      .day {
        width: 128px;
        .py(2px);
        font-size: 14px;
      }
    }

    .class-time-settings {
      .day {
        flex-direction: column;

        .name {
          text-align: center;
          .my(6px);
        }

        .times {
          justify-content: center;
        }
      }
    }
  }
}
</style>
