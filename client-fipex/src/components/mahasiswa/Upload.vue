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
              class="text-blue-600 font-medium"
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
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Upload Karya Baru</h1>
        <p class="text-gray-600">Tambahkan karya Anda ke pameran digital</p>
      </div>

      <!-- Error Messages -->
      <div
        v-if="errors.length > 0"
        class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
      >
        <h3 class="text-red-800 font-medium mb-2">Terdapat kesalahan:</h3>
        <ul class="text-red-700 text-sm space-y-1">
          <li
            v-for="error in errors"
            :key="error.field"
            class="flex items-start"
          >
            <span class="text-red-500 mr-2">•</span>
            <span
              ><strong>{{ error.field }}:</strong> {{ error.message }}</span
            >
          </li>
        </ul>
      </div>

      <!-- Success Message -->
      <div
        v-if="successMessage"
        class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4"
      >
        <p class="text-green-800">{{ successMessage }}</p>
      </div>

      <form
        @submit.prevent="submitWork"
        class="bg-white rounded-lg shadow p-6 space-y-6"
      >
        <!-- Basic Information -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Informasi Dasar</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Judul Karya *
              </label>
              <input
                v-model="form.title"
                type="text"
                required
                placeholder="Masukkan judul karya"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': getFieldError('title') }"
              />
              <p
                v-if="getFieldError('title')"
                class="text-red-500 text-xs mt-1"
              >
                {{ getFieldError("title") }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                v-model="form.category"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': getFieldError('category') }"
              >
                <option value="">Pilih Kategori</option>
                <option value="Aplikasi Mobile">Aplikasi Mobile</option>
                <option value="Web Development">Web Development</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Business Plan">Business Plan</option>
                <option value="Data Science">Data Science</option>
              </select>
              <p
                v-if="getFieldError('category')"
                class="text-red-500 text-xs mt-1"
              >
                {{ getFieldError("category") }}
              </p>
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi *
            </label>
            <textarea
              v-model="form.description"
              required
              placeholder="Jelaskan karya Anda secara detail..."
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': getFieldError('description') }"
            ></textarea>
            <p
              v-if="getFieldError('description')"
              class="text-red-500 text-xs mt-1"
            >
              {{ getFieldError("description") }}
            </p>
            <p class="text-gray-500 text-xs mt-1">
              Minimal 10 karakter, maksimal 1000 karakter
            </p>
          </div>
        </div>

        <!-- Media Upload -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Media Karya</h3>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail/Cover *
            </label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileUpload"
                class="hidden"
              />
              <div v-if="!form.thumbnail && !thumbnailPreview">
                <div class="text-gray-400 mb-2">
                  <svg
                    class="mx-auto h-12 w-12"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <p class="text-sm text-gray-600 mb-2">
                  Drag & drop gambar atau klik untuk upload
                </p>
                <p class="text-xs text-gray-500">PNG, JPG, WEBP hingga 5MB</p>
                <button
                  type="button"
                  @click="$refs.fileInput.click()"
                  class="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Pilih File
                </button>
              </div>
              <div v-else-if="thumbnailPreview" class="space-y-3">
                <img
                  :src="thumbnailPreview"
                  alt="Preview"
                  class="mx-auto max-h-32 rounded"
                />
                <div class="text-green-600 text-sm">
                  ✓ File uploaded: {{ form.thumbnail?.name }}
                </div>
                <button
                  type="button"
                  @click="removeThumbnail"
                  class="text-red-600 text-sm hover:text-red-800"
                >
                  Hapus gambar
                </button>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Video Demo (Opsional)
            </label>
            <input
              v-model="form.videoUrl"
              type="url"
              placeholder="https://youtube.com/watch?v=... atau https://vimeo.com/..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': getFieldError('videoUrl') }"
            />
            <p
              v-if="getFieldError('videoUrl')"
              class="text-red-500 text-xs mt-1"
            >
              {{ getFieldError("videoUrl") }}
            </p>
            <p class="text-gray-500 text-xs mt-1">
              Link YouTube, Vimeo, atau platform video lainnya
            </p>
          </div>
        </div>

        <!-- Technologies -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Teknologi & Tools</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Teknologi Utama
              </label>
              <input
                v-model="form.technologies"
                type="text"
                placeholder="React, Flutter, Figma, Python"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': getFieldError('technologies') }"
              />
              <p
                v-if="getFieldError('technologies')"
                class="text-red-500 text-xs mt-1"
              >
                {{ getFieldError("technologies") }}
              </p>
              <p class="text-gray-500 text-xs mt-1">Pisahkan dengan koma (,)</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tools Pendukung
              </label>
              <input
                v-model="form.tools"
                type="text"
                placeholder="Firebase, MongoDB, Docker, AWS"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': getFieldError('tools') }"
              />
              <p
                v-if="getFieldError('tools')"
                class="text-red-500 text-xs mt-1"
              >
                {{ getFieldError("tools") }}
              </p>
              <p class="text-gray-500 text-xs mt-1">Pisahkan dengan koma (,)</p>
            </div>
          </div>
        </div>

        <!-- Links & Demo -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Links & Demo</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                GitHub Repository
              </label>
              <input
                v-model="form.githubUrl"
                type="url"
                placeholder="https://github.com/username/repository"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': getFieldError('githubUrl') }"
              />
              <p
                v-if="getFieldError('githubUrl')"
                class="text-red-500 text-xs mt-1"
              >
                {{ getFieldError("githubUrl") }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Live Demo
              </label>
              <input
                v-model="form.liveUrl"
                type="url"
                placeholder="https://your-app.vercel.app"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': getFieldError('liveUrl') }"
              />
              <p
                v-if="getFieldError('liveUrl')"
                class="text-red-500 text-xs mt-1"
              >
                {{ getFieldError("liveUrl") }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Design File (Figma/Adobe XD)
              </label>
              <input
                v-model="form.figmaUrl"
                type="url"
                placeholder="https://figma.com/file/..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': getFieldError('figmaUrl') }"
              />
              <p
                v-if="getFieldError('figmaUrl')"
                class="text-red-500 text-xs mt-1"
              >
                {{ getFieldError("figmaUrl") }}
              </p>
            </div>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            @click="saveDraft"
            :disabled="loading"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Simpan Draft
          </button>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {{ loading ? "Submitting..." : "Submit untuk Review" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { worksAPI } from "../../services/api";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  title: "",
  category: "",
  description: "",
  thumbnail: null,
  videoUrl: "",
  technologies: "",
  tools: "",
  githubUrl: "",
  liveUrl: "",
  figmaUrl: "",
});

const loading = ref(false);
const errors = ref([]);
const successMessage = ref("");
const thumbnailPreview = ref("");

// Computed properties
const isFormValid = computed(() => {
  return (
    form.value.title.trim() &&
    form.value.category &&
    form.value.description.trim().length >= 10 &&
    form.value.thumbnail
  );
});

// Methods
const getFieldError = (fieldName) => {
  const error = errors.value.find((err) => err.field === fieldName);
  return error ? error.message : null;
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File terlalu besar. Maksimal 5MB.");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WEBP.");
      return;
    }

    form.value.thumbnail = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      thumbnailPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const removeThumbnail = () => {
  form.value.thumbnail = null;
  thumbnailPreview.value = "";
  if (window.$refs.fileInput) {
    window.$refs.fileInput.value = "";
  }
};

const clearMessages = () => {
  errors.value = [];
  successMessage.value = "";
};

const saveDraft = async () => {
  // TODO: Implement save as draft functionality
  console.log("Saving draft...", form.value);
  alert("Fitur simpan draft akan segera tersedia!");
};

const submitWork = async () => {
  clearMessages();
  loading.value = true;

  try {
    // Create FormData for file upload
    const formData = new FormData();

    // Append all form fields
    formData.append("title", form.value.title.trim());
    formData.append("category", form.value.category);
    formData.append("description", form.value.description.trim());

    if (form.value.technologies.trim()) {
      formData.append("technologies", form.value.technologies.trim());
    }

    if (form.value.tools.trim()) {
      formData.append("tools", form.value.tools.trim());
    }

    if (form.value.githubUrl.trim()) {
      formData.append("githubUrl", form.value.githubUrl.trim());
    }

    if (form.value.liveUrl.trim()) {
      formData.append("liveUrl", form.value.liveUrl.trim());
    }

    if (form.value.figmaUrl.trim()) {
      formData.append("figmaUrl", form.value.figmaUrl.trim());
    }

    if (form.value.videoUrl.trim()) {
      formData.append("videoUrl", form.value.videoUrl.trim());
    }

    // Append thumbnail file
    if (form.value.thumbnail) {
      formData.append("thumbnail", form.value.thumbnail);
    }

    // Submit using fetch with proper headers
    const response = await fetch("http://localhost:3000/api/works", {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      successMessage.value = "Karya berhasil disubmit untuk review!";

      // Reset form
      form.value = {
        title: "",
        category: "",
        description: "",
        thumbnail: null,
        videoUrl: "",
        technologies: "",
        tools: "",
        githubUrl: "",
        liveUrl: "",
        figmaUrl: "",
      };
      thumbnailPreview.value = "";

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/mahasiswa/portfolio");
      }, 2000);
    } else {
      // Handle validation errors
      if (result.errors && Array.isArray(result.errors)) {
        errors.value = result.errors;
      } else {
        errors.value = [
          {
            field: "general",
            message: result.message || "Terjadi kesalahan saat submit karya",
          },
        ];
      }
    }
  } catch (error) {
    console.error("Error submitting work:", error);
    errors.value = [
      {
        field: "general",
        message: "Terjadi kesalahan jaringan. Silakan coba lagi.",
      },
    ];
  }

  loading.value = false;
};
</script>

<style scoped>
/* Custom styles for better UX */
.transition-colors {
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

/* File upload drag and drop styles */
.border-dashed:hover {
  border-color: #9ca3af;
}

/* Form validation styles */
.border-red-500 {
  border-color: #ef4444;
}

.border-red-500:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
</style>
