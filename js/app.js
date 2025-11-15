// VISHWAKARMA AI - Main JavaScript Application
// Fill with your project values when deploying:
const SUPABASE_URL = '<REPLACE_WITH_SUPABASE_URL>';
const SUPABASE_ANON_KEY = '<REPLACE_WITH_SUPABASE_ANON_KEY>';

// Initialize Supabase client
let supabase = null;

// Wait for DOM and Supabase library to load
function initSupabase() {
  if (SUPABASE_URL !== '<REPLACE_WITH_SUPABASE_URL>' && SUPABASE_ANON_KEY !== '<REPLACE_WITH_SUPABASE_ANON_KEY>') {
    // Check if Supabase is loaded (from CDN)
    // The @supabase/supabase-js UMD build exposes it as window.supabase
    try {
      if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } else {
        // Try again after a short delay in case script is still loading
        setTimeout(() => {
          if (typeof window.supabase !== 'undefined') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
          } else {
            console.warn('Supabase JS library not loaded. Make sure to include the script tag in HTML.');
          }
        }, 100);
      }
    } catch (err) {
      console.error('Error initializing Supabase:', err);
    }
  }
}

// Toast System
const Toast = {
  container: null,
  
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  
  show(title, description, duration = 5000) {
    this.init();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div>
        <div class="toast-title">${title}</div>
        ${description ? `<div class="toast-description">${description}</div>` : ''}
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    this.container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'fade-out 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// Navigation Helper
function navigateTo(path) {
  window.location.href = path;
}

// Set active nav link
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '/' && href === '/index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Supabase Helpers
const SupabaseHelpers = {
  async signInWithEmail(email) {
    if (!supabase) {
      Toast.show('Error', 'Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in js/app.js');
      return { error: 'Supabase not configured' };
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: window.location.origin + '/login.html'
        }
      });
      
      if (error) {
        Toast.show('Error', error.message);
        return { error };
      }
      
      Toast.show('Success', 'Magic link sent! Check your email.');
      return { data };
    } catch (err) {
      Toast.show('Error', 'Failed to send magic link. Please try again.');
      console.error('Sign in error:', err);
      return { error: err };
    }
  },
  
  async uploadPlanFile(file, userId) {
    if (!supabase) {
      Toast.show('Error', 'Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in js/app.js');
      return { error: 'Supabase not configured' };
    }
    
    // Check file size (8MB limit)
    const maxSize = 8 * 1024 * 1024; // 8MB
    if (file.size > maxSize) {
      Toast.show('Error', 'File size exceeds 8MB limit. Please upload a smaller file.');
      return { error: 'File too large' };
    }
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        if (error.statusCode === '401' || error.statusCode === '403') {
          Toast.show('Error', 'Authentication failed. Please check your Supabase keys.');
        } else {
          Toast.show('Error', error.message);
        }
        return { error };
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);
      
      Toast.show('Success', 'File uploaded successfully!');
      return { data, publicUrl: urlData.publicUrl, path: fileName };
    } catch (err) {
      Toast.show('Error', 'Failed to upload file. Please try again.');
      console.error('Upload error:', err);
      return { error: err };
    }
  },
  
  async createJobRecord(userId, input_path) {
    if (!supabase) {
      Toast.show('Error', 'Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in js/app.js');
      return { error: 'Supabase not configured' };
    }
    
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          user_id: userId,
          input_path: input_path,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          Toast.show('Error', 'Table "jobs" does not exist. Please create it in your Supabase database.');
        } else {
          Toast.show('Error', error.message);
        }
        return { error };
      }
      
      Toast.show('Success', 'Job created successfully!');
      return { data, job_id: data.id };
    } catch (err) {
      Toast.show('Error', 'Failed to create job record. Please try again.');
      console.error('Create job error:', err);
      return { error: err };
    }
  },
  
  async getCurrentUser() {
    if (!supabase) {
      return null;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (err) {
      console.error('Get user error:', err);
      return null;
    }
  }
};

// File Upload Handler (utility function, can be used elsewhere)
function handleFileUpload(inputElement, onSuccess) {
  const file = inputElement.files?.[0];
  if (!file) return;
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    Toast.show('Error', 'Invalid file type. Please upload JPG, PNG, or PDF files.');
    return;
  }
  
  // Get user ID (or use a placeholder for demo)
  SupabaseHelpers.getCurrentUser().then(user => {
    const userId = user?.id || 'demo-user';
    
    SupabaseHelpers.uploadPlanFile(file, userId).then(result => {
      if (!result.error && onSuccess) {
        onSuccess(result);
      }
    });
  });
}

// Converter Page Logic
function initConverter() {
  const fileInput = document.getElementById('file-upload');
  const uploadContainer = document.getElementById('upload-container');
  const uploadArea = document.querySelector('.file-upload-area');
  const processingArea = document.querySelector('.processing');
  const fileDisplay = document.querySelector('.file-display');
  
  if (!fileInput) return;
  
  // Handle file input change
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      Toast.show('Error', 'Invalid file type. Please upload JPG, PNG, or PDF files.');
      return;
    }
    
    // Show processing state
    if (uploadContainer) uploadContainer.style.display = 'none';
    if (processingArea) processingArea.style.display = 'flex';
    if (fileDisplay) fileDisplay.style.display = 'none';
    
    // Simulate processing
    setTimeout(() => {
      if (processingArea) processingArea.style.display = 'none';
      if (fileDisplay) fileDisplay.style.display = 'block';
      
      Toast.show('3D Model Generated!', 'Your 2D plan has been converted successfully.');
      
      // Upload to Supabase
      SupabaseHelpers.getCurrentUser().then(user => {
        const userId = user?.id || 'demo-user';
        SupabaseHelpers.uploadPlanFile(file, userId).then(result => {
          if (!result.error && result.path) {
            console.log('File uploaded:', result);
            // Create job record
            SupabaseHelpers.createJobRecord(userId, result.path);
          }
        });
      });
    }, 2000);
  });
  
  // Drag and drop
  if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'hsl(var(--purple-medium))';
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = 'hsl(var(--purple-light) / 0.5)';
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'hsl(var(--purple-light) / 0.5)';
      
      const file = e.dataTransfer.files[0];
      if (file) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event('change'));
      }
    });
  }
}

// Vastu AI Page Logic
function initVastuAI() {
  const analyzeBtn = document.getElementById('analyze-btn');
  const uploadArea = document.querySelector('.vastu-upload-area');
  const resultsArea = document.querySelector('.vastu-results');
  
  if (!analyzeBtn) return;
  
  analyzeBtn.addEventListener('click', () => {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
    
    setTimeout(() => {
      if (uploadArea) uploadArea.style.display = 'none';
      if (resultsArea) resultsArea.style.display = 'block';
      
      Toast.show('Vastu Analysis Complete!', 'Your design has been analyzed for Vastu compliance.');
      
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = 'Start Vastu Analysis';
    }, 2000);
  });
}

// Login Page Logic
function initLogin() {
  const loginForm = document.getElementById('login-form');
  
  if (!loginForm) return;
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const emailInput = document.getElementById('email');
    const email = emailInput?.value;
    
    if (!email) {
      Toast.show('Error', 'Please enter your email address.');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show('Error', 'Please enter a valid email address.');
      return;
    }
    
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }
    
    const result = await SupabaseHelpers.signInWithEmail(email);
    
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Supabase
  initSupabase();
  
  // Set active nav link
  setActiveNavLink();
  
  // Initialize page-specific logic based on current page
  const currentPath = window.location.pathname;
  
  if (currentPath.includes('converter.html') || currentPath.includes('converter')) {
    initConverter();
  } else if (currentPath.includes('vastu.html') || currentPath.includes('vastu')) {
    initVastuAI();
  } else if (currentPath.includes('login.html') || currentPath.includes('login')) {
    initLogin();
  }
  
  // Initialize toast system
  Toast.init();
});

// Export for use in HTML
window.navigateTo = navigateTo;
window.SupabaseHelpers = SupabaseHelpers;
window.Toast = Toast;
window.handleFileUpload = handleFileUpload;

