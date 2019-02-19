# create-api 模块的应用

## 1. 简介（详情参考官网）

该模块默认暴露出一个 createAPI 函数，可以实现以 API 的形式调用自定义组件。并且既可以在 Vue 实例上下文中调用，也可以在普通 js 文件中调用。

注： 所有通过 createAPI 实现的通过 API 的形式调用的自定义组件（cube-ui 内置的组件）都需要通过 Vue.use 注册才可以。

`createAPI(Vue, Component, [events, single])`

+ 参数
  + {Function} Vue Vue 函数
  + {Function | Object} Component Vue 组件，组件内必须有 name
  + {Array} [events] 组件实例 emit 的事件名集合
  + {Boolean} [single] 是否为单例
+ 用法
  + 该方法在 Vue 的 prototype 上增加一个名为 `$create{camelize(Component.name)}` 的方法，这样就可以在其他组件中直接通过 `const instance = this.$createAaBb(config, [renderFn, single])` 这样来实例化组件了，而且这个实例化组件的元素是被附加到 body 元素下的。
  + `const instance = this.$createAaBb(config, renderFn, single)`
    + config: 配置参数，经处理后传给组件
      + $props - 传递给组件的 Props
      + $events - 组件的 Events 事件回调
    + renderFn: 可选参数，用于生成子 VNode 节点，一般场景是处理 slot
    + single: 可选参数，创建的时候决定是否是单例的，优先级更高，如果没有传入 renderFn 的话，single 的值就是第二个参数的值

## 2. 使用

项目中使用 create-api，主要用于将自定义组件附加到 body 元素下，全屏显示。使用 create-api模块 的有：

+ HeaderDetail: 商家公告信息模块
+ ShopCartList: 购物车列表模块
+ ShopCartStikcy: 购物车栏 shop-cart组件 的 副本组件
+ Food: 商品详情模块

### 2.1 注册

``` javascript
  import { createAPI } from 'cube-ui'
  import Vue from 'vue'
  import HeaderDetail from 'components/header-detail/header-detail'
  import ShopCartList from 'components/shop-cart-list/shop-cart-list'
  import ShopCartStikcy from 'components/shop-cart-sticky/shop-cart-sticky'
  import Food from 'components/food/food'

  // 使用 createAPI 模块，该模块默认暴露出一个 createAPI 函数，可以实现以 API 的形式调用自定义组件。
  // 注：所有通过 createAPI 实现的通过 API 的形式调用的自定义组件（cube-ui 内置的组件）都需要通过 Vue.use 注册才可以
  // 需要在 main.js 中引入，对自定义组件进行注册
  createAPI(Vue, HeaderDetail) // 组件内必须有 name，此处转换为驼峰写法
  createAPI(Vue, ShopCartList)
  createAPI(Vue, ShopCartStikcy)
  createAPI(Vue, Food)
```

### 2.2 使用

#### 2.2.1 HeaderDetail使用

在 v-headr 组件中进行实例化，主要用于显示商家公告信息。通过 showDetail方法 进行触发。传递 seller 参数，用于 header-detail组件 中信息的渲染。

``` javascript
  showDetail () {
    this.headerDetailComp = this.headerDetailComp || this.$createHeaderDetail({
      // 通过 this.$createHeaderDetail 实例化 HeaderDetail 组件
      $props: {
        seller: 'seller' // 传递参数 seller 给 header-detail组件，seller 中包含商品公告信息
      }
    })
    this.headerDetailComp.show() // 调用 header-detail组件 内地 show 方法，显示 header-detail
  }
```

### 2.2.2 Food使用

在 goods组件 中进行实例化，主要用于显示商品详情信息。通过 selectFood方法 进行触发。传递 food 参数，用于 food组件 中信息的渲染。

``` javascript
  _showFood() {
    // 通过 createAPI 将 food组件 创建并挂载到外部
    this.foodComp = this.foodComp || this.$createFood({
      $props: {
        food: 'selectedFood'
      },
      $events: {
        add: (target) => {
          this.shopCartStickyComp.drop(target) // 驱动小球动画，可参考 shop-cart 组件内容
        },
        leave: () => {
          this._hideShopCartSticky()
        }
      }
    })
    this.foodComp.show()
  }
```

### 2.2.3 ShopCartList、ShopCartStikcy使用

具体逻辑参考 [shop-cart组件的实现](../src/components/shop-cart/shop-cart.vue)