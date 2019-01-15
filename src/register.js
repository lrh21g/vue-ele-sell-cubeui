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
