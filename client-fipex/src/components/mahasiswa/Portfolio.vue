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
              class="text-blue-600 font-medium"
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

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Karya Saya</h1>
          <p class="text-gray-600">Kelola semua karya yang telah Anda submit</p>
        </div>
        <router-link
          to="/mahasiswa/upload"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Upload Karya Baru
        </router-link>
      </div>

      <!-- Filters -->
      <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div class="flex space-x-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Filter:</label
            >
            <select
              v-model="filters.status"
              @change="applyFilters"
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="approved">Disetujui</option>
              <option value="pending">Pending Review</option>
              <option value="rejected">Ditolak</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >&nbsp;</label
            >
            <select
              v-model="filters.category"
              @change="applyFilters"
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Kategori</option>
              <option value="Aplikasi Mobile">Aplikasi Mobile</option>
              <option value="Web Development">Web Development</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Business Plan">Business Plan</option>
              <option value="Data Science">Data Science</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="text-gray-400 text-2xl mb-4">Loading...</div>
      </div>

      <!-- Works List -->
      <div v-else-if="filteredWorks.length > 0" class="space-y-6">
        <div
          v-for="work in filteredWorks"
          :key="work.id"
          class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="p-6">
            <div class="flex items-start space-x-4">
              <!-- Thumbnail -->
              <div
                class="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden"
              >
                <img
                  v-if="work.thumbnail"
                  :src="getImageUrl(work.thumbnail)"
                  :alt="work.title"
                  class="w-full h-full object-cover"
                  @error="onImageError"
                />
              </div>

              <!-- Content -->
              <div class="flex-1">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">
                      {{ work.title }}
                    </h3>
                    <div
                      class="flex items-center space-x-4 text-sm text-gray-600 mt-1"
                    >
                      <span
                        class="px-2 py-1 bg-blue-100 text-blue-800 rounded"
                        >{{ work.category }}</span
                      >
                      <span
                        :class="getStatusColor(work.status)"
                        class="px-2 py-1 rounded"
                      >
                        {{ getStatusText(work.status) }}
                      </span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex space-x-2">
                    <button
                      @click="viewDetail(work.id)"
                      class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                    >
                      Lihat Detail
                    </button>
                    <button
                      @click="editWork(work.id)"
                      class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      @click="deleteWork(work.id)"
                      class="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                <p class="text-gray-600 text-sm mb-3">{{ work.description }}</p>

                <!-- Technologies and Tools -->
                <div class="flex flex-wrap gap-2 mb-3">
                  <span
                    v-for="tech in work.technologies"
                    :key="tech"
                    class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {{ tech }}
                  </span>
                  <span
                    v-for="tool in work.tools"
                    :key="tool"
                    class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                  >
                    {{ tool }}
                  </span>
                </div>

                <!-- Links -->
                <div class="flex space-x-4 mb-3">
                  <a
                    v-if="work.githubUrl"
                    :href="work.githubUrl"
                    target="_blank"
                    class="text-xs text-blue-600 hover:underline"
                  >
                    GitHub
                  </a>
                  <a
                    v-if="work.liveUrl"
                    :href="work.liveUrl"
                    target="_blank"
                    class="text-xs text-green-600 hover:underline"
                  >
                    Live Demo
                  </a>
                  <a
                    v-if="work.figmaUrl"
                    :href="work.figmaUrl"
                    target="_blank"
                    class="text-xs text-purple-600 hover:underline"
                  >
                    Figma
                  </a>
                  <a
                    v-if="work.videoUrl"
                    :href="work.videoUrl"
                    target="_blank"
                    class="text-xs text-red-600 hover:underline"
                  >
                    Video
                  </a>
                </div>

                <div
                  class="flex items-center justify-between text-sm text-gray-500"
                >
                  <div class="flex items-center space-x-4">
                    <span>{{ work.votes || 0 }} votes</span>
                    <span>{{ work.views || 0 }} views</span>
                    <span>Disubmit: {{ formatDate(work.createdAt) }}</span>
                    <span>Author: {{ work.author }}</span>
                  </div>

                  <div v-if="work.feedback" class="text-xs">
                    <button
                      @click="showFeedback(work)"
                      class="text-blue-600 hover:underline"
                    >
                      Lihat Feedback
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">📁</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Belum ada karya</h3>
        <p class="text-gray-600 mb-4">Mulai upload karya pertama Anda</p>
        <router-link
          to="/mahasiswa/upload"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Upload Karya Baru
        </router-link>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination && pagination.totalPages > 1"
        class="mt-8 flex justify-center"
      >
        <nav class="flex items-center space-x-2">
          <button
            :disabled="pagination.currentPage === 1"
            @click="changePage(pagination.currentPage - 1)"
            class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span class="px-3 py-2 text-sm">
            {{ pagination.currentPage }} of {{ pagination.totalPages }}
          </span>
          <button
            :disabled="pagination.currentPage === pagination.totalPages"
            @click="changePage(pagination.currentPage + 1)"
            class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      </div>
    </div>

    <!-- Feedback Modal -->
    <div
      v-if="showFeedbackModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Feedback Review</h3>
        <p class="text-gray-700 mb-4">{{ selectedWork?.feedback }}</p>
        <button
          @click="showFeedbackModal = false"
          class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const works = ref([]);
const pagination = ref(null);
const isLoading = ref(false);
const filters = ref({
  status: "",
  category: "",
});

const showFeedbackModal = ref(false);
const selectedWork = ref(null);

const filteredWorks = computed(() => {
  let filtered = [...works.value];

  if (filters.value.status) {
    filtered = filtered.filter((work) => work.status === filters.value.status);
  }

  if (filters.value.category) {
    filtered = filtered.filter(
      (work) => work.category === filters.value.category
    );
  }

  return filtered;
});

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
    return date.toLocaleDateString("id-ID");
  }

  // Handle regular date string
  if (dateInput) {
    return new Date(dateInput).toLocaleDateString("id-ID");
  }

  return "Unknown date";
};

const getImageUrl = (thumbnail) => {
  // If thumbnail is already a full URL, return it
  if (thumbnail && thumbnail.startsWith("http")) {
    return thumbnail;
  }

  // Otherwise, prepend your API base URL
  return `http://localhost:3000${thumbnail}`;
};

const onImageError = (event) => {
  // Hide broken image or show placeholder
  event.target.style.display = "none";
};

const applyFilters = () => {
  // Filters are reactive, no need for additional logic
  // You might want to refetch data from API with filters
};

const changePage = async (page) => {
  if (page < 1 || page > pagination.value.totalPages) return;

  await fetchWorks(page);
};

const viewDetail = (id) => {
  router.push(`/mahasiswa/detail/${id}`);
};

const editWork = (id) => {
  router.push(`/mahasiswa/edit/${id}`);
};

const deleteWork = async (id) => {
  if (!confirm("Yakin ingin menghapus karya ini?")) return;

  try {
    const response = await fetch(`http://localhost:3000/api/works/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    if (response.ok) {
      works.value = works.value.filter((work) => work.id !== id);
      alert("Karya berhasil dihapus");
    } else {
      alert("Gagal menghapus karya");
    }
  } catch (error) {
    console.error("Error deleting work:", error);
    alert("Terjadi kesalahan");
  }
};

const showFeedback = (work) => {
  selectedWork.value = work;
  showFeedbackModal.value = true;
};

const fetchWorks = async (page = 1) => {
  isLoading.value = true;
  try {
    const response = await fetch(
      `http://localhost:3000/api/works/my-works?page=${page}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    console.log("Full response object:", response);
    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (response.ok) {
      const apiResponse = await response.json();
      console.log("Response JSON data:", apiResponse);

      // Extract works and pagination from the nested structure
      if (apiResponse.success && apiResponse.data) {
        works.value = apiResponse.data.works || [];
        pagination.value = apiResponse.data.pagination || null;
      } else {
        console.error("API response structure unexpected:", apiResponse);
        works.value = [];
        pagination.value = null;
      }
    } else {
      console.error("Fetch failed with status:", response.status);
      works.value = [];
      pagination.value = null;
    }
  } catch (error) {
    console.error("Error loading works:", error);
    works.value = [];
    pagination.value = null;
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchWorks();
});
</script>
