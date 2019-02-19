<template>
  <transition name="fade">
    <cube-popup
      :mask-closable=true
      v-show="visible"
      @mask-click="maskClick"
      position="bottom"
      type="shop-cart-list"
      :z-index=90
    >
      <transition
        name="move"
        @after-leave="afterLeave"
      >
        <div v-show="visible">
          <div class="list-header">
            <h1 class="title">购物车</h1>
            <span class="empty" @click="empty">清空</span>
          </div>
          <cube-scroll class="list-content" ref="listContent">
            <ul>
              <li
                class="food"
                v-for="(food,index) in selectFoods"
                :key="index"
              >
                <span class="name">{{food.name}}</span>
                <div class="price">
                  <span>￥{{food.price*food.count}}</span>
                </div>
                <div class="cart-control-wrapper">
                  <cart-control @add="onAdd" :food="food"></cart-control>
                </div>
              </li>
            </ul>
          </cube-scroll>
        </div>
      </transition>
    </cube-popup>
  </transition>
</template>

<script>
  import CartControl from 'components/cart-control/cart-control'
  import popupMixin from 'common/mixins/popup'

  const EVENT_SHOW = 'show'
  const EVENT_ADD = 'add'
  const EVENT_LEAVE = 'leave'

  export default {
    name: 'shop-cart-list',
    mixins: [popupMixin],
    props: {
      selectFoods: {
        type: Array,
        default() {
          return []
        }
      }
    },
    created() {
      // $on 监听当前实例上的自定义事件。事件可以由vm.$emit触发。回调函数会接收所有传入事件触发函数的额外参数。
      // 监听 EVENT_SHOW(即：show)事件，当触发 show事件 的时候，refresh 列表
      // 即：每一次显示购物栏列表的时候，重新计算 better-scroll，当 DOM 结构发生变化的时候务必要调用确保滚动的效果正常。
      this.$on(EVENT_SHOW, () => {
        console.log('$on EVENT_SHOW')
        this.$nextTick(() => {
          this.$refs.listContent.refresh()
        })
      })
    },
    methods: {
      onAdd(target) {
        this.$emit(EVENT_ADD, target)
        // 触发 shop-cart组件中 通过 createAPI 创建并挂载 shop-cart-list组件 中的 $events 的 add 事件
        // 从而触发 shop-cat组件中 drop方法 驱动小球动画
      },
      afterLeave() {
        this.$emit(EVENT_LEAVE)
        // 触发 shop-cart组件中 通过 createAPI 创建并挂载 shop-cart-list组件 中的 $events 的 leave 事件
        // 从而进行隐藏 shop-cart-sticky 组件
        // 当用户进行 tab(商品|评论|商家) 切换的时候，因为 shop-cart-sticky 使用 createAPI 挂载到了全局下。所以切换的时候 shop-cart-sticky 并不会消失
        // 为了解决这个问题，可以在 shop-cart-list 隐藏动画结束的时候，将 shop-cart-sticky 进行隐藏
      },
      maskClick() {
        this.hide() // 触发hide事件（hide方法 存在于 mixins/popup.js 中），用于隐藏购物栏商品列表
      },
      empty() {
        this.dialogComp = this.$createDialog({
          type: 'confirm',
          content: '清空购物车？',
          $events: {
            confirm: () => {
              this.selectFoods.forEach((food) => {
                food.count = 0
              })
              this.hide()
            }
          }
        })
        this.dialogComp.show()
      }
    },
    components: {
      CartControl
    }
  }
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  .cube-shop-cart-list
    bottom: 48px
    &.fade-enter, &.fade-leave-active
      opacity: 0
    &.fade-enter-active, &.fade-leave-active
      transition: all .3s ease-in-out
    .move-enter, .move-leave-active
      transform: translate3d(0, 100%, 0)
    .move-enter-active, .move-leave-active
      transition: all .3s ease-in-out
    .list-header
      height: 40px
      line-height: 40px
      padding: 0 18px
      background: $color-background-ssss
      .title
        float: left
        font-size: $fontsize-medium
        color: $color-dark-grey
      .empty
        float: right
        font-size: $fontsize-small
        color: $color-blue

    .list-content
      padding: 0 18px
      max-height: 217px
      overflow: hidden
      background: $color-white
      .food
        position: relative
        padding: 12px 0
        box-sizing: border-box
        .name
          line-height: 24px
          font-size: $fontsize-medium
          color: $color-dark-grey
        .price
          position: absolute
          right: 90px
          bottom: 12px
          line-height: 24px
          font-weight: 700
          font-size: $fontsize-medium
          color: $color-red
        .cart-control-wrapper
          position: absolute
          right: 0
          bottom: 6px

</style>
