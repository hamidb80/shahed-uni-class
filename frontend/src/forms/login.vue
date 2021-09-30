<template>
  <div class="form login">
    <header>ورود ادمین</header>
    <input type="text" class="input" v-model="secretKey" placeholder="رمز" />
    <button class="btn" @click="handleClick">ورود</button>
  </div>
</template>

<script>

export default {
  emits: ["submit"],

  data: () => ({
    secretKey: "",
  }),

  methods: {
    handleClick() {
      this.$emit("submit", this.secretKey);
    },
  },
}
</script>

<style scoped lang="less">
</style>
