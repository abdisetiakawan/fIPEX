import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import App from "./App.vue";

import "./assets/main.css";

// Import components
import Login from "./components/Login.vue";
import MahasiswaDashboard from "./components/mahasiswa/Dashboard.vue";
import MahasiswaUpload from "./components/mahasiswa/Upload.vue";
import MahasiswaPortfolio from "./components/mahasiswa/Portfolio.vue";
import MahasiswaProfile from "./components/mahasiswa/Profile.vue";
import PanitiaDashboard from "./components/panitia/Dashboard.vue";
import PanitiaManagement from "./components/panitia/Management.vue";
import PanitiaVoting from "./components/panitia/Voting.vue";
import PanitiaSchedule from "./components/panitia/Schedule.vue";
import PengunjungHome from "./components/pengunjung/Home.vue";
import PengunjungKatalog from "./components/pengunjung/Katalog.vue";
import PengunjungDetail from "./components/pengunjung/Detail.vue";
import PengunjungFavorit from "./components/pengunjung/Favorit.vue";
import Register from "./components/Register.vue";
import DetailWork from "./components/mahasiswa/DetailWork.vue";
import EditWork from "./components/mahasiswa/EditWork.vue";

const routes = [
  { path: "/", redirect: "/pengunjung" },
  { path: "/register", component: Register },
  { path: "/login", component: Login },
  { path: "/pengunjung", component: PengunjungHome },
  { path: "/pengunjung/katalog", component: PengunjungKatalog },
  { path: "/pengunjung/detail/:id", component: PengunjungDetail },
  { path: "/pengunjung/favorit", component: PengunjungFavorit },
  { path: "/mahasiswa", component: MahasiswaDashboard },
  { path: "/mahasiswa/upload", component: MahasiswaUpload },
  { path: "/mahasiswa/portfolio", component: MahasiswaPortfolio },
  { path: "/mahasiswa/profile", component: MahasiswaProfile },
  { path: "/mahasiswa/detail/:id", component: DetailWork },
  { path: "/mahasiswa/edit/:id", component: EditWork },
  { path: "/panitia", component: PanitiaDashboard },
  { path: "/panitia/management", component: PanitiaManagement },
  { path: "/panitia/voting", component: PanitiaVoting },
  { path: "/panitia/schedule", component: PanitiaSchedule },
];
const app = createApp(App);

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount("#app");
