const API_KEY = "YOUR_GEMINI_API_KEY"; // Replace with your actual key
const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const micBtn = document.getElementById("mic-btn");

// Show loading, then welcome, then chatbot
window.addEventListener("load", () => {
  const loading = document.getElementById("loading-screen");
  const avatar = document.getElementById("avatar-popup");
  const mainApp = document.querySelector(".app-wrapper");

  setTimeout(() => {
    loading.style.opacity = "0";
    loading.style.pointerEvents = "none";
    avatar.style.opacity = "1";
    avatar.style.pointerEvents = "auto";

    setTimeout(() => {
      avatar.style.opacity = "0";
      avatar.style.pointerEvents = "none";
      mainApp.style.display = "flex";
    }, 2000); // avatar shown for 3 sec
  }, 1500); // loading screen for 2.5 sec
});

// Add message to chat
function addMessage(text, sender, isHTML = false) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender);
  if (isHTML) {
    msgDiv.innerHTML = text;
  } else {
    msgDiv.textContent = text;
  }
  chatContainer.appendChild(msgDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Show typing animation
function showTypingDots() {
  const dotsHTML = `
    <div class="message bot typing" id="typing">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>`;
  chatContainer.insertAdjacentHTML("beforeend", dotsHTML);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Remove typing animation
function removeTypingDots() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}

// Send button click handler
sendBtn.addEventListener("click", async () => {
  const input = userInput.value.trim();
  if (!input) return;

  addMessage(input, "user");
  userInput.value = "";

  showTypingDots();

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text:"your are a friendly AI bot ur name is genAI chatbot" + input }] }]
        }),
      }
    );

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response from Gemini.";

    removeTypingDots();
    addMessage(reply, "bot");

    const utter = new SpeechSynthesisUtterance(reply);
    speechSynthesis.speak(utter);

  } catch (err) {
    removeTypingDots();
    addMessage("⚠️ Error: Could not reach Gemini API.", "bot");
    console.error(err);
  }
});

// 🎤 Voice input
micBtn.addEventListener("click", () => {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Speech recognition not supported in this browser.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event);
  };

  recognition.start();
});
