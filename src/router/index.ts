import { createRouter, createWebHistory } from 'vue-router'

import Chats from '@/views/Chats.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Users from '@/views/Users.vue'
import Settings from '@/views/Settings.vue'
import ProfileComponent from '@/components/Settings/ProfileComponent.vue'
import SecurityComponent from '@/components/Settings/SecurityComponent.vue'
import PrivacityComponent from '@/components/Settings/PrivacityComponent.vue'
import Transmitions from '@/views/Transmitions.vue'
import Groups from '@/views/Groups.vue'
import Live from '@/views/LiveHost.vue'
import LiveViewer from '@/views/LiveViewer.vue'

import CallingComponent from '@/components/calls/CallingComponent.vue'
import CallComponente from '@/components/calls/CallComponente.vue'
import MiniCallComponent from '@/components/calls/MiniCallComponent.vue'
import ApplicationComponent from '@/components/ApplicationComponent.vue'
import Dashboard from '@/views/Dashboard.vue'
import RoomWait from '@/views/RoomWait.vue'
import Host from '@/components/VideoTest.vue'
import Viewer from '@/components/VideoTestV.vue'
const routes = [
  {
    path: '/host',
    name: 'request-A',  
    component: Host,
  },
  {
    path: '/viewer',
    name: 'request-B',  
    component: Viewer,  
  },
  {
    path: '/request-live/:id',
    name: 'request-live',
    component: RoomWait,
  },

  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },

  {
    path: '/dashboard',
    name: 'dashboard',
    component: MainLayout,
    children: [
      {
        path: 'statistics',
        name: 'statistics',
        component: Dashboard,
      },

      { path: 'users', name: 'users', component: Users },

      {
        path: 'chats',
        name: 'chats',
        component: Chats
      },
      {
        path: 'calling/:id',
        name: 'calling',
        component: CallingComponent,
      },
      {
        path: 'call/:id',
        name: 'call',
        component: CallComponente,
      },

      {
        path: 'miniCall',
        name: 'mini-call',
        component: MiniCallComponent,
      },
      { path: 'application', name: 'application', component: ApplicationComponent },
      { path: 'groups', name: 'groups', component: Groups },
      { path: 'transmitions', name: 'transmitions', component: Transmitions },
      {
        path: 'settings',
        name: 'settings',
        component: Settings,
        children: [
          { path: 'profile', name: 'profile', component: ProfileComponent },
          { path: 'security', name: 'security', component: SecurityComponent },
          { path: 'privacity', name: 'privacity', component: PrivacityComponent },
        ],
      },
    ],
  },
  {
    path: '/liveHost/:id',
    name: 'live',
    component: Live,
  },
  {
    path: '/liveViewer/:link/:id',
    name: 'live-viewer',
    component: LiveViewer,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
