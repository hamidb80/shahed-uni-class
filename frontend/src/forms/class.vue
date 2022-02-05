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

    <textarea
      v-if="isAdmin"
      type="text"
      class="input"
      v-model="notes"
      placeholder="یادداشت ها"
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

    <div class="class-times">
      <div
        v-for="di in selectedDays"
        :key="di"
        class="day"
        v-show="program[di] !== null"
      >
        <div class="name">
          {{ weekDays[di] }}
        </div>
        <div class="times-editor" v-if="isAdmin">
          <div
            class="time-range-editor-wrapper"
            v-for="(tr, ti) in program[di]"
            :key="`${tr[0]}-${tr[1]}`"
          >
            <div class="time-range-editor">
              <time-picker v-model="program[di][ti][0]" />
              <span> - </span>
              <time-picker v-model="program[di][ti][1]" />
            </div>
            <div class="icon-wrapper remove-icon" @click="removeTime(di, ti)">
              <remove-icon class="icon"></remove-icon>
            </div>
          </div>
          <div>
            <div class="icon-wrapper add-icon" @click="addTime(di)">
              <add-icon class="icon"></add-icon>
            </div>
          </div>
        </div>
        <div class="times" v-else>
          <div class="time-range" v-for="(tr, ti) in program[di]" :key="ti">
            {{ toPersianTime(tr[0]) }} - {{ toPersianTime(tr[1]) }}
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
import { weekDays, toPersianTime } from "../utils/helper.js";
import TimePicker from "../components/time-picker.vue";
import addI from "../icons/vue/add.vue";
import removeI from "../icons/vue/remove.vue";

export default {
  props: {
    data: Object,
    isAdmin: Boolean,
  },

  emits: ["delete", "createOrUpadte"],

  components: {
    "time-picker": TimePicker,
    "add-icon": addI,
    "remove-icon": removeI,
  },

  data: () => ({
    cid: null,

    teacher: "",
    lesson: "",
    description: "",
    notes: "",

    program: [[], [], [], [], [], [], []],

    // ----------------
    fromExisting: false,
    selectedDays: [],

    weekDays,
  }),

  methods: {
    toPersianTime,

    syncInput(inputData) {
      if (Object.keys(inputData).length !== 0) {
        this.cid = inputData["_id"];
        this.teacher = inputData["teacher"];
        this.lesson = inputData["lesson"];
        this.program = inputData["program"];
        this.notes = inputData["notes"];
        this.description = inputData["description"];
        this.selectedDays = inputData["program"]
          .map((day, i) => (day.length !== 0 ? i : -1))
          .filter((n) => n !== -1);

        this.fromExisting = true;
      } else {
        this.cid = null;
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

    correctProgramErrors() {
      for (let day of this.program) {
        for (const timeRange of day) {
          timeRange[1] = Math.max(timeRange[0] + 10, timeRange[1]);
        }
      }
    },

    handleSubmit() {
      this.correctProgramErrors();
      this.$emit("createOrUpadte", this.fromExisting ? this.cid : "", {
        teacher: this.teacher,
        lesson: this.lesson,
        program: this.program,
        description: this.description,
        notes: this.notes,
      });
    },

    handleDelete() {
      this.$emit("delete", this.cid);
    },

    addTime(dayIndex) {
      this.program[dayIndex].push([0, 0]);
    },
    removeTime(dayIndex, timeIndex) {
      this.program[dayIndex].splice(timeIndex, 1);
    },
  },

  watch: {
    data(newD) {
      this.syncInput(newD);
    },
  },

  mounted() {
    this.syncInput(this.data);
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
        background-color: @c1;
      }
    }
  }

  .class-times {
    display: flex;
    flex-direction: column;

    .day {
      display: flex;
      flex-direction: row-reverse;
      border-top: 1px solid #eee;
      align-items: center;
      justify-content: space-between;

      .name {
        .fa();
        width: 160px;
        text-align: right;
      }

      .times {
        flex-grow: 1;
        flex-wrap: wrap;
        display: flex;
        flex-direction: row;

        .time-range {
          .fa();
          .mx(6px);
          .my(4px);
          border-radius: 4px;
          background-color: #eee;
          color: #212121;
          direction: ltr;
          padding: 6px 12px;
        }
      }

      .times-editor {
        display: flex;
        flex-direction: column;

        .time-range-editor-wrapper {
          display: flex;
          align-items: center;
          margin-top: 6px;

          .time-range-editor {
            margin-right: 16px;
          }
        }

        .icon-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          margin-top: 2px;
          border-radius: 2px;
          .square(20px);
          border: 2px solid @c3;

          .icon {
            fill: white;
          }

          &.add-icon {
            background-color: @c3;
            .my(8px);
          }

          &.remove-icon {
            background-color: @c3;
          }

          &:hover {
            background-color: white;

            .icon {
              fill: @c3;
            }
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

    .class-times {
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
