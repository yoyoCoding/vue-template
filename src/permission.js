import router from './router';
import store from './store';
import NProgress from 'nprogress';
import { MessageBox } from 'element-ui';

import localRoute from '@/config/localRoute';
import { logout } from '@/utils/logout.js';

NProgress.configure({
  showSpinner: true
});

const whiteList = ['/login']; // 免登录白名单

router.beforeEach(async (to, from, next) => {
  NProgress.start();
  await store.dispatch('SetConfigApi'); // 获取配置  
  await store.dispatch('SetApi'); // 设置基本配置
  // const nodeId = await store.dispatch('GetNodeId'); // 获取节点id
  const token = await store.dispatch('getToken'); // 获取token
  if (token) {
    // 用户信息不存在
    if (!store.getters.userInfo) {
      await store.dispatch('GetUser'); // 获取用户信息
      const menuList = await store.dispatch('GetMenu', localRoute); // 获取菜单
      await store.dispatch('GenerateRoutes', localRoute);
      console.log(store.getters.addRoutes);
      router.addRoutes(store.getters.addRoutes);
      console.log(store);
      if (to.path === '/' || to.path === '/login') {
        // 跳转至首页
        next({
          name: `Index`,
          replace: true
        });
      } else {
        const hasMenu = await checkMenu(menuList);
        if (!hasMenu) return;
        const isIportal = await getReferrer();
        const $path = isIportal ? { name: `Index` } : { path: to.path };
        next($path);
      }
    } else {
      console.log(123);
      next();
    }
  } else {
    if (whiteList.includes(to.path)) {
      // 在免登录白名单，直接进入
      next();
    } else {
      window.location.href = store.getters.api.IPORTAL_LOCAL_API + 'bus?node='; // + nodeId;
      NProgress.done();
    }
  }
});

async function checkMenu(menuList) {
  // 没有菜单返回
  if (!menuList.length) {
    MessageBox.alert('您暂时没有系统菜单权限，请点击确认重新登陆', '提示', {
      confirmButtonText: '确定',
      callback: () => {
        logout();
      }
    });
    return false;
  }
  return true;
}

/**
 * 是否从登录页登录
 */
async function getReferrer() {
  const referrer = document.referrer;
  const isIportal = referrer.includes('login?node=');
  return isIportal;
}

router.afterEach(() => {
  NProgress.done();
});