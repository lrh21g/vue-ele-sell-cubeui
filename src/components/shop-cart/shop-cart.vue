<template>
  <div>
    <div class="shopcart">
      <div class="content" @click="toggleList">
        <div class="content-left">
          <div class="logo-wrapper">
            <div class="logo" :class="{'highlight':totalCount>0}">
              <i class="icon-shopping_cart" :class="{'highlight':totalCount>0}"></i>
            </div>
            <div class="num" v-show="totalCount>0">
              <bubble :num="totalCount"></bubble>
            </div>
          </div>
          <div class="price" :class="{'highlight':totalPrice>0}">￥{{totalPrice}}</div>
          <div class="desc">另需配送费￥{{deliveryPrice}}元</div>
        </div>
        <div class="content-right" @click="pay">
          <div class="pay" :class="payClass">
            {{payDesc}}
          </div>
        </div>
      </div>
      <!-- 小球容器，小球默认状态下爱隐藏 -->
      <div class="ball-container">
        <div v-for="(ball,index) in balls" :key="index">
          <transition
            @before-enter="beforeDrop"
            @enter="dropping"
            @after-enter="afterDrop">
            <div class="ball" v-show="ball.show">
              <div class="inner inner-hook"></div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Bubble from 'components/bubble/bubble'

  const BALL_LEN = 10 // 定义小球数量
  const innerClsHook = 'inner-hook'

  // 创建小球
  function createBalls() {
    let balls = []
    for (let i = 0; i < BALL_LEN; i++) {
      balls.push({ show: false })
    }
    return balls
  }

  export default {
    name: 'shop-cart',
    props: {
      selectFoods: {
        type: Array,
        default() {
          return []
        }
      }, // 已选择的商品
      deliveryPrice: {
        type: Number,
        default: 0
      }, // 配送费
      minPrice: {
        type: Number,
        default: 0
      }, // 最小起送费
      sticky: {
        type: Boolean,
        default: false
      },
      fold: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        balls: createBalls(),
        listFold: this.fold // 底部购物栏显示已购买列表显示标识
      }
    },
    created() {
      this.dropBalls = []
    },
    computed: {
      // 总共交易总额
      totalPrice() {
        let total = 0
        this.selectFoods.forEach((food) => {
          total += food.price * food.count
        })
        return total
      },
      // 购买总数量
      totalCount() {
        let count = 0
        this.selectFoods.forEach((food) => {
          count += food.count
        })
        return count
      },
      // 支付提示文字
      payDesc() {
        if (this.totalPrice === 0) {
          return `￥${this.minPrice}元起送`
        } else if (this.totalPrice < this.minPrice) {
          let diff = this.minPrice - this.totalPrice
          return `还差￥${diff}元起送`
        } else {
          return '去结算'
        }
      },
      // 支付样式
      payClass() {
        if (!this.totalCount || this.totalPrice < this.minPrice) {
          return 'not-enough'
        } else {
          return 'enough'
        }
      }
    },
    methods: {
      // 控制底部购物栏展示已购买列表的显示隐藏
      toggleList() {
        // 如果 底部购物栏展示已购买列表 已显示，再次点击则隐藏
        if (this.listFold) {
          if (!this.totalCount) {
            // 如果购买数量为 0，则 return，否则进行显示
            return
          }
          this.listFold = false
          this._showShopCartList()
          this._showShopCartSticky()
        } else {
          this.listFold = true
          this._hideShopCartList()
        }
      },
      pay(e) {
        if (this.totalPrice < this.minPrice) {
          return
        }
        this.$createDialog({
          title: '支付',
          content: `您需要支付${this.totalPrice}元`
        }).show()
        e.stopPropagation()
      },
      // 驱动小球动画。
      // 小球动画原理：
      // 1. 在底部购物栏购物logo 创建 10 小球，通过获取 cart-control 对应的增加商品数量按钮DOM，
      // 2. 从而通过 getBoundingClientRect 获取增加商品数量按钮DOM相对视口的位置，
      // 3. 然后控制小球从增加商品数量按钮DOM的位置移动到底部购物栏购物logo位置
      // 此事件由组件 goods组件，通过 $ref 获取本组件（shop-cart）ref，然后获取组件内 drop() 方法触发
      // 触发drop事件过程：
      // 1. 触发cart-control增加商品数量按钮DOM的add事件 向 goods组件 触发 $emit事件（onAdd）
      // 2. goods组件 通过 $ref 获取 shop-cart组件 ref（shopCart），获取shop-cart组件的 drop() 方法触发
      drop(el) {
        // el 为 cart-control 中增加商品数量按钮DOM
        for (let i = 0; i < this.balls.length; i++) {
          const ball = this.balls[i]
          if (!ball.show) {
            ball.show = true
            ball.el = el
            this.dropBalls.push(ball)
            // 将获取到的小球，放入存放下落的小球数组中。
            // this.dropBalls 在生命周期 created 中创建
            return
          }
        }
      },
      beforeDrop(el) {
        const ball = this.dropBalls[this.dropBalls.length - 1] // 获取存放落入小球的数组的最后一个，最后一个是最新的一个
        const rect = ball.el.getBoundingClientRect() // 获取 cart-control 对应的增加商品数量按钮DOM的位置信息
        // getBoundingClientRect()方法返回元素的大小及其相对于视口的位置
        const x = rect.left - 32 // rect.left - 32 为底部购物栏 购物logo 中心位置，rect.left为DOM距离视口左边边框框的位置
        const y = -(window.innerHeight - rect.top - 22)
        // rect.top 为DOM距离视口顶部边框框的位置
        // y 需要取负值的原因是，底部购物栏 购物logo 相对于小球DOM ，处于小球的下方，y应该为负值
        el.style.display = '' // 小球默认隐藏，此处将小球进行显示
        el.style.transform = el.style.webkitTransform = `translate3d(0,${y}px,0)`
        // transform 属性向元素应用 2D 或 3D 转换。该属性允许我们对元素进行旋转、缩放、移动或倾斜
        // webkitTransform 为为了进行兼容
        const inner = el.getElementsByClassName(innerClsHook)[0]
        inner.style.transform = inner.style.webkitTransform = `translate3d(${x}px,0,0)`
      },
      dropping(el, done) {
        this._reflow = document.body.offsetHeight
        el.style.transform = el.style.webkitTransform = `translate3d(0,0,0)`
        const inner = el.getElementsByClassName(innerClsHook)[0]
        inner.style.transform = inner.style.webkitTransform = `translate3d(0,0,0)`
        el.addEventListener('transitionend', done) // 监听 transitionend 事件，表示该动画已经结束，之后触发 afterDrop 方法
      },
      afterDrop(el) {
        const ball = this.dropBalls.shift()
        if (ball) {
          ball.show = false
          el.style.display = 'none'
        }
      },
      _showShopCartList() {
        this.shopCartListComp = this.shopCartListComp || this.$createShopCartList({
          $props: {
            selectFoods: 'selectFoods'
          },
          $events: {
            leave: () => {
              this._hideShopCartSticky()
            },
            hide: () => {
              // shop-cart-list组件的hide事件
              // 避免点击蒙层关闭 底部购物栏显示已购买列表 未将 listFold 标识置换为 true
              // 当再次点击 底部购物栏 的时候，需要点击两次才能显示 已购买列表
              this.listFold = true
            },
            add: (el) => {
              this.shopCartStickyComp.drop(el)
              // 此时 shop-cart-sticky组件被创建挂载到外部，
              // 所以需要通过 shop-cart-sticky组件，才能触发 shop-cart组件中 drop方法 驱动小球动画
              // 在shop-cart-sticky组件中，定义drop方法，方法中通过 $ref 获取 shop-cart组件 的ref，从而触发 shop-cart组件中 drop方法
            }
          }
        })
        this.shopCartListComp.show()
      },
      _showShopCartSticky() {
        // shop-cart-sticky 为 shop-cart 的副本，主要用解决 shop-cart-list 遮住 底部购物栏（shop-cart组件） 的问题
        // >>> 问题：shop-cart-list组件 挂载在外部，而 底部购物栏 在 goods组件 内部。从而会遮住 底部购物栏（shop-cart组件）
        // >>> 解决办法：将 shop-cart 的副本 shop-cart-sticky 通过 createAPI 挂载到外部即可
        // >>>          shop-cart-sticky 其与 shop-cart组件的数据需要相同，所以此处通过 $props 进行相关数据的传递
        // 注意：shop-cart-sticky 组件中，直接引入 shop-cart 组件完成复制的。
        // >>> 问题：当 shop-cart 通过 toggleList() 方法展示 shop-cart-list组件 的时候，同时将 shop-cart-sticky组件 挂载到了外部
        // >>>      当再次点击 toggleList() 方法，对 shop-cart-list组件 进行隐藏的时候：
        // >>>      > 对于 shop-cart 而言，是存在 是【存在】通过 createAPI 将 shop-cart-list组件 挂载到外部的
        // >>>      > 对于 shop-cart-sticky 而言，是【不存在】通过 createAPI 将 shop-cart-list组件 挂载到外部的
        // >>> 解决办法: 当对 shop-cart-list组件 进行隐藏的时候,会触发 _hideShopCartList() 方法进行隐藏时,需要判断是否来自 shop-cart-sticky
        // >>>          通过 createAPI 将 shop-cart-sticky组件 挂载到外部的时候,通过 $props 将传递 this.shopCartListComp（即，通过 createAPI 挂载到外部的shop-cart-list）
        // >>>          在 _hideShopCartList()方法 中,通过 判断 sticky 是否来自 shop-cart-sticky组件 进行判断（在 shop-cart-sticky 传递sticky时，可将其始终设置为true）：
        // >>>          > 如果是（true），则 通过 this.$parent（即：shop-cart-sticky组件），
        // >>>            调用通过 createAPI $props 传递的 list（即：this.shopCartListComp） 的 hide() 方法，对 shop-cart-list 进行隐藏
        // >>>          > 如果不是（false），则直接调用 this.shopCartListComp 的 hide() 方法
        // >>> 问题：shop-cart-sticky 挂载在外部，则一直会存在，当从商品tabItem切换到其他tabItem的时候，还是会存在
        // >>> 解决办法：当 shop-cart-lsit 隐藏动画结束之后，调用 _hideShopCartSticky() 方法对 shop-cart-sticky组件 进行隐藏
        // >>>          在 shop-cart-lsit组件，动画结束钩子定义的函数 afterLeave() 方法中，使用 $emit 触发 leave 事件
        // >>>          shop-cart-lsit组件 在 shop-cart组件中，通过 createAPI 组件进行创建和挂载，所以在创建和挂载的地方，使用 $events 绑定 leave 事件
        // >>> 问题：当使用 props 传入 fold 为 false 的时候，会执行 this.listFold = true，对于 shop-cart-sticky，则 listFold 一值为 true。
        //           尽管使用 listFold 修改 fold 的 true 和 false，但是在 toggleList()方法 中，判断的是 this.listFold
        //           会导致一直创建 shop-cart-sticky组件，并挂载到外部。
        // >>> 解决办法：使用 watch 监听  fold ,将最新的值，赋值给 this.listFold
        this.shopCartStickyComp = this.shopCartStickyComp || this.$createShopCartSticky({
          $props: {
            selectFoods: 'selectFoods', // 已选择的商品
            deliveryPrice: 'deliveryPrice', // 配送费
            minPrice: 'minPrice', // 最小起送费
            fold: 'listFold', // 底部购物栏显示已购买列表显示标识
            list: this.shopCartListComp
          }
        })
        this.shopCartStickyComp.show()
      },
      _hideShopCartList() {
        const list = this.sticky ? this.$parent.list : this.shopCartListComp
        list.hide && list.hide()
      },
      _hideShopCartSticky() {
        this.shopCartStickyComp.hide()
      }
    },
    watch: {
      fold(newVal) {
        this.listFold = newVal
      },
      totalCount(count) {
        if (!this.fold && count === 0) {
          this._hideShopCartList()
        }
      }
    },
    components: {
      Bubble
    }
  }
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/mixin"
  @import "~common/stylus/variable"

  .shopcart
    height: 100%
    .content
      display: flex
      background: $color-background
      font-size: 0
      color: $color-light-grey
      .content-left
        flex: 1
        .logo-wrapper
          display: inline-block
          vertical-align: top
          position: relative
          top: -10px
          margin: 0 12px
          padding: 6px
          width: 56px
          height: 56px
          box-sizing: border-box
          border-radius: 50%
          background: $color-background
          .logo
            width: 100%
            height: 100%
            border-radius: 50%
            text-align: center
            background: $color-dark-grey
            &.highlight
              background: $color-blue
            .icon-shopping_cart
              line-height: 44px
              font-size: $fontsize-large-xxx
              color: $color-light-grey
              &.highlight
                color: $color-white
          .num
            position: absolute
            top: 0
            right: 0
        .price
          display: inline-block
          vertical-align: top
          margin-top: 12px
          line-height: 24px
          padding-right: 12px
          box-sizing: border-box
          border-right: 1px solid rgba(255, 255, 255, 0.1)
          font-weight: 700
          font-size: $fontsize-large
          &.highlight
            color: $color-white
        .desc
          display: inline-block
          vertical-align: top
          margin: 12px 0 0 12px
          line-height: 24px
          font-size: $fontsize-small-s
      .content-right
        flex: 0 0 105px
        width: 105px
        .pay
          height: 48px
          line-height: 48px
          text-align: center
          font-weight: 700
          font-size: $fontsize-small
          &.not-enough
            background: $color-dark-grey
          &.enough
            background: $color-green
            color: $color-white
    .ball-container
      .ball
        position: fixed
        left: 32px
        bottom: 22px
        z-index: 200
        transition: all 0.4s cubic-bezier(0.49, -0.29, 0.75, 0.41)
        .inner
          width: 16px
          height: 16px
          border-radius: 50%
          background: $color-blue
          transition: all 0.4s linear
</style>
