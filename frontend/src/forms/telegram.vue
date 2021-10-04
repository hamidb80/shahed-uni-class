<template>
  <div class="form login">
    <header> ارسال پیام در گروه تلگرام</header>
    <input type="text" class="input" v-model="secretKey" placeholder="متن پيام را وارد كنيد" />
    <button class="btn" @click="handleClick">ارسال</button>
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
@import url('../styles/form.less');

</style>
