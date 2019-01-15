<template>
  <div class="tab">
    <cube-tab-bar
      :showSlider=true
      :useTransition=false
      v-model="selectedLabel"
      :data="tabs"
      ref="tabBar"
      class="border-bottom-1px"
    >
    </cube-tab-bar>
    <div class="slide-wrapper">
      <cube-slide
        :loop=false
        :auto-play=false
        :show-dots=false
        :initial-index="index"
        ref="slide"
        @change="onChange"
        @scroll="onScroll"
        :options="slideOptions"
      >
      <!-- initial-index 为初始索引值，通过 props 传递 initialIndex 可以定位到相关的 tabItem -->
      <!-- @change 当点击不同的 tab 时派发。参数：点中的tab的label/value值 -->
      <!-- @scroll 滚动中实时派发。参数 Object {x, y} -滚动位置的坐标值 -->
      <!-- :option better-scroll 配置项 -->
        <cube-slide-item v-for="(tab,index) in tabs" :key="index">
          <!-- 此处将 商品tabItem、评论tabItem、商家tabItem 通过props进行传递，可以试tab组件更加灵活 -->
          <!-- 商品tabItem、评论tabItem、商家tabItem，分别对应是三个组件 Goods、Ratings、Seller，可以通过动态组件进行渲染 -->
          <!-- tab.component 为对应的组件，tab.data 为对应组件的数据 -->
          <component ref="component" :is="tab.component" :data="tab.data"></component>
        </cube-slide-item>
      </cube-slide>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'tab',
    props: {
      tabs: {
        type: Array,
        default() {
          return []
        }
      },
      initialIndex: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        index: this.initialIndex, // 定位tabItem的index
        slideOptions: {
          listenScroll: true,
          probeType: 3, // 有时候我们需要知道滚动的位置,当 probeType 为 3 的时候，不仅在屏幕滑动的过程中，而且在 momentum 滚动动画运行过程中实时派发 scroll 事件
          directionLockThreshold: 0
          // 当我们需要锁定只滚动一个方向的时候，我们在初始滚动的时候根据横轴和纵轴滚动的绝对值做差，当差值大于 directionLockThreshold 的时候来决定滚动锁定的方向
          // tab下的页面即可横向又可纵向滚动，如果不设置 directionLockThreshold 可能会斜向滚动
        }
      }
    },
    computed: {
      selectedLabel: {
        get() {
          return this.tabs[this.index].label
        },
        set(newVal) {
          this.index = this.tabs.findIndex((value) => {
            return value.label === newVal
          })
        }
      }
    },
    methods: {
      onChange (current) {
        this.index = current
      },
      onScroll (pos) {
        // pos 为滚动位置的坐标值
        const tabBarWidth = this.$refs.tabBar.$el.clientWidth // 获取 cube-tab-bar 的宽度
        const slideWidth = this.$refs.slide.slide.scrollerWidth // 获取 cube-slide 的宽度
        const transform = -pos.x / slideWidth * tabBarWidth
        // pos.x为负值，所有 -pos.x 取正。除以 cube-slide 的宽度，得到一个比例值，乘以 cube-tab-bar 的宽度，则可得到 cube-tab-bar 下划线的滚动位置
        this.$refs.tabBar.setSliderTransform(transform)
        // setSliderTransform 改变 cube-tab-bar 组件的下划线的 transformX，如果传 Number，会转成像素，也可以传带有单位的 String
        // 注意：需要将 showSlider（是否开启下划线跟随效果） 属性设置为 true
        // cube-tab-bar 组件，默认开启 transition 过渡，此时设置下划线跟随 cube-slide 滚动而滚动，会与效果发生冲突，显得不自然。可以将 cube-tab-bar 组件效果 useTransition 设置为 false
      }
    }
  }
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .tab
    display: flex
    flex-direction: column
    height: 100%
    >>> .cube-tab
      padding: 10px 0
    .slide-wrapper
      flex: 1
      overflow: hidden
</style>
