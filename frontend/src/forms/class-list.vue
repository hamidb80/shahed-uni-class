<template>
  <div class="form classes">
    <header>مدیریت کلاس ها</header>
    <div class="class-list">
      <div v-for="(cls, id) in classes" :key="id" class="class-item">
        <div class="class-action" @click="handleClick(id)">
          <configF class="icon" />
        </div>
        <div class="class-name">{{ cls.lesson }} | {{ cls.teacher }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import configF from "../icons/vue/config.vue";

export default {
  emits: ["redirect"],

  props: {
    classes: Object,
  },

  components: {
    configF,
  },

  methods: {
    handleClick(classId) {
      this.$emit("redirect", classId);
    },
  },
};
</script>

<style scoped lang="less">
@import url("../styles/form.less");

.class-list {
  .class-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:nth-child(even) {
      background: @almostWhite;
    }

    .class-name {
      .fa();
    }

    .class-action {
      .square(24px);
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 4px;
      border: 2px solid @almostBlack;
      cursor: pointer;
      transition: 0.3s;
      background-color: transparent;

      .icon {
        .square(20px);
        fill: @almostBlack;
      }

      &:hover {
        background-color: @almostBlack;
        .icon {
          fill: @almostWhite;
        }
      }
    }
  }
}
</style>
