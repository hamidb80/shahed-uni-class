<template>
  <div class="form training">
    <input
      type="text"
      class="input"
      v-model="name"
      placeholder="عنوان"
      :disabled="!isAdmin"
    />

    <input
      type="text"
      class="input"
      @update:modelValue="findMatches"
      v-model="NameOrTeacher"
      @click="inputClick"
      placeholder="کلاس"
      :disabled="!isAdmin"
    />

    <div class="suggestion-wrapper" v-if="classId === ''">
      <div
        class="suggestion"
        v-for="cls in matchedClasses"
        :key="cls['_id']"
        @click="selectClass(cls['_id'])"
      >
        <span class="lesson">
          {{ cls["lesson"] }}
        </span>
        |
        <span class="teacher">
          {{ cls["teacher"] }}
        </span>
      </div>
    </div>

    <textarea
      type="text"
      class="input"
      v-model="description"
      placeholder="توضیحات"
      :disabled="!isAdmin"
    />

    <div class="multi-input">
      <input
        :disabled="!isAdmin"
        v-model="date.year"
        type="number"
        min="1400"
        max="1401"
        step="1"
      />
      <input
        :disabled="!isAdmin"
        v-model="date.month"
        type="number"
        min="1"
        max="12"
        step="1"
      />
      <input
        :disabled="!isAdmin"
        v-model="date.day"
        type="number"
        min="1"
        max="31"
        step="1"
      />
    </div>

    <div class="multi-input">
      <input
        :disabled="!isAdmin"
        v-model="time.hour"
        type="number"
        min="0"
        max="23"
        step="1"
      />
      <input
        :disabled="!isAdmin"
        v-model="time.minute"
        type="number"
        min="0"
        max="59"
        step="1"
      />
    </div>

    <button
      :disabled="!classId"
      class="btn"
      v-if="isAdmin"
      @click="handleSubmit"
    >
      ثبت
    </button>
    <button
      :disabled="!classId"
      class="btn"
      v-if="isAdmin && fromExisting"
      @click="handleDelete"
    >
      حذف
    </button>
  </div>
</template>

<script>
import Jalaali from "jalaali-js";
import { extractObjectKeysAs, extractKeys } from "../utils/object.js";

function serilizeClass(cls) {
  return `${cls["lesson"]} | ${cls["teacher"]}`;
}

export default {
  props: {
    type: String, // training or ...

    data: Object,
    classes: Object,

    isAdmin: Boolean,
  },

  components: {},

  emits: ["delete", "createOrUpadte"],

  data: () => ({
    description: "",
    name: "",
    date: {
      year: 1400,
      month: 1,
      day: 1,
    },

    time: {
      hour: 0,
      minute: 0,
    },

    // ----------------
    matchedClasses: [],
    NameOrTeacher: "",
    classId: "",

    fromExisting: false,
    showDateSelector: true,
    cachedClassesList: [],
  }),

  watch: {
    data(newD) {
      this.syncInput(newD);
    },

    date() {
      if (Object.keys(this.date).length) {
        this.showDateSelector = false;
      }
    },
  },

  methods: {
    findMatches(t) {
      if (t.length)
        this.matchedClasses = this.cachedClassesList.filter((cls) =>
          cls["lesson"].includes(t)
        );
      else this.matchedClasses = [];
    },

    inputClick() {
      this.classId = "";
      this.NameOrTeacher = "";
      this.matchedClasses = [];
    },

    selectClass(clsId) {
      this.classId = clsId;
      this.NameOrTeacher = serilizeClass(this.classes[clsId]);
    },

    syncInput(inputData) {
      if (inputData && Object.keys(inputData).length !== 0) {
        this.description = inputData["description"];
        this.fromExisting = true;

        let dateObject = new Date(inputData["datetime"]);
        this.classId = inputData["classId"];
        this.NameOrTeacher = serilizeClass(this.classes[this.classId]);
        this.name = inputData["name"];

        this.date = extractObjectKeysAs(Jalaali.toJalaali(dateObject), [
          ["jy", "year"],
          ["jm", "month"],
          ["jd", "day"],
        ]);
        this.time = {
          hour: dateObject.getHours(),
          minute: dateObject.getMinutes(),
        };
      } else {
        this.fromExisting = false;
        this.date = extractObjectKeysAs(Jalaali.toJalaali(new Date()), [
          ["jy", "year"],
          ["jm", "month"],
          ["jd", "day"],
        ]);
      }
    },

    handleSubmit() {
      let dateObject = Jalaali.jalaaliToDateObject(
        ...extractKeys(this.date, ["year", "month", "day"])
      );
      dateObject.setHours(this.time.hour, this.time.minute);

      this.$emit("createOrUpadte", this.fromExisting ? this.data["_id"] : "", {
        name: this.name,
        type: this.type,
        classId: this.classId,
        description: this.description,
        datetime: dateObject.toISOString(),
      });
    },

    handleDelete() {
      this.$emit("delete", this.data["_id"]);
    },
  },

  mounted() {
    this.syncInput(this.data);

    for (const clsId in this.classes)
      this.cachedClassesList.push(this.classes[clsId]);
  },
};
</script>

<style scoped lang="less">
@import url("../styles/form.less");
.form {
  .suggestion-wrapper {
    .suggestion {
      direction: rtl;
      .py(2px);
      .px(6px);

      span {
        .fa();
      }

      &:hover {
        background-color: @c1;
        color: white;
        cursor: pointer;
      }
    }
  }
}
</style>
