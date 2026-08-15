/* ==========================================================
   VIA FAMILIA — Skrypt z Animacją Rozwijania Kafelków (Scroll Reveal)
   ========================================================== */

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/moealbpq';

// ==========================================================
// 1. THREE.JS: Zoptymalizowane Tło 3D
// ==========================================================
const initThreeJSBackground = () => {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 45;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const particleCount = 320;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorPalette = [
    new THREE.Color(1.0, 0.0, 0.5),   // Neon Pink
    new THREE.Color(0.61, 0.3, 0.86), // Neon Purple
    new THREE.Color(0.0, 0.96, 1.0)   // Neon Cyan
  ];

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 90;
    positions[i + 1] = (Math.random() - 0.5) * 90;
    positions[i + 2] = (Math.random() - 0.5) * 90;

    const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i] = chosenColor.r;
    colors[i + 1] = chosenColor.g;
    colors[i + 2] = chosenColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  const animate = () => {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.001;
    particles.rotation.x += 0.0005;
    renderer.render(scene, camera);
  };
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};

initThreeJSBackground();

// ==========================================================
// 2. INTERSECTION OBSERVER: Płynne Rozwijanie Kafelków po Kolei
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.feature-card');

  const cardObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = Array.from(cards).indexOf(entry.target);
        // Kaskadowe opóźnienie dla każdego kolejnego kafelka
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, index * 180);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  cards.forEach(card => cardObserver.observe(card));
});

// ==========================================================
// 3. MULTI-STEP FORM (REKRUTACJA)
// ==========================================================
let currentStep = 1;

const updateStepUI = (step) => {
  document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
  const currentStepElement = document.getElementById(`step-${step}`);
  if (currentStepElement) currentStepElement.classList.add('active');

  document.querySelectorAll('.step-indicator').forEach(ind => {
    const s = parseInt(ind.getAttribute('data-step'));
    ind.classList.remove('active', 'completed');
    if (s === step) ind.classList.add('active');
    else if (s < step) ind.classList.add('completed');
  });
};

const nextStep = (step) => {
  if (step === 1) {
    const ig = document.getElementById('igHandle').value.trim();
    const age = document.getElementById('age').value.trim();
    let valid = true;

    if (!ig) {
      document.getElementById('err-ig').style.display = 'block';
      valid = false;
    } else {
      document.getElementById('err-ig').style.display = 'none';
    }

    if (!age || isNaN(age) || parseInt(age) < 15 || parseInt(age) > 99) {
      document.getElementById('err-age').style.display = 'block';
      valid = false;
    } else {
      document.getElementById('err-age').style.display = 'none';
    }

    if (!valid) return;
  }

  if (step === 2) {
    const reason = document.getElementById('reason').value.trim();
    if (!reason) {
      document.getElementById('err-reason').style.display = 'block';
      return;
    } else {
      document.getElementById('err-reason').style.display = 'none';
    }
  }

  currentStep = step + 1;
  updateStepUI(currentStep);
};

const prevStep = (step) => {
  currentStep = step - 1;
  updateStepUI(currentStep);
};

// ==========================================================
// 4. KONFETTI & WYSYŁKA FORMSPREE
// ==========================================================
const triggerNeonConfetti = () => {
  if (typeof confetti !== 'function') return;
  
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#ff007f', '#9d4edd', '#00f5ff', '#ffffff']
  });
};

const submitApplication = async () => {
  const rules = document.getElementById('rulesAccept').checked;
  if (!rules) {
    document.getElementById('err-rules').style.display = 'block';
    return;
  } else {
    document.getElementById('err-rules').style.display = 'none';
  }

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerText = 'Wysyłanie... ⏳';

  const formData = {
    instagram: '@' + document.getElementById('igHandle').value.replace('@', '').trim(),
    wiek: document.getElementById('age').value.trim(),
    motywacja: document.getElementById('reason').value.trim(),
    akceptacja_regulaminu: 'TAK'
  };

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      currentStep = 4;
      updateStepUI(currentStep);
      triggerNeonConfetti();
    } else {
      alert('Wystąpił problem z wysłaniem. Spróbuj ponownie.');
    }
  } catch (error) {
    console.error('Błąd Formspree:', error);
    currentStep = 4;
    updateStepUI(currentStep);
    triggerNeonConfetti();
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = 'Wyślij Zgłoszenie 🚀';
  }
};

const resetFormState = () => {
  document.getElementById('recruitmentForm').reset();
  currentStep = 1;
  updateStepUI(1);
};

// ==========================================================
// 5. BANER COOKIES
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
  const isAccepted = localStorage.getItem('via_cookies_accepted');
  if (!isAccepted) {
    const cookieBanner = document.getElementById('cookieBanner');
    if (cookieBanner) cookieBanner.style.display = 'flex';
  }
});

const acceptCookies = () => {
  localStorage.setItem('via_cookies_accepted', 'true');
  const cookieBanner = document.getElementById('cookieBanner');
  if (cookieBanner) cookieBanner.style.display = 'none';
};
