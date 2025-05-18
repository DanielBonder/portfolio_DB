
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const inputs = {
    fullName: form.querySelector('input[placeholder="Full Name"]'),
    email: form.querySelector('input[placeholder="Email"]'),
    phone: form.querySelector('input[placeholder="Phone Number"]'),
    subject: form.querySelector('input[placeholder="Subject"]'),
    message: form.querySelector('textarea[placeholder="Your Message"]')
  };

  form.addEventListener("submit", handleFormSubmit);

  // פונקציה לטיפול בשליחת הטופס
  function handleFormSubmit(e) {
    e.preventDefault(); // מניעת שליחה רגילה של הטופס

    const errors = validateForm(inputs);

    if (errors.length > 0) {
      displayErrors(errors); // הצגת שגיאות אם יש
    } else {
      sendFormData(new FormData(form)); // שליחת הנתונים לשרת
    }
  }

  // פונקציה לבדיקה של כל שדות הטופס
  function validateForm(inputs) {
    const errors = [];

    if (inputs.fullName.value.trim() === "") {
      errors.push("Please enter your full name.");
    }

    if (!validateEmail(inputs.email.value)) {
      errors.push("Please enter a valid email address.");
    }

    if (!validatePhone(inputs.phone.value)) {
      errors.push("Please enter a valid phone number.");
    }

    if (inputs.subject.value.trim() === "") {
      errors.push("Please enter a subject.");
    }

    if (inputs.message.value.trim() === "") {
      errors.push("Please enter your message.");
    }

    return errors;
  }

  // שליחת הטופס לשרת באמצעות Fetch API
  function sendFormData(formData) {
    fetch("contact.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send data.");
        }
        return response.text();
      })
      .then((data) => {
        displaySuccess(); // הודעת הצלחה
        form.reset(); // איפוס הטופס
        console.log("Server response:", data); // פלט מהשרת
      })
      .catch((error) => {
        alert("An error occurred: " + error.message);
      });
  }

  // הצגת שגיאות
  function displayErrors(errors) {
    alert(errors.join("\n"));
  }

  // הודעת הצלחה
  function displaySuccess() {
    alert("Thank you! Your message has been sent.");
  }

  // פונקציית בדיקת תקינות אימייל
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // פונקציית בדיקת תקינות טלפון
  function validatePhone(phone) {
    const phoneRegex = /^\d{10}$/; // דורש מספר טלפון בן 10 ספרות
    return phoneRegex.test(phone);
  }
});

// ----- שלושה.js ומודל תלת מימדי -----
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

function create3DModel({
  containerId,
  modelPath,
  scale = 1,
  position = [0, 0, 0],
  cameraSettings = { fov: 40, near: 0.1, far: 1000, position: [0, 2, 10] },
  lightSettings = []
}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    cameraSettings.fov,
    1,
    cameraSettings.near,
    cameraSettings.far
  );
  camera.position.set(...cameraSettings.position);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(350, 350);

  // הוספת תאורה לסצנה על בסיס הגדרות מותאמות אישית
  lightSettings.forEach((lightConfig) => {
    let light;

    switch (lightConfig.type) {
      case 'ambient':
        light = new THREE.AmbientLight(lightConfig.color, lightConfig.intensity);
        break;
      case 'directional':
        light = new THREE.DirectionalLight(lightConfig.color, lightConfig.intensity);
        light.position.set(...lightConfig.position);
        break;
      case 'point':
        light = new THREE.PointLight(lightConfig.color, lightConfig.intensity, lightConfig.distance);
        light.position.set(...lightConfig.position);
        break;
      case 'spot':
        light = new THREE.SpotLight(lightConfig.color, lightConfig.intensity, lightConfig.distance, lightConfig.angle);
        light.position.set(...lightConfig.position);
        light.target.position.set(...lightConfig.target);
        scene.add(light.target);
        break;
      case 'hemisphere':
        light = new THREE.HemisphereLight(lightConfig.skyColor, lightConfig.groundColor, lightConfig.intensity);
        break;
      default:
        console.warn('Unknown light type:', lightConfig.type);
    }

    if (light) {
      scene.add(light);
    }
  });

  const loader = new GLTFLoader();
let modelGroup = new THREE.Group();
scene.add(modelGroup);  // הוספת הקבוצה לסצנה

loader.load(modelPath, (gltf) => {
  const model = gltf.scene;
  model.scale.set(scale, scale, scale);
  model.position.set(0, 0, 0);  // מיקום המודל במרכז הקבוצה
  modelGroup.position.set(...position);  // מיקום הקבוצה כולה
  modelGroup.add(model);  // הוספת המודל לקבוצה
  animate();
}, undefined, (error) => {
  console.error(`❌ Error loading model from ${modelPath}:`, error);
});


  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.rotateSpeed = 1;
  controls.minPolarAngle = Math.PI / 2.5;
  controls.maxPolarAngle = Math.PI / 2;

  window.addEventListener('load', () => {
    const container = document.getElementById(containerId);
    container.appendChild(renderer.domElement);
    renderer.setSize(container.clientWidth, 350);
    camera.aspect = container.clientWidth / 350;
    camera.updateProjectionMatrix();
  });

  window.addEventListener('resize', () => {
    const container = document.getElementById(containerId);
    renderer.setSize(container.clientWidth, 350);
    camera.aspect = container.clientWidth / 350;
    camera.updateProjectionMatrix();
  });
  function animate() {
    requestAnimationFrame(animate);
    modelGroup.rotation.y += 0.002;  // סיבוב של הקבוצה כולה
    controls.update();
    renderer.render(scene, camera);
  }
  
}
// מודל 1 - Python
create3DModel({
  containerId: 'model-web',
  modelPath: '/models/python/scene.gltf',
  scale: 0.08,
  position: [0, 3.5, 0],
  cameraSettings: {
    fov: 40,
    near: 0.1,
    far: 1000,
    position: [0, 6, 16]
  },
  lightSettings: [
    {
      type: 'ambient',
      color: 0xffffff,
      intensity: 3
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 1.5,
      position: [30, 50, 30]
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 1.2,
      position: [-30, 50, -30]
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 1,
      position: [30, -50, 30]
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 0.8,
      position: [-30, -50, -30]
    },
    {
      type: 'hemisphere',
      skyColor: 0xffffff,
      groundColor: 0x404040,
      intensity: 50
    }
  ]
});

// מודל 2 - HTML/CSS/JS
create3DModel({
  containerId: 'model-web-2',
  modelPath: '/models/html.css.js/scene.gltf',
  scale: 0.7,
  position: [0, 2.3, 0],
  cameraSettings: {
    fov: 35,
    near: 0.5,
    far: 1500,
    position: [0, 15, 15]
  },
  lightSettings: [
    {
      type: 'ambient',
      color: 0xffffff,
      intensity: 0.4
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 1.5,
      position: [30, 50, 30]
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 1.2,
      position: [-30, 50, -30]
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 1,
      position: [30, -50, 30]
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 0.8,
      position: [-30, -50, -30]
    }
  ]
});

// מודל 3 - Data Analysis
create3DModel({
  containerId: 'model-web-3',
  modelPath: '/models/data_analysis/scene.gltf',
  scale: 80,
  position: [0, 8, 0],
  cameraSettings: {
    fov: 60,
    near: 0.6,
    far: 5000,
    position: [60, 5, 15]
  },
  lightSettings: [
    {
      type: 'ambient',
      color: 0xffffff,
      intensity: 0.6
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 1.5,
      position: [30, 50, 30]
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 1.2,
      position: [-30, 50, -30]
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 1,
      position: [30, -50, 30]
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 0.8,
      position: [-30, -50, -30]
    },
    {
      type: 'hemisphere',
      skyColor: 0x87ceeb,
      groundColor: 0x404040,
      intensity: 1.2
    }
  ]
});

// מודל 4 - Economy
create3DModel({
  containerId: 'model-web-4',
  modelPath: '/models/economy/scene.gltf',
  scale: 100,
  position: [0, 2.3, 0],
  cameraSettings: {
    fov: 30,
    near: 0.5,
    far: 2500,
    position: [0, 5, 24]
  },
  lightSettings: [
    {
      type: 'ambient',
      color: 0xffffff,
      intensity: 0.4
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 1.5,
      position: [30, 50, 30]
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 1.2,
      position: [-30, 50, -30]
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 1,
      position: [30, -50, 30]
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 0.8,
      position: [-30, -50, -30]
    },
    {
      type: 'hemisphere',
      skyColor: 0xffffff,
      groundColor: 0x555555,
      intensity: 10
    }
  ]
});


create3DModel({
  containerId: 'model-web-5',
  modelPath: '/models/daniel/base_basic_shaded.gltf',
  scale: 1500 ,  // מספיק גדול אבל לא מוגזם
position: [100, -1300    , 50] ,   // הורדה עמוקה יותר של כל המודל
  
  cameraSettings: {
    fov: 45,
    near: 10,
    far: 10000,
    position: [1000, 4000 , 900]  // יותר גובה ויותר מרחק
  }
  
  ,
  lightSettings: [
    {
      type: 'ambient',
      color: 0xffffff,
      intensity: 3
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 1.5,
      position:  [30, 50, 30]
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 1.2,
      position: [-30, 50, -30]
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 1,
      position: [30, -50, 30]
    },
    {
      type: 'directional',
      color: 0xffffff,
      intensity: 0.8,
      position: [-30, -50, -30]
    },
    {
      type: 'hemisphere',
      skyColor: 0xffffff,
      groundColor: 0x404040,
      intensity: 50
    }
  ]
});



import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function highlightTitle() {
  const title = document.getElementById('title');
  title.classList.add('active');
  setTimeout(() => {
    title.classList.remove('active');
  }, 1000);
}
// אפקט פתיחה
window.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll(".custom-nav-link");

  // לוגו
  gsap.from("#logo", {
    duration: 1,
    opacity: 0,
    y: -20,
    ease: "power3.out"
  });

  // קישורי ניווט
  gsap.to(navLinks, {
    duration: 1,
    opacity: 1,
    y: 0,
    delay: 0.3,
    stagger: 0.1,
    ease: "power2.out",
    onStart: () => {
      navLinks.forEach(link => link.classList.add("animated"));
    }
  });

  initNavLinkEffects();
});

// אפקט hover + ניהול active עם תלת־ממד
function initNavLinkEffects() {
  const navLinks = document.querySelectorAll(".custom-nav-link");

  navLinks.forEach(link => {
    const underline = link.querySelector(".underline");

    // אפקט hover (רק אם לא active)
    link.addEventListener("mouseenter", () => {
      if (!link.classList.contains("active")) {
        navLinks.forEach(otherLink => {
          if (otherLink !== link && !otherLink.classList.contains("active")) {
            const otherUnderline = otherLink.querySelector(".underline");
            gsap.killTweensOf(otherUnderline);
            gsap.set(otherUnderline, { width: "0%" });
          }
        });

        gsap.to(underline, {
          width: "100%",
          duration: 0.4,
          ease: "power2.out"
        });
      }
    });

    link.addEventListener("mouseleave", () => {
      if (!link.classList.contains("active")) {
        gsap.to(underline, {
          width: "0%",
          duration: 0.3,
          ease: "power2.in"
        });
      }
    });

    // לחיצה = אפקט תלת־ממד, צביעה, קו מוסתר
    link.addEventListener("click", () => {
      navLinks.forEach(otherLink => {
        otherLink.classList.remove("active");

        const otherUnderline = otherLink.querySelector(".underline");
        gsap.killTweensOf(otherUnderline);
        gsap.to(otherUnderline, {
          width: "0%",
          scaleY: 1,
          boxShadow: "none",
          duration: 0.2,
          ease: "power2.inOut"
        });

        gsap.to(otherLink, {
          scale: 1,
          duration: 0.2
        });
      });

      link.classList.add("active");

      // קפיצה תלת-ממדית
      gsap.fromTo(link,
        { scale: 1 },
        { scale: 1.05, duration: 0.4, ease: "back.out(2)" }
      );

      // הסתרת קו מכל מצב קודם
      gsap.killTweensOf(underline);
      gsap.set(underline, { width: "0%", scaleY: 0, boxShadow: "none" });
    });
  });
}

// כפתור המבורגר
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navLinks");

hamburger?.addEventListener("click", () => {
  navMenu.classList.toggle("open");
});

// סגירת תפריט בלחיצה על אחד הקישורים (במובייל)
document.querySelectorAll('.custom-nav-link').forEach(link => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 768 && navMenu?.classList.contains("open")) {
      navMenu.classList.remove("open");
    }
  });
});
let scene, camera, renderer, particles, stars;
let active = false;
let hue = 0;

const canvasContainer = document.getElementById('background-canvas');

function initThreeScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#0a0a23', 0.0008); // רקע כהה עם ערפל אלגנטי

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
  camera.position.z = 600;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(scene.fog.color, 0);

  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.zIndex = '0';
  renderer.domElement.style.pointerEvents = 'none';

  canvasContainer.innerHTML = '';
  canvasContainer.appendChild(renderer.domElement);

  // חלקיקים רכים כמו "אבק"
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const colors = [];
  const color = new THREE.Color();

  for (let i = 0; i < 2000; i++) {
    const x = THREE.MathUtils.randFloatSpread(3000);
    const y = THREE.MathUtils.randFloatSpread(3000);
    const z = THREE.MathUtils.randFloatSpread(3000);
    vertices.push(x, y, z);
    color.setHSL(0.65 + Math.random() * 0.1, 0.6, 0.5);
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 4,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // כוכבים עמומים
  const starsGeometry = new THREE.BufferGeometry();
  const starVertices = [];
  for (let i = 0; i < 500; i++) {
    starVertices.push(
      THREE.MathUtils.randFloatSpread(3000),
      THREE.MathUtils.randFloatSpread(3000),
      THREE.MathUtils.randFloatSpread(3000)
    );
  }
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  const starsMaterial = new THREE.PointsMaterial({
    size: 1.5,
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
}

let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX - window.innerWidth / 2);
  mouseY = (e.clientY - window.innerHeight / 2);
});

function animate() {
  if (!active || !renderer) return;
  requestAnimationFrame(animate);

  // שינוי גוון כל הזמן (מאוד עדין)
  hue += 0.0003;
  const h = hue % 1;
  if (particles && particles.material) {
    particles.material.color.setHSL(h, 0.6, 0.55);
  }

  // תנועה עדינה לפי עכבר
  targetX += (mouseX * 0.001 - targetX) * 0.05;
  targetY += (mouseY * 0.001 - targetY) * 0.05;

  scene.rotation.y += 0.002 * (targetX - scene.rotation.y);
  scene.rotation.x += 0.002 * (targetY - scene.rotation.x);

  renderer.render(scene, camera);
}

function enableBackground() {
  if (!active) {
    active = true;
    initThreeScene();
    animate();
  }
}

function disableBackground() {
  if (active) {
    active = false;
    canvasContainer.innerHTML = '';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const homeSection = document.getElementById('home');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        enableBackground();
      } else {
        disableBackground();
      }
    });
  }, { threshold: 0.4 });

  if (homeSection) observer.observe(homeSection);
});

window.addEventListener('resize', () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
});