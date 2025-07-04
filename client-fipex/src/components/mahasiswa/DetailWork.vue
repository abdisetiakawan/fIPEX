<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">Digital Exhibition</h1>
          </div>
          <nav class="flex items-center space-x-8">
            <router-link
              to="/mahasiswa"
              class="text-gray-500 hover:text-gray-700"
              >Dashboard</router-link
            >
            <router-link
              to="/mahasiswa/portfolio"
              class="text-gray-500 hover:text-gray-700"
              >Karya Saya</router-link
            >
            <router-link
              to="/mahasiswa/upload"
              class="text-gray-500 hover:text-gray-700"
              >Upload Karya</router-link
            >
            <router-link
              to="/mahasiswa/profile"
              class="text-gray-500 hover:text-gray-700"
              >Profil</router-link
            >
          </nav>
        </div>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="flex mb-8" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-3">
          <li class="inline-flex items-center">
            <router-link
              to="/mahasiswa"
              class="text-gray-700 hover:text-blue-600"
              >Dashboard</router-link
            >
          </li>
          <li>
            <div class="flex items-center">
              <span class="mx-2 text-gray-400">/</span>
              <router-link
                to="/mahasiswa/portfolio"
                class="text-gray-700 hover:text-blue-600"
                >Karya Saya</router-link
              >
            </div>
          </li>
          <li aria-current="page">
            <div class="flex items-center">
              <span class="mx-2 text-gray-400">/</span>
              <span class="text-gray-500">Detail Karya</span>
            </div>
          </li>
        </ol>
      </nav>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="text-gray-400 text-2xl mb-4">Loading...</div>
      </div>

      <!-- Work Detail -->
      <div
        v-else-if="work"
        class="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <!-- Header with Actions -->
        <div
          class="px-6 py-4 border-b border-gray-200 flex justify-between items-center"
        >
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ work.title }}</h1>
            <div class="flex items-center space-x-4 mt-2">
              <span
                class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >{{ work.category }}</span
              >
              <span
                :class="getStatusColor(work.status)"
                class="px-3 py-1 text-sm rounded-full"
              >
                {{ getStatusText(work.status) }}
              </span>
            </div>
          </div>
          <div class="flex space-x-3">
            <router-link
              :to="`/mahasiswa/edit/${work.id}`"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Karya
            </router-link>
            <button
              @click="deleteWork"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Hapus Karya
            </button>
            <router-link
              to="/mahasiswa/portfolio"
              class="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Kembali
            </router-link>
          </div>
        </div>

        <div class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Content -->
            <div class="lg:col-span-2">
              <!-- Thumbnail -->
              <div v-if="work.thumbnail" class="mb-6">
                <img
                  :src="getImageUrl(work.thumbnail)"
                  :alt="work.title"
                  class="w-full h-64 object-cover rounded-lg"
                  @error="onImageError"
                />
              </div>

              <!-- Description -->
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">
                  Deskripsi
                </h3>
                <p class="text-gray-700 leading-relaxed">
                  {{ work.description }}
                </p>
              </div>

              <!-- Technologies -->
              <div
                v-if="work.technologies && work.technologies.length > 0"
                class="mb-6"
              >
                <h3 class="text-lg font-semibold text-gray-900 mb-3">
                  Teknologi yang Digunakan
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tech in work.technologies"
                    :key="tech"
                    class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {{ tech }}
                  </span>
                </div>
              </div>

              <!-- Tools -->
              <div v-if="work.tools && work.tools.length > 0" class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">
                  Tools yang Digunakan
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tool in work.tools"
                    :key="tool"
                    class="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                  >
                    {{ tool }}
                  </span>
                </div>
              </div>

              <!-- Links -->
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Links</h3>
                <div class="grid grid-cols-2 gap-4">
                  <a
                    v-if="work.githubUrl"
                    :href="work.githubUrl"
                    target="_blank"
                    class="flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                  >
                    <svg
                      class="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    GitHub
                  </a>
                  <a
                    v-if="work.liveUrl"
                    :href="work.liveUrl"
                    target="_blank"
                    class="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <svg
                      class="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Live Demo
                  </a>
                  <a
                    v-if="work.figmaUrl"
                    :href="work.figmaUrl"
                    target="_blank"
                    class="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    <svg
                      class="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.354-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.015-4.49-4.491S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117v-6.038H8.148z"
                      />
                    </svg>
                    Figma
                  </a>
                  <a
                    v-if="work.videoUrl"
                    :href="work.videoUrl"
                    target="_blank"
                    class="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <svg
                      class="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"
                      />
                    </svg>
                    Video Demo
                  </a>
                </div>
              </div>

              <!-- Feedback -->
              <div v-if="work.feedback" class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">
                  Feedback dari Reviewer
                </h3>
                <div
                  class="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                >
                  <p class="text-gray-700">{{ work.feedback }}</p>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="lg:col-span-1">
              <!-- Statistics -->
              <div class="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  Statistik
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Votes:</span>
                    <span class="font-medium">{{ work.votes || 0 }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Views:</span>
                    <span class="font-medium">{{ work.views || 0 }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Status:</span>
                    <span
                      :class="getStatusColor(work.status)"
                      class="px-2 py-1 text-xs rounded-full"
                    >
                      {{ getStatusText(work.status) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Author Info -->
              <div class="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  Informasi Author
                </h3>
                <div class="flex items-center space-x-3">
                  <div
                    class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center"
                  >
                    <span class="text-gray-600 font-medium">{{
                      work.author?.charAt(0) || "A"
                    }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">
                      {{ work.author || "Unknown" }}
                    </p>
                    <p class="text-sm text-gray-600">
                      {{ work.authorEmail || "" }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Timestamps -->
              <div class="bg-gray-50 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  Timeline
                </h3>
                <div class="space-y-3">
                  <div>
                    <span class="text-gray-600 text-sm">Dibuat:</span>
                    <p class="font-medium">{{ formatDate(work.createdAt) }}</p>
                  </div>
                  <div v-if="work.updatedAt">
                    <span class="text-gray-600 text-sm">Diperbarui:</span>
                    <p class="font-medium">{{ formatDate(work.updatedAt) }}</p>
                  </div>
                  <div v-if="work.reviewedAt">
                    <span class="text-gray-600 text-sm">Direview:</span>
                    <p class="font-medium">{{ formatDate(work.reviewedAt) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">❌</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Karya tidak ditemukan
        </h3>
        <p class="text-gray-600 mb-4">
          Karya yang Anda cari tidak dapat ditemukan
        </p>
        <router-link
          to="/mahasiswa/portfolio"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Kembali ke Portfolio
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { worksAPI } from "../../services/api";

const route = useRoute();
const router = useRouter();

const workId = route.params.id;
const work = ref(null);
const isLoading = ref(true);

const getStatusColor = (status) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "draft":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "approved":
      return "Disetujui";
    case "pending":
      return "Pending Review";
    case "rejected":
      return "Ditolak";
    case "draft":
      return "Draft";
    default:
      return status;
  }
};

const formatDate = (dateInput) => {
  // Handle Firestore timestamp format
  if (dateInput && typeof dateInput === "object" && dateInput._seconds) {
    const date = new Date(dateInput._seconds * 1000);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  // Handle regular date string
  if (dateInput) {
    return new Date(dateInput).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return "Unknown date";
};

const getImageUrl = (thumbnail) => {
  if (thumbnail && thumbnail.startsWith("http")) {
    return thumbnail;
  }
  return `http://localhost:3000${thumbnail}`;
};

const onImageError = (event) => {
  event.target.style.display = "none";
};

const fetchWork = async () => {
  try {
    isLoading.value = true;
    const response = await worksAPI.getById(workId);

    if (response.data.success) {
      work.value = response.data.data.work;
    }
  } catch (error) {
    console.error("Error fetching work:", error);
    work.value = null;
  } finally {
    isLoading.value = false;
  }
};

const deleteWork = async () => {
  if (
    !confirm(
      "Yakin ingin menghapus karya ini? Tindakan ini tidak dapat dibatalkan."
    )
  ) {
    return;
  }

  try {
    const response = await worksAPI.delete(workId);

    if (response.data.success) {
      alert("Karya berhasil dihapus!");
      router.push("/mahasiswa/portfolio");
    }
  } catch (error) {
    console.error("Error deleting work:", error);
    alert(error.response?.data?.message || "Gagal menghapus karya");
  }
};

onMounted(() => {
  fetchWork();
});
</script>
