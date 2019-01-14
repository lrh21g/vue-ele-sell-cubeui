<template>
  <div id="app">
    <v-header :seller="seller"></v-header>
    <!-- <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import VHeader from 'components/v-header/v-header'
import { getSeller } from 'api'

export default {
  name: 'app',
  data () {
    return {
      seller: {}
    }
  },
  created () {
    this._getSeller()
  },
  methods: {
    _getSeller () {
      getSeller().then((seller) => {
        this.seller = seller
      })
    }
  },
  components: {
    // HelloWorld
    VHeader
  }
}
</script>
<style lang="stylus">
  // #app
  //   font-family 'Avenir', Helvetica, Arial, sans-serif
  //   -webkit-font-smoothing antialiased
  //   -moz-osx-font-smoothing grayscale
  //   text-align center
  //   color #2c3e50
  //   margin-top 60px
</style>
