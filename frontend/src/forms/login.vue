<template>
  <div class="form login">
    <header>ورود ادمین</header>
    <input type="text" class="input" v-model="secretKey" placeholder="رمز" />
    <button class="btn" @click="handleClick">ورود</button>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  emits: ["submit"],

  data: () => ({
    secretKey: "",
  }),

  methods: {
    handleClick() {
      this.$emit("submit", this.secretKey);
    },
  },
})
export default class HelloWorld extends Vue {}
</script>

<style scoped lang="less">
</style>
