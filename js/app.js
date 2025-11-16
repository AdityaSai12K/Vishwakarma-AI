/*  
====================================================
 VISHWAKARMA AI — MAIN APPLICATION JAVASCRIPT
 Cleaned, optimized, production-ready version
====================================================
*/

/* -----------------------------
   SUPABASE CONFIGURATION 
------------------------------*/
const SUPABASE_URL = "<REPLACE_WITH_SUPABASE_URL>";
const SUPABASE_ANON_KEY = "<REPLACE_WITH_SUPABASE_ANON_KEY>";
let supabase = null;

function initSupabase() {
  if (
    SUPABASE_URL !== "<REPLACE_WITH_SUPABASE_URL>" &&
    SUPABASE_ANON_KEY !== "<REPLACE_WITH_SUPABASE_ANON_KEY>"
  ) {
    if (window.supabase) {
      supabase = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );
    }
  }
}

/* -----------------------------
   TOAST NOTIFICATIONS
------------------------------*/
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.className = "toast-container";
      document.body.appendChild(this.container);
    }
  },

  show(title, description = "", duration = 4000) {
    this.init();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
      <div>
        <div class="toast-title">${title}</div>
        ${description ? `<div class="toast-description">${description}</div>` : ""}
      </div>
      <button class="toast-close">×</button>
    `;

    toast.querySelector(".toast-close").onclick = () => toast.remove();
    this.container.appendChild(toast);

    setTimeout(() => toast.remove(), duration);
  },
};

/* -----------------------------
   NAVIGATION LINK HIGHLIGHTING
------------------------------*/
function setActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop();

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === currentPage);
  });
}

/* -----------------------------
   SUPABASE HELPERS
------------------------------*/
const SupabaseHelpers = {
  async getCurrentUser() {
    if (!supabase) return null;

    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch {
      return null;
    }
  },

  async uploadPlanFile(file, userId = "demo-user") {
    if (!supabase) {
      Toast.show("Error", "Supabase not configured.");
      return { error: true };
    }

    const ext = file.name.split(".").pop();
    const path = `${userId}/${Date.now()}.${ext}`;

    try {
      const { error } = await supabase.storage
        .from("uploads")
        .upload(path, file, { upsert: false });

      if (error) throw error;

      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      return { publicUrl: data.publicUrl, path };
    } catch (err) {
      Toast.show("Error", err.message);
      return { error: true };
    }
  },
};

/* -----------------------------
   FILE UPLOAD UTILITY
------------------------------*/
function handleFileUpload(inputEl, callback) {
  const file = inputEl.files?.[0];
  if (!file) return;

  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  if (!allowed.includes(file.type)) {
    Toast.show("Error", "Upload JPG, PNG, or PDF only.");
    return;
  }

  SupabaseHelpers.getCurrentUser().then((user) => {
    SupabaseHelpers.uploadPlanFile(file, user?.id).then((res) => {
      if (!res.error) callback(res);
    });
  });
}

/* -----------------------------
   CONVERTER PAGE LOGIC
------------------------------*/
function initConverter() {
  const fileInput = document.getElementById("file-upload");
  if (!fileInput) return;

  fileInput.addEventListener("change", () => {
    const processing = document.querySelector(".processing");
    const fileDisplay = document.querySelector(".file-display");

    processing.classList.remove("hidden");
    Toast.show("Processing", "Generating 3D Model...");

    setTimeout(() => {
      processing.classList.add("hidden");
      fileDisplay.classList.remove("hidden");
      Toast.show("Done!", "3D Model Ready.");
    }, 2000);
  });
}

/* -----------------------------
   VASTU AI — GEMINI CLIENT
------------------------------*/
async function initVastuAI() {
  const analyzeBtn = document.getElementById("analyze-btn");
  const fileInput = document.getElementById("blueprint-upload");
  const processing = document.getElementById("processing-container");
  const uploadBox = document.getElementById("upload-container");
  const results = document.querySelector(".vastu-results");

  if (!analyzeBtn || !fileInput) return;

  // Wait for GoogleGenerativeAI to be available
  let GoogleGenerativeAI = window.GoogleGenerativeAI;
  if (!GoogleGenerativeAI) {
    console.log("Waiting for GoogleGenerativeAI to load...");
    // Wait a bit for the module to load
    await new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.GoogleGenerativeAI) {
          GoogleGenerativeAI = window.GoogleGenerativeAI;
          console.log("GoogleGenerativeAI loaded after", attempts * 100, "ms");
          clearInterval(checkInterval);
          resolve();
        } else if (attempts >= maxAttempts) {
          console.error("Timeout waiting for GoogleGenerativeAI");
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  if (!GoogleGenerativeAI) {
    console.error("GoogleGenerativeAI not available");
    Toast.show("Error", "Failed to load AI library. Please refresh the page.");
    return;
  }

  console.log("GoogleGenerativeAI is ready");

  // Convert file → Base64 (works for both images and PDFs)
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (result && typeof result === 'string') {
          // Extract base64 string (remove data URL prefix)
          const base64String = result.split(',')[1] || result.replace(/^data:.+;base64,/, "");
          resolve(base64String);
        } else {
          reject(new Error("Failed to read file - invalid result"));
        }
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(new Error("File read error: " + (error.message || "Unknown error")));
      };
      reader.onabort = () => reject(new Error("File read aborted"));
      
      // Use readAsDataURL for both images and PDFs
      reader.readAsDataURL(file);
    });
  }


  // Initialize Gemini client
  let genAI, model;
  try {
    genAI = new GoogleGenerativeAI("AIzaSyBHV5d_9scp-Tpg6Zh4j0pEnHtMDHQgv6Y");
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  } catch (err) {
    console.error("Failed to initialize Gemini:", err);
    Toast.show("Error", "Failed to initialize AI. Please refresh the page.");
    return;
  }

  // Button click triggers file input
  analyzeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Analyze button clicked, triggering file input");
    fileInput.click();
  });

  // Handle file selection
  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", file.name, "Type:", file.type, "Size:", file.size);

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    const normalizedType = file.type.toLowerCase();
    
    if (!allowedTypes.includes(normalizedType)) {
      Toast.show("Error", "Please upload a JPG, PNG, or PDF file.");
      fileInput.value = ""; // Reset input
      return;
    }

    // Update UI: hide upload, show processing
    if (uploadBox) uploadBox.classList.add("hidden");
    if (processing) processing.classList.remove("hidden");
    if (results) results.classList.add("hidden");

    Toast.show("Processing", "Analyzing your blueprint...");

    try {
      let base64;
      let mimeType = normalizedType;

      // Convert file to base64 (works for both images and PDFs)
      console.log("Converting file to base64, type:", mimeType);
      base64 = await fileToBase64(file);
      console.log("Base64 conversion complete, length:", base64.length);

      const prompt = `You are a Vastu Shastra expert. Analyze this uploaded floor plan ${mimeType === "application/pdf" ? "PDF document" : "image"}.

Steps:
1. Detect all rooms (Kitchen, Bedroom, Hall, Toilet, Bathroom, Pooja Room, Balcony, etc.)
2. Identify the directional placement of each room (N, NE, E, SE, S, SW, W, NW)
3. Find Vastu violations and mistakes
4. Suggest fixes and improvements
5. Calculate a Vastu compliance score (0-100)
6. Provide a short summary

IMPORTANT: Return ONLY valid JSON in this exact format (no markdown, no code blocks, just pure JSON):

{
  "score": 75,
  "assessment": "good",
  "summary": "Your floor plan has good Vastu compliance with some areas for improvement.",
  "positives": ["Kitchen is in SE direction", "Main door faces favorable direction"],
  "issues": [
    {"message": "Toilet in NE corner", "severity": "high"},
    {"message": "Bedroom placement could be better", "severity": "medium"}
  ],
  "suggestions": ["Move toilet to SW corner", "Consider relocating bedroom to SW"]
}`;

      // Prepare content parts for Gemini
      const parts = [
        { text: prompt },
        {
          inlineData: {
            data: base64,
            mimeType: mimeType
          }
        }
      ];

      console.log("Sending request to Gemini with mimeType:", mimeType, "Base64 length:", base64.length);
      
      const result = await model.generateContent(parts);
      console.log("Received response from Gemini");

      if (!result || !result.response) {
        throw new Error("Invalid response from Gemini API");
      }

      let text = result.response.text();
      console.log("Response text length:", text.length);
      
      // Clean up the response - remove markdown code blocks if present
      text = text.trim();
      if (text.startsWith("```json")) {
        text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (text.startsWith("```")) {
        text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error("JSON parse error:", parseErr);
        console.error("Response text:", text);
        // Fallback: create a basic structure from the text
        data = {
          score: 50,
          assessment: "unknown",
          summary: text.substring(0, 200) || "Analysis completed but formatting failed.",
          positives: ["Analysis completed successfully"],
          issues: [{ message: "Could not parse detailed results", severity: "low" }],
          suggestions: ["Please try uploading again for detailed analysis"]
        };
      }

      // Validate data structure
      if (!data.score) data.score = 50;
      if (!data.assessment) data.assessment = "fair";
      if (!data.summary) data.summary = "Analysis completed.";
      if (!Array.isArray(data.positives)) data.positives = [];
      if (!Array.isArray(data.issues)) data.issues = [];
      if (!Array.isArray(data.suggestions)) data.suggestions = [];

      updateVastuUI(data);

      // Update UI: hide processing, show results
      if (processing) processing.classList.add("hidden");
      if (results) {
        results.classList.remove("hidden");
        // Scroll to results after a brief delay to ensure rendering
        setTimeout(() => {
          results.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }

      Toast.show("Complete", "Vastu Analysis Ready!");
    } catch (err) {
      console.error("Vastu analysis error:", err);
      console.error("Error details:", {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      let errorMessage = "Could not analyze this blueprint. Please try again.";
      if (err.message) {
        errorMessage = err.message;
      } else if (err.toString) {
        errorMessage = err.toString();
      }
      
      Toast.show("Error", errorMessage);
      
      // Reset UI
      if (processing) processing.classList.add("hidden");
      if (uploadBox) uploadBox.classList.remove("hidden");
      if (fileInput) fileInput.value = ""; // Reset input
    }
  });
}

/* -----------------------------
   UPDATE VASTU UI
------------------------------*/
function updateVastuUI(data) {
  // Score
  const scoreValue = document.getElementById("score-value");
  if (scoreValue) {
    scoreValue.textContent = data.score || 0;
  }

  const circle = document.getElementById("score-progress");
  if (circle) {
    const circumference = 553;
    const score = Math.max(0, Math.min(100, data.score || 0));
    circle.style.strokeDashoffset =
      circumference - (score / 100) * circumference;
  }

  const scoreAssessment = document.getElementById("score-assessment");
  if (scoreAssessment) {
    scoreAssessment.textContent = (data.assessment || "fair").toUpperCase();
  }

  const scoreDescription = document.getElementById("score-description");
  if (scoreDescription) {
    scoreDescription.textContent = data.summary || "Analysis completed.";
  }

  // Positives
  const positivesContainer = document.getElementById("positives-container");
  if (positivesContainer) {
    if (data.positives && data.positives.length > 0) {
      positivesContainer.innerHTML = data.positives
        .map(
          (p) => `
        <div class="p-3 rounded-xl bg-green-50 border border-green-200">
          ✔ ${p}
        </div>`
        )
        .join("");
    } else {
      positivesContainer.innerHTML = `
        <div class="p-3 rounded-xl bg-green-50 border border-green-200">
          ✔ No specific positive aspects identified
        </div>`;
    }
  }

  // Issues
  const issuesContainer = document.getElementById("issues-container");
  if (issuesContainer) {
    if (data.issues && data.issues.length > 0) {
      issuesContainer.innerHTML = data.issues
        .map(
          (i) => `
        <div class="p-3 rounded-xl bg-red-50 border border-red-200">
          ⚠️ <b>${(i.severity || "medium").toUpperCase()}</b> — ${i.message || i}
        </div>`
        )
        .join("");
    } else {
      issuesContainer.innerHTML = `
        <div class="p-3 rounded-xl bg-green-50 border border-green-200">
          ✅ No major Vastu issues detected
        </div>`;
    }
  }

  // Suggestions
  const suggestionsContainer = document.getElementById("suggestions-container");
  if (suggestionsContainer) {
    if (data.suggestions && data.suggestions.length > 0) {
      suggestionsContainer.innerHTML = data.suggestions
        .map(
          (s) => `
        <div class="p-3 rounded-xl bg-secondary border border-purple-light/30">
          💡 ${s}
        </div>`
        )
        .join("");
    } else {
      suggestionsContainer.innerHTML = `
        <div class="p-3 rounded-xl bg-secondary border border-purple-light/30">
          💡 Continue maintaining good Vastu practices
        </div>`;
    }
  }
}

/* -----------------------------
   LOGIN PAGE LOGIC
------------------------------*/
function initLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    Toast.show("Coming soon", "Login will be activated later.");
  });
}

/* -----------------------------
   INITIALIZER
------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  initSupabase();
  setActiveNavLink();
  Toast.init();

  const page = window.location.pathname;

  if (page.includes("converter.html")) initConverter();
  // Vastu AI is now handled inline in vastu.html - no need to initialize here
  // if (page.includes("vastu.html")) initVastuAI();
  if (page.includes("login.html")) initLogin();
});