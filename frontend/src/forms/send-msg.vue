<template>
  <div class="form login">
    <header>ارسال پیام در گروه</header>
    <textarea
      type="text"
      class="input"
      v-model="msg"
      placeholder="متن پیام"
    />
    <button class="btn" @click="handleSend">ارسال</button>
  </div>
</template>

<script>

export default {
  emits: ["send"],

  data: () => ({
    msg: ""
  }),

  methods: {
    handleSend() {
      this.$emit("send", this.msg);
    },
  },
}
</script>

<style scoped lang="less">
@import url('../styles/form.less');
</style>
