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

    <div class="btn" v-if="isAdmin" @click="handleSubmit">ثبت کلاس</div>
    <div class="btn" v-if="isAdmin && fromExisting" @click="handleDelete">حذف کلاس</div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { classTimes, weekDays } from "../utils/meta";

@Options({
  props: {
    data: Object,
    isAdmin: Boolean,
  },

  emits: ["delete", "createOrUpadte"],

  data: () => ({
    teacher: "",
    lesson: "",

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
    checkInput(inputData: any) {
      if (Object.keys(inputData).length !== 0) {
        this.teacher = inputData["teacher"];
        this.lesson = inputData["lesson"];
        this.program = inputData["program"];
        this.selectedDays = inputData["program"]
          .map((day: number[], i: number) => (day.length !== 0 ? i : -1))
          .filter((n: number) => n !== -1);

        this.fromExisting = true;
      } else {
        this.fromExisting = false;
      }
    },

    toggleDay(di: number) {
      if (!this.isAdmin) return;

      let i = this.selectedDays.findIndex((d: number) => d === di);

      if (i === -1) this.selectedDays.push(di);
      else this.selectedDays.splice(i, 1);
    },
    toggleTime(di: number, ti: number) {
      if (!this.isAdmin) return;

      let i = this.program[di].findIndex((v: number) => v === ti);

      if (i === -1) this.program[di].push(ti);
      else this.program[di].splice(i, 1);
    },

    handleSubmit() {
      this.$emit("createOrUpadte", this.fromExisting ? this.data["_id"] : "", {
        teacher: this.teacher,
        lesson: this.lesson,
        program: this.program,
      });
    },

    handleDelete(){
      this.$emit("delete", this.data["_id"])
    }
  },
})
export default class HelloWorld extends Vue {
  msg!: string;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
</style>
