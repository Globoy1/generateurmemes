   // Récupération des éléments
const imageInput = document.getElementById("imageInput");
const topTextInput = document.getElementById("topText");
const bottomTextInput = document.getElementById("bottomText");
const canvas = document.getElementById("memeCanvas");
const ctx = canvas.getContext("2d");
const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");
const resetBtn = document.getElementById("resetBtn");
const galleryContainer = document.getElementById("galleryContainer");

const fontSelect = document.getElementById("fontSelect");
const fontSizeInput = document.getElementById("fontSize");
const textColorInput = document.getElementById("textColor");
const strokeColorInput = document.getElementById("strokeColor");

let image = new Image();

// --- Fonction principale pour dessiner le mème ---
function drawMeme() {
  if (!image.src) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ajuster l'image
  const ratio = Math.min(canvas.width / image.width, canvas.height / image.height);
  const imgWidth = image.width * ratio;
  const imgHeight = image.height * ratio;
  const x = (canvas.width - imgWidth) / 2;
  const y = (canvas.height - imgHeight) / 2;
  ctx.drawImage(image, x, y, imgWidth, imgHeight);

  // Style du texte (choix de police, taille, couleurs, etc.)
  const fontSize = parseInt(fontSizeInput.value);
  ctx.font = `${fontSize}px ${fontSelect.value}`;
  ctx.fillStyle = textColorInput.value;
  ctx.strokeStyle = strokeColorInput.value;
  ctx.textAlign = "center";
  ctx.lineWidth = fontSize / 20;

  // Texte du haut
  ctx.fillText(topTextInput.value, canvas.width / 2, fontSize + 10);
  ctx.strokeText(topTextInput.value, canvas.width / 2, fontSize + 10);

  // Texte du bas
  ctx.fillText(bottomTextInput.value, canvas.width / 2, canvas.height - 20);
  ctx.strokeText(bottomTextInput.value, canvas.width / 2, canvas.height - 20);
}

// --- Importer une image depuis le PC ---
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});

image.onload = drawMeme;

// --- Mise à jour en temps réel ---
[topTextInput, bottomTextInput, fontSelect, fontSizeInput, textColorInput, strokeColorInput]
  .forEach(el => el.addEventListener("input", drawMeme));

// --- Réinitialiser le mème ---
resetBtn.addEventListener("click", () => {
  topTextInput.value = "";
  bottomTextInput.value = "";
  image.src = "";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// --- Télécharger le mème ---
downloadBtn.addEventListener("click", () => {
  if (!image.src) return alert("Aucune image à télécharger !");
  const memeURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = memeURL;
  link.download = "meme.png";
  link.click();
  saveMemeToGallery(memeURL);
});

// --- Partager le mème ---
shareBtn.addEventListener("click", async () => {
  if (!image.src) return alert("Aucun mème à partager !");
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const file = new File([blob], "meme.png", { type: "image/png" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: "Mon mème", text: "Regarde mon mème" });
  } else {
    alert("Le partage n'est pas supporté sur ce navigateur.");
  }
});

// --- Enregistre le mème dans la galerie locale ---
function saveMemeToGallery(dataURL) {
  let memes = JSON.parse(localStorage.getItem("memes")) || [];
  memes.push(dataURL);
  localStorage.setItem("memes", JSON.stringify(memes));
  loadGallery();
}

// --- Affiche la galerie des mèmes enregistrés ---
function loadGallery() {
  galleryContainer.innerHTML = "";
  const memes = JSON.parse(localStorage.getItem("memes")) || [];

  if (memes.length === 0) {
  galleryContainer.className =
    "flex flex-col items-center justify-center w-full h-64 text-center text-gray-600 rounded-xl bg-white";
  galleryContainer.innerHTML = `
    <i data-feather="image" class="w-12 h-12 mb-3 text-gray-400"></i>
    <p class="text-lg">Aucun mème enregistré pour le moment.</p>
  `;
  feather.replace();
  return;
} else {
  galleryContainer.className =
    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-center justify-center items-center";
}



  memes.forEach((src, index) => {
    const item = document.createElement("div");
    item.classList.add("meme-item");

    const img = document.createElement("img");
    img.src = src;

    // Boutons Partager & Supprimer
    const btnContainer = document.createElement("div");
    btnContainer.classList.add("meme-buttons");

    const shareBtn = document.createElement("button");
    shareBtn.textContent = "Partager";
    shareBtn.addEventListener("click", async () => {
      const blob = await fetch(src).then(res => res.blob());
      const file = new File([blob], "meme.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Mon mème", text: "Regarde mon mème" });
      } else {
        alert("Le partage n'est pas supporté sur ce navigateur.");
      }
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "Supprimer";
    delBtn.addEventListener("click", () => {
      memes.splice(index, 1);
      localStorage.setItem("memes", JSON.stringify(memes));
      loadGallery();
    });

    btnContainer.appendChild(shareBtn);
    btnContainer.appendChild(delBtn);
    item.appendChild(img);
    item.appendChild(btnContainer);
    galleryContainer.appendChild(item);
  });
}

  // Charge automatiquement la galerie au lancement de la page
  loadGallery();