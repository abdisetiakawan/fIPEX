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

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <span class="text-gray-500">Edit Karya</span>
            </div>
          </li>
        </ol>
      </nav>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Edit Karya</h1>
          <router-link
            to="/mahasiswa/portfolio"
            class="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Kembali
          </router-link>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-12">
          <div class="text-gray-400 text-2xl mb-4">Loading...</div>
        </div>

        <!-- Form -->
        <form v-else @submit.prevent="updateWork" class="space-y-6">
          <!-- Title -->
          <div>
            <label
              for="title"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Judul Karya *</label
            >
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.title }"
            />
            <p v-if="errors.title" class="mt-1 text-sm text-red-600">
              {{ errors.title }}
            </p>
          </div>

          <!-- Description -->
          <div>
            <label
              for="description"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Deskripsi *</label
            >
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.description }"
            ></textarea>
            <p v-if="errors.description" class="mt-1 text-sm text-red-600">
              {{ errors.description }}
            </p>
          </div>

          <!-- Category -->
          <div>
            <label
              for="category"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Kategori *</label
            >
            <select
              id="category"
              v-model="form.category"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.category }"
            >
              <option value="">Pilih Kategori</option>
              <option value="Aplikasi Mobile">Aplikasi Mobile</option>
              <option value="Web Development">Web Development</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Business Plan">Business Plan</option>
            </select>
            <p v-if="errors.category" class="mt-1 text-sm text-red-600">
              {{ errors.category }}
            </p>
          </div>

          <!-- Current Thumbnail -->
          <div v-if="currentWork?.thumbnail">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Thumbnail Saat Ini</label
            >
            <div class="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
              <img
                :src="getImageUrl(currentWork.thumbnail)"
                :alt="currentWork.title"
                class="w-full h-full object-cover"
                @error="onImageError"
              />
            </div>
          </div>

          <!-- New Thumbnail -->
          <div>
            <label
              for="thumbnail"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              {{
                currentWork?.thumbnail
                  ? "Ganti Thumbnail (Opsional)"
                  : "Thumbnail *"
              }}
            </label>
            <input
              id="thumbnail"
              type="file"
              accept="image/*"
              @change="handleThumbnailChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.thumbnail }"
            />
            <p class="mt-1 text-sm text-gray-500">
              Format: JPG, PNG, GIF. Maksimal 5MB.
            </p>
            <p v-if="errors.thumbnail" class="mt-1 text-sm text-red-600">
              {{ errors.thumbnail }}
            </p>

            <!-- Thumbnail Preview -->
            <div v-if="thumbnailPreview" class="mt-2">
              <p class="text-sm text-gray-700 mb-1">Preview Thumbnail Baru:</p>
              <div class="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  :src="thumbnailPreview"
                  alt="Preview"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <!-- Technologies -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Teknologi yang Digunakan</label
            >
            <div class="flex flex-wrap gap-2 mb-2">
              <span
                v-for="(tech, index) in form.technologies"
                :key="index"
                class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {{ tech }}
                <button
                  type="button"
                  @click="removeTechnology(index)"
                  class="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            </div>
            <div class="flex">
              <input
                v-model="newTechnology"
                type="text"
                placeholder="Tambah teknologi"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                @keyup.enter="addTechnology"
              />
              <button
                type="button"
                @click="addTechnology"
                class="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              >
                Tambah
              </button>
            </div>
          </div>

          <!-- Tools -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Tools yang Digunakan</label
            >
            <div class="flex flex-wrap gap-2 mb-2">
              <span
                v-for="(tool, index) in form.tools"
                :key="index"
                class="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
              >
                {{ tool }}
                <button
                  type="button"
                  @click="removeTool(index)"
                  class="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            </div>
            <div class="flex">
              <input
                v-model="newTool"
                type="text"
                placeholder="Tambah tool"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                @keyup.enter="addTool"
              />
              <button
                type="button"
                @click="addTool"
                class="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700"
              >
                Tambah
              </button>
            </div>
          </div>

          <!-- Links -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                for="githubUrl"
                class="block text-sm font-medium text-gray-700 mb-1"
                >GitHub URL</label
              >
              <input
                id="githubUrl"
                v-model="form.githubUrl"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                for="liveUrl"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Live Demo URL</label
              >
              <input
                id="liveUrl"
                v-model="form.liveUrl"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                for="figmaUrl"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Figma URL</label
              >
              <input
                id="figmaUrl"
                v-model="form.figmaUrl"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                for="videoUrl"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Video Demo URL</label
              >
              <input
                id="videoUrl"
                v-model="form.videoUrl"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end space-x-4">
            <router-link
              to="/mahasiswa/portfolio"
              class="px-6 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Batal
            </router-link>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ isSubmitting ? "Menyimpan..." : "Simpan Perubahan" }}
            </button>
          </div>
        </form>
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
const isLoading = ref(true);
const isSubmitting = ref(false);
const currentWork = ref(null);
const thumbnailPreview = ref(null);
const newTechnology = ref("");
const newTool = ref("");

const form = ref({
  title: "",
  description: "",
  category: "",
  thumbnail: null,
  technologies: [],
  tools: [],
  githubUrl: "",
  liveUrl: "",
  figmaUrl: "",
  videoUrl: "",
});

const errors = ref({});

const getImageUrl = (thumbnail) => {
  if (thumbnail && thumbnail.startsWith("http")) {
    return thumbnail;
  }
  return `http://localhost:3000${thumbnail}`;
};

const onImageError = (event) => {
  event.target.style.display = "none";
};

const handleThumbnailChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      errors.value.thumbnail = "Ukuran file maksimal 5MB";
      return;
    }

    if (!file.type.startsWith("image/")) {
      errors.value.thumbnail = "File harus berupa gambar";
      return;
    }

    form.value.thumbnail = file;
    errors.value.thumbnail = "";

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      thumbnailPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const addTechnology = () => {
  if (
    newTechnology.value.trim() &&
    !form.value.technologies.includes(newTechnology.value.trim())
  ) {
    form.value.technologies.push(newTechnology.value.trim());
    newTechnology.value = "";
  }
};

const removeTechnology = (index) => {
  form.value.technologies.splice(index, 1);
};

const addTool = () => {
  if (
    newTool.value.trim() &&
    !form.value.tools.includes(newTool.value.trim())
  ) {
    form.value.tools.push(newTool.value.trim());
    newTool.value = "";
  }
};

const removeTool = (index) => {
  form.value.tools.splice(index, 1);
};

const fetchWork = async () => {
  try {
    isLoading.value = true;
    const response = await worksAPI.getById(workId);

    if (response.data.success) {
      currentWork.value = response.data.data.work;

      // Populate form
      form.value = {
        title: currentWork.value.title || "",
        description: currentWork.value.description || "",
        category: currentWork.value.category || "",
        thumbnail: null, // Don't set existing thumbnail as file
        technologies: currentWork.value.technologies || [],
        tools: currentWork.value.tools || [],
        githubUrl: currentWork.value.githubUrl || "",
        liveUrl: currentWork.value.liveUrl || "",
        figmaUrl: currentWork.value.figmaUrl || "",
        videoUrl: currentWork.value.videoUrl || "",
      };
    }
  } catch (error) {
    console.error("Error fetching work:", error);
    alert("Gagal memuat data karya");
    router.push("/mahasiswa/portfolio");
  } finally {
    isLoading.value = false;
  }
};

const updateWork = async () => {
  try {
    isSubmitting.value = true;
    errors.value = {};

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("title", form.value.title);
    formData.append("description", form.value.description);
    formData.append("category", form.value.category);
    formData.append("technologies", JSON.stringify(form.value.technologies));
    formData.append("tools", JSON.stringify(form.value.tools));
    formData.append("githubUrl", form.value.githubUrl);
    formData.append("liveUrl", form.value.liveUrl);
    formData.append("figmaUrl", form.value.figmaUrl);
    formData.append("videoUrl", form.value.videoUrl);

    if (form.value.thumbnail) {
      formData.append("thumbnail", form.value.thumbnail);
    }

    const response = await worksAPI.update(workId, formData);

    if (response.data.success) {
      alert("Karya berhasil diperbarui!");
      router.push("/mahasiswa/portfolio");
    }
  } catch (error) {
    console.error("Error updating work:", error);

    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    } else {
      alert(error.response?.data?.message || "Gagal memperbarui karya");
    }
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchWork();
});
</script>
