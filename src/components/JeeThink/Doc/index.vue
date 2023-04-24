<template>
  <div>
    <svg-icon icon-class="question" @click="goto"/>
  </div>
</template>

<script>
export default {
  name: 'JeeThinkDoc',
  data() {
    return {
      url: 'https://item.taobao.com/item.htm?id=618814981963'
    }
  },
  methods: {
    goto() {
      window.open(this.url)
    }
  }
}
</script>