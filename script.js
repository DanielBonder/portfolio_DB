
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

const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
  link.addEventListener('click', function () {
    navLinks.forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});