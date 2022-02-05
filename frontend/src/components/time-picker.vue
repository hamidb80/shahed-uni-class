<template>
  <div class="time-picker-wrapper">
    <input
      v-model="hours"
      @blur="handleUpdate"
      type="number"
      min="0"
      max="23"
      step="1"
    />
    <span>:</span>
    <input
      v-model="minutes"
      @blur="handleUpdate"
      type="number"
      min="0"
      max="59"
      step="1"
    />
  </div>
</template>

<script>
import { minutes2TimeArray } from "../utils/helper.js";

export default {
  emits: ["update:modelValue"],

  props: {
    modelValue: Number,
  },

  data: () => ({
    hours: 0,
    minutes: 0,
  }),

  methods: {
    update(newTime) {
      let t = minutes2TimeArray(newTime);
      this.hours = t[0];
      this.minutes = t[1];
    },

    handleUpdate() {
      this.$emit(
        "update:modelValue",
        parseInt(this.hours) * 60 + parseInt(this.minutes)
      );
    },
  },

  // watch: {
  //   modelValue: update,
  // },

  mounted() {
    this.update(this.modelValue);
  },
};
</script>

<style scoped lang="less">
@import url("../styles/form.less");

.time-picker-wrapper {
  display: inline-block;

  input {
    .px(2px);
    .py(0);
    text-align: center;
    max-width: 48px;
    border: none;
    border-radius: 0;
    border-bottom: 1.6px solid @almostBlack;

    &:focus, &:hover {
      border-color: @c3;
    }
  }
}
</style>
