<template>
  <div class="cartcontrol">
    <transition name="move">
      <div class="cart-decrease" v-show="food.count>0" @click.stop="decrease">
        <span class="inner icon-remove_circle_outline"></span>
      </div>
    </transition>
    <div class="cart-count" v-show="food.count>0">{{food.count}}</div>
    <div class="cart-add icon-add_circle" @click.stop="add"></div>
  </div>
</template>

<script>
  const EVENT_ADD = 'add'

  export default {
    name: 'cart-control',
    props: {
      food: {
        type: Object
      } // 传入 food ，每个 cart-control 对应 food 进行操作，对相关商品的数量进行加减
    },
    methods: {
      add(event) {
        if (!this.food.count) {
          // count 不是 food 的原有属性，是添加的
          // 注意：Vue 不能检测到对象属性的添加或删除，需要使用 $set API 设置
          this.$set(this.food, 'count', 1)
        } else {
          this.food.count++
        }
        this.$emit(EVENT_ADD, event.target) // 当商品进行新增的时候，触发 EVENT_ADD 事件，传递参数为增加按钮的DOM
      },
      decrease() {
        if (this.food.count) {
          this.food.count--
        }
      }
    }
  }
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .cartcontrol
    display: flex
    align-items: center
    .cart-decrease
      display: inline-block
      padding: 6px
      opacity: 1
      .inner
        display: inline-block
        line-height: 24px
        font-size: $fontsize-large-xxx
        color: $color-blue
        transition: all 0.4s linear
        transform: rotate(0)
      &.move-enter-active, &.move-leave-active
        transition: all 0.4s linear
      &.move-enter, &.move-leave-active
        opacity: 0
        transform: translate3d(24px, 0, 0)
        .inner
          transform: rotate(180deg)
    .cart-count
      width: 12px
      line-height: 24px
      text-align: center
      font-size: $fontsize-small-s
      color: $color-grey
    .cart-add
      display: inline-block
      padding: 6px
      line-height: 24px
      font-size: $fontsize-large-xxx
      color: $color-blue
</style>
