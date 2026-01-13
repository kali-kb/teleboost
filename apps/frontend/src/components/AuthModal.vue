<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { authClient } from "../../lib/auth-client";

const props = defineProps<{
  isOpen: boolean;
  initialStep?: AuthStep;
}>();

const emit = defineEmits(["close", "authComplete"]);

// Auth states: signin, signup, profile-type, company-details, complete
type AuthStep =
  | "signin"
  | "signup"
  | "profile-type"
  | "company-details"
  | "complete";
const currentStep = ref<AuthStep>(props.initialStep || "signin");

watch(() => props.initialStep, (newStep) => {
  if (newStep) {
    currentStep.value = newStep;
  }
});
const showPassword = ref(false);
const isLoading = ref(false);

// Advertiser type selection
type AdvertiserType = "INDIVIDUAL" | "ENTERPRISE";
const selectedAdvertiserType = ref<AdvertiserType | null>(null);

const form = reactive({
  email: "",
  password: "",
  confirmPassword: "",
  fullName: "",
});

const companyForm = reactive({
  companyName: "",
  registrationNumber: "",
  website: "",
});

const errors = reactive({
  email: "",
  password: "",
  confirmPassword: "",
  fullName: "",
  companyName: "",
});

// Computed helpers
const isSignupFlow = computed(() =>
  ["signup", "profile-type", "company-details", "complete"].includes(
    currentStep.value,
  ),
);

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const passwordRequirements = computed(() => [
  { label: "At least 8 characters", met: form.password.length >= 8 },
  { label: "At least one uppercase", met: /[A-Z]/.test(form.password) },
  { label: "At least one lowercase", met: /[a-z]/.test(form.password) },
  {
    label: "At least one symbol",
    met: /[!@#$%^&*(),.?":{}|<>]/.test(form.password),
  },
  { label: "At least one number", met: /[0-9]/.test(form.password) },
]);

const isPasswordStrong = computed(() => {
  return passwordRequirements.value.every((r) => r.met);
});

// Real-time error clearing and validation
const validateField = (field: keyof typeof form | "companyName") => {
  if (field === "email") {
    if (form.email && !validateEmail(form.email)) {
      errors.email = "Invalid email format";
    } else {
      errors.email = "";
    }
  }

  if (field === "fullName" && isSignupFlow.value) {
    if (form.fullName && form.fullName.length < 2) {
      errors.fullName = "Please enter your full name";
    } else {
      errors.fullName = "";
    }
  }

  if (field === "confirmPassword" && isSignupFlow.value) {
    if (form.confirmPassword && form.confirmPassword !== form.password) {
      errors.confirmPassword = "Passwords do not match";
    } else {
      errors.confirmPassword = "";
    }
  }

  if (field === "password") {
    if (currentStep.value === "signin") {
      errors.password = form.password.length < 8 ? "Min 8 characters" : "";
    } else {
      errors.password = ""; // Handled by checklist
    }
  }

  if (field === "companyName") {
    if (companyForm.companyName && companyForm.companyName.length < 2) {
      errors.companyName = "Company name is too short";
    } else {
      errors.companyName = "";
    }
  }
};

const handleGoogleSignIn = async () => {
  const callbackURL = window.location.origin + "/";
  authClient.signIn.social({
    provider: "google",
    callbackURL: callbackURL,
  });
};

const handleAuth = async () => {
  // Reset errors
  Object.keys(errors).forEach(
    (key) => (errors[key as keyof typeof errors] = ""),
  );

  let isValid = true;

  if (!validateEmail(form.email)) {
    errors.email = "Please enter a valid email address";
    isValid = false;
  }

  if (currentStep.value === "signup" && !isPasswordStrong.value) {
    errors.password = "Please meet all password requirements";
    isValid = false;
  } else if (form.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
    isValid = false;
  }

  if (currentStep.value === "signup") {
    if (!form.fullName) {
      errors.fullName = "Full name is required";
      isValid = false;
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }
  }

  if (!isValid) return;

  isLoading.value = true;

  try {
    if (currentStep.value === "signup") {
      const { data, error } = await authClient.signUp.email({
        email: form.email,
        password: form.password,
        name: form.fullName,
      }, {
        onSuccess: () => {
          isLoading.value = false;
          currentStep.value = "profile-type";
        },
        onError: (ctx) => {
          errors.email = ctx.error.message || "An error occurred during signup";
          isLoading.value = false;
        }
      });
      return; // onSuccess handles transition
    } else {
      const { data, error } = await authClient.signIn.email({
        email: form.email,
        password: form.password,
      });

      if (error) {
        errors.email = error.message || "Invalid email or password";
        isLoading.value = false;
        return;
      }

      // Check if user has a profile
      try {
        const profileResponse = await fetch("http://localhost:3001/api/advertiser/profile", {
          credentials: 'include'
        });
        const profile = await profileResponse.json();

        if (!profile || profile.error || Object.keys(profile).length === 0) {
          currentStep.value = "profile-type";
          isLoading.value = false;
        } else {
          // Sign in complete - redirect to dashboard
          emit("authComplete", { type: "signin", email: form.email });
          window.location.hash = "#/dashboard";
          emit("close");
        }
      } catch (e) {
        // If profile fetch fails, assume no profile
        currentStep.value = "profile-type";
        isLoading.value = false;
      }
    }
  } catch (err) {
    console.error("Auth error:", err);
    errors.email = "A connection error occurred";
    isLoading.value = false;
  }
};

const selectAdvertiserType = (type: AdvertiserType) => {
  selectedAdvertiserType.value = type;

  if (type === "INDIVIDUAL") {
    // Skip company details, go straight to complete
    completeSignup();
  } else {
    // Enterprise needs company details
    currentStep.value = "company-details";
  }
};

const handleCompanySubmit = async () => {
  errors.companyName = "";

  if (!companyForm.companyName || companyForm.companyName.length < 2) {
    errors.companyName = "Company name is required";
    return;
  }

  completeSignup();
};

const completeSignup = async () => {
  isLoading.value = true;
  try {
    const response = await fetch("http://localhost:3001/api/advertiser/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify({
        type: selectedAdvertiserType.value,
        companyName: companyForm.companyName,
        registrationNumber: companyForm.registrationNumber,
        website: companyForm.website,
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed with status ${response.status}`);
    }

    currentStep.value = "complete";

    // Auto-redirect to dashboard after success animation
    setTimeout(() => {
      emit("authComplete", {
        type: "signup",
        email: form.email,
        advertiserType: selectedAdvertiserType.value,
        company:
          selectedAdvertiserType.value === "ENTERPRISE" ? companyForm : null,
      });
      // Navigate to dashboard
      window.location.hash = "#/dashboard";
      resetAndClose();
    }, 2500);
  } catch (error) {
    console.error("Failed to save profile:", error);
    // Even if it fails, maybe let them through or show error?
    currentStep.value = "complete";
  } finally {
    isLoading.value = false;
  }
};

const toggleMode = () => {
  currentStep.value = currentStep.value === "signin" ? "signup" : "signin";
  // Clear errors when switching
  Object.keys(errors).forEach(
    (key) => (errors[key as keyof typeof errors] = ""),
  );
};

const goBack = () => {
  if (currentStep.value === "company-details") {
    currentStep.value = "profile-type";
  } else if (currentStep.value === "profile-type") {
    currentStep.value = "signup";
  }
};

const resetAndClose = () => {
  currentStep.value = "signin";
  selectedAdvertiserType.value = null;
  form.email = "";
  form.password = "";
  form.confirmPassword = "";
  form.fullName = "";
  companyForm.companyName = "";
  companyForm.registrationNumber = "";
  companyForm.website = "";
  Object.keys(errors).forEach(
    (key) => (errors[key as keyof typeof errors] = ""),
  );
  emit("close");
};

// Reset modal state when closed externally
watch(
  () => props.isOpen,
  (newVal) => {
    if (!newVal) {
      // Don't reset immediately to allow for animations
      setTimeout(() => {
        if (!props.isOpen) {
          currentStep.value = "signin";
          selectedAdvertiserType.value = null;
        }
      }, 300);
    }
  },
);
</script>

<template>
  <transition name="modal-fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center px-4"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        @click="resetAndClose"
      ></div>

      <!-- Modal Content -->
      <div
        class="relative w-full transition-all duration-500 overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100"
        :class="{
          'max-w-2xl': currentStep === 'signup',
          'max-w-md':
            currentStep === 'signin' || currentStep === 'company-details',
          'max-w-lg':
            currentStep === 'profile-type' || currentStep === 'complete',
        }"
      >
        <div class="p-6 md:p-8">
          <!-- ========== STEP: SIGNIN / SIGNUP ========== -->
          <template v-if="currentStep === 'signin' || currentStep === 'signup'">
            <div class="flex justify-between items-start mb-6 md:mb-8">
              <div class="pr-8">
                <h2 class="text-3xl font-black text-slate-900 tracking-tight">
                  {{
                    currentStep === "signin" ? "Welcome Back" : "Create Account"
                  }}
                </h2>
                <p class="text-slate-500 mt-1 text-sm leading-relaxed">
                  {{
                    currentStep === "signin"
                      ? "Advertising dashboard for Ethiopian markets"
                      : "Join the 500+ businesses scaling with teleboost"
                  }}
                </p>
              </div>
              <button
                @click="resetAndClose"
                class="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-all hover:rotate-90"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <!-- Left Side: Social & Logic -->
              <div
                :class="[
                  currentStep === 'signup' ? 'lg:col-span-5' : 'lg:col-span-12',
                ]"
              >
                <!-- Google Auth -->
                <button
                  @click="handleGoogleSignIn"
                  :disabled="isLoading"
                  class="w-full h-12 flex items-center justify-center gap-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold text-slate-700 mb-6 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    class="w-5 h-5 group-hover:scale-110 transition-transform"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span
                    v-if="isLoading"
                    class="size-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"
                  ></span>
                  <span v-else>Continue with Google</span>
                </button>

                <div class="relative flex items-center mb-6">
                  <div class="flex-grow border-t border-slate-100"></div>
                  <span
                    class="px-4 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]"
                    >Or Email</span
                  >
                  <div class="flex-grow border-t border-slate-100"></div>
                </div>

                <div
                  class="bg-slate-50 rounded-2xl p-5 border border-slate-100 hidden lg:block"
                  v-if="currentStep === 'signup'"
                >
                  <h4
                    class="text-xs font-black text-slate-700 uppercase tracking-widest mb-3"
                  >
                    Strong Passwords
                  </h4>
                  <div class="grid grid-cols-1 gap-2.5">
                    <div
                      v-for="req in passwordRequirements"
                      :key="req.label"
                      class="flex items-center gap-2.5 text-[11px] transition-all duration-300"
                      :class="
                        req.met
                          ? 'text-emerald-600 font-bold translate-x-1'
                          : 'text-slate-400'
                      "
                    >
                      <span
                        class="material-symbols-outlined text-[16px] leading-none"
                      >
                        {{ req.met ? "check_circle" : "pending" }}
                      </span>
                      {{ req.label }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Side: Form Inputs -->
              <div
                :class="[
                  currentStep === 'signup' ? 'lg:col-span-7' : 'lg:col-span-12',
                ]"
              >
                <form @submit.prevent="handleAuth" class="space-y-4">
                  <div
                    v-if="currentStep === 'signup'"
                    class="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <div>
                      <label
                        class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1"
                        >Full Name</label
                      >
                      <input
                        v-model="form.fullName"
                        type="text"
                        @input="validateField('fullName')"
                        class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-slate-300 bg-slate-50/30"
                        placeholder="John doe"
                      />
                      <p
                        v-if="errors.fullName"
                        class="text-rose-500 text-[10px] mt-1 font-bold uppercase tracking-tight"
                      >
                        {{ errors.fullName }}
                      </p>
                    </div>
                    <div>
                      <label
                        class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1"
                        >Email</label
                      >
                      <input
                        v-model="form.email"
                        type="email"
                        @input="validateField('email')"
                        class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-slate-300 bg-slate-50/30"
                        placeholder="business@example.et"
                      />
                      <p
                        v-if="errors.email"
                        class="text-rose-500 text-[10px] mt-1 font-bold uppercase tracking-tight"
                      >
                        {{ errors.email }}
                      </p>
                    </div>
                  </div>

                  <div v-else>
                    <label
                      class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1"
                      >Email</label
                    >
                    <input
                      v-model="form.email"
                      type="email"
                      @input="validateField('email')"
                      class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-slate-300 bg-slate-50/30"
                      placeholder="business@example.et"
                    />
                    <p
                      v-if="errors.email"
                      class="text-rose-500 text-[10px] mt-1 font-bold uppercase tracking-tight"
                    >
                      {{ errors.email }}
                    </p>
                  </div>

                  <div
                    :class="[
                      currentStep === 'signup'
                        ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
                        : '',
                    ]"
                  >
                    <div>
                      <label
                        class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1"
                        >Password</label
                      >
                      <div class="relative">
                        <input
                          v-model="form.password"
                          :type="showPassword ? 'text' : 'password'"
                          @input="validateField('password')"
                          class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-slate-300 bg-slate-50/30"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          @click="showPassword = !showPassword"
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <span class="material-symbols-outlined text-[20px]">{{
                            showPassword ? "visibility_off" : "visibility"
                          }}</span>
                        </button>
                      </div>
                    </div>
                    <div v-if="currentStep === 'signup'">
                      <label
                        class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1"
                        >Confirm</label
                      >
                      <input
                        v-model="form.confirmPassword"
                        type="password"
                        @input="validateField('confirmPassword')"
                        class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-slate-300 bg-slate-50/30"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <!-- Mobile only checklist -->
                  <div
                    v-if="currentStep === 'signup' && form.password.length > 0"
                    class="lg:hidden mt-3 grid grid-cols-1 gap-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner"
                  >
                    <div
                      v-for="req in passwordRequirements"
                      :key="req.label"
                      class="flex items-center gap-2.5 text-[11px] transition-all duration-300"
                      :class="
                        req.met
                          ? 'text-emerald-600 font-bold'
                          : 'text-slate-400'
                      "
                    >
                      <span
                        class="material-symbols-outlined text-[16px] leading-none"
                      >
                        {{ req.met ? "check_circle" : "pending" }}
                      </span>
                      {{ req.label }}
                    </div>
                  </div>

                  <p
                    v-if="errors.password || errors.confirmPassword"
                    class="text-rose-500 text-[10px] mt-1 font-bold uppercase tracking-tight"
                  >
                    {{ errors.password || errors.confirmPassword }}
                  </p>

                  <button
                    type="submit"
                    :disabled="isLoading"
                    class="w-full h-12 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 group mt-2"
                  >
                    <span
                      v-if="isLoading"
                      class="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    ></span>
                    <span v-else>{{
                      currentStep === "signin" ? "Sign In" : "Continue"
                    }}</span>
                    <span
                      v-if="!isLoading"
                      class="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform"
                      >arrow_forward</span
                    >
                  </button>
                </form>

                <p class="text-center mt-6 text-sm text-slate-500">
                  {{
                    currentStep === "signin"
                      ? "Don't have an account?"
                      : "Already have an account?"
                  }}
                  <button
                    @click="toggleMode"
                    class="text-primary font-bold hover:underline ml-1"
                  >
                    {{ currentStep === "signin" ? "Sign up" : "Sign in" }}
                  </button>
                </p>
              </div>
            </div>
          </template>

          <!-- ========== STEP: PROFILE TYPE SELECTION ========== -->
          <template v-else-if="currentStep === 'profile-type'">
            <div class="flex justify-between items-start mb-6">
              <button
                @click="goBack"
                class="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-all flex items-center gap-1 text-sm"
              >
                <span class="material-symbols-outlined text-[18px]"
                  >arrow_back</span
                >
                Back
              </button>
              <button
                @click="resetAndClose"
                class="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-all hover:rotate-90"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="text-center mb-8">
              <div
                class="inline-flex items-center justify-center size-16 bg-emerald-50 rounded-2xl mb-4"
              >
                <span class="material-symbols-outlined text-3xl text-primary"
                  >account_circle</span
                >
              </div>
              <h2 class="text-2xl font-black text-slate-900 tracking-tight">
                Choose Your Profile
              </h2>
              <p class="text-slate-500 mt-2 text-sm">
                How will you be using teleboost?
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Individual Option -->
              <button
                @click="selectAdvertiserType('INDIVIDUAL')"
                class="group p-6 rounded-2xl border-2 border-slate-200 hover:border-primary hover:bg-emerald-50/30 transition-all text-left"
              >
                <div
                  class="size-12 bg-slate-100 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center mb-4 transition-colors"
                >
                  <span
                    class="material-symbols-outlined text-2xl text-slate-600 group-hover:text-primary transition-colors"
                    >person</span
                  >
                </div>
                <h3 class="font-bold text-slate-900 text-lg mb-1">
                  Individual
                </h3>
                <p class="text-slate-500 text-sm leading-relaxed">
                  For freelancers, creators, and personal brands running their
                  own campaigns.
                </p>
              </button>

              <!-- Enterprise Option -->
              <button
                @click="selectAdvertiserType('ENTERPRISE')"
                class="group p-6 rounded-2xl border-2 border-slate-200 hover:border-primary hover:bg-emerald-50/30 transition-all text-left"
              >
                <div
                  class="size-12 bg-slate-100 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center mb-4 transition-colors"
                >
                  <span
                    class="material-symbols-outlined text-2xl text-slate-600 group-hover:text-primary transition-colors"
                    >domain</span
                  >
                </div>
                <h3 class="font-bold text-slate-900 text-lg mb-1">
                  Enterprise
                </h3>
                <p class="text-slate-500 text-sm leading-relaxed">
                  For businesses and agencies managing multiple campaigns at
                  scale.
                </p>
              </button>
            </div>
          </template>

          <!-- ========== STEP: COMPANY DETAILS (Enterprise Only) ========== -->
          <template v-else-if="currentStep === 'company-details'">
            <div class="flex justify-between items-start mb-6">
              <button
                @click="goBack"
                class="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-all flex items-center gap-1 text-sm"
              >
                <span class="material-symbols-outlined text-[18px]"
                  >arrow_back</span
                >
                Back
              </button>
              <button
                @click="resetAndClose"
                class="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-all hover:rotate-90"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="mb-6">
              <div
                class="inline-flex items-center justify-center size-14 bg-emerald-50 rounded-2xl mb-4"
              >
                <span class="material-symbols-outlined text-2xl text-primary"
                  >domain</span
                >
              </div>
              <h2 class="text-2xl font-black text-slate-900 tracking-tight">
                Company Details
              </h2>
              <p class="text-slate-500 mt-1 text-sm">
                Tell us about your business
              </p>
            </div>

            <form @submit.prevent="handleCompanySubmit" class="space-y-4">
              <div>
                <label
                  class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1"
                >
                  Company Name <span class="text-rose-500">*</span>
                </label>
                <input
                  v-model="companyForm.companyName"
                  type="text"
                  @input="validateField('companyName')"
                  class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-slate-300 bg-slate-50/30"
                  placeholder="Your Company Ltd."
                />
                <p
                  v-if="errors.companyName"
                  class="text-rose-500 text-[10px] mt-1 font-bold uppercase tracking-tight"
                >
                  {{ errors.companyName }}
                </p>
              </div>

              <div>
                <label
                  class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1"
                >
                  Registration Number
                  <span
                    class="text-slate-400 font-medium normal-case tracking-normal"
                    >(Optional)</span
                  >
                </label>
                <input
                  v-model="companyForm.registrationNumber"
                  type="text"
                  class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-slate-300 bg-slate-50/30"
                  placeholder="ETH-123456"
                />
              </div>

              <div>
                <label
                  class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1"
                >
                  Website
                  <span
                    class="text-slate-400 font-medium normal-case tracking-normal"
                    >(Optional)</span
                  >
                </label>
                <input
                  v-model="companyForm.website"
                  type="url"
                  class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-slate-300 bg-slate-50/30"
                  placeholder="https://example.com"
                />
              </div>

              <button
                type="submit"
                :disabled="isLoading"
                class="w-full h-12 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 group mt-4"
              >
                <span
                  v-if="isLoading"
                  class="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></span>
                <span v-else>Complete Setup</span>
                <span
                  v-if="!isLoading"
                  class="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform"
                  >check</span
                >
              </button>
            </form>
          </template>

          <!-- ========== STEP: COMPLETE ========== -->
          <template v-else-if="currentStep === 'complete'">
            <div class="text-center py-8">
              <div
                class="inline-flex items-center justify-center size-20 bg-emerald-100 rounded-full mb-6 animate-bounce"
              >
                <span class="material-symbols-outlined text-4xl text-primary"
                  >celebration</span
                >
              </div>
              <h2
                class="text-2xl font-black text-slate-900 tracking-tight mb-2"
              >
                You're All Set!
              </h2>
              <p class="text-slate-500 text-sm max-w-sm mx-auto">
                Your
                {{
                  selectedAdvertiserType === "ENTERPRISE"
                    ? "enterprise"
                    : "individual"
                }}
                advertiser account is ready. Redirecting you to your
                dashboard...
              </p>
              <div class="mt-6 flex justify-center">
                <div class="h-1 w-32 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-primary rounded-full animate-pulse"
                    style="width: 100%"
                  ></div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.7, 0, 0.84, 0);
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
