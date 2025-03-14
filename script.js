// DOM Elements
const elements = {
  sideMenu: document.getElementById("sideMenu"),
  menuToggle: document.getElementById("menuToggle"),
  newChatBtn: document.getElementById("newChatBtn"),
  newChatIcon: document.getElementById("newChatIcon"),
  conversationsList: document.getElementById("conversationsList"),
  chatMessages: document.getElementById("chatMessages"),
  messageInput: document.getElementById("messageInput"),
  sendBtn: document.getElementById("sendBtn"),
  uploadBtn: document.getElementById("uploadBtn"),
  micBtn: document.getElementById("micBtn"),
  chatTitle: document.getElementById("chatTitle"),
  modelSelect: document.getElementById("modelSelect"),
  settingsBtn: document.getElementById("settingsBtn"),
  settingsModal: document.getElementById("settingsModal"),
  closeSettingsBtn: document.getElementById("closeSettingsBtn"),
  themeToggle: document.getElementById("themeToggle"),
  clearAllBtn: document.getElementById("clearAllBtn"),
  imageModal: document.getElementById("imageModal"),
  closeImageBtn: document.getElementById("closeImageBtn"),
  imagePreview: document.getElementById("imagePreview"),
  downloadImageBtn: document.getElementById("downloadImageBtn"),
  overlay: document.getElementById("overlay"),
  mainContent: document.getElementById("mainContent"),
}

// State
const state = {
  conversations: JSON.parse(localStorage.getItem("conversations")) || [],
  currentConversationId: localStorage.getItem("currentConversationId") || null,
  isDarkTheme: localStorage.getItem("isDarkTheme") === "true",
  isRecording: false,
  isSideMenuOpen: false,
}

// Initialize
function init() {
  // Set theme
  if (state.isDarkTheme) {
    document.body.classList.add("dark-theme")
    elements.themeToggle.checked = true
  }

  // Load conversations
  renderConversations()

  // Load current conversation
  if (state.currentConversationId) {
    loadConversation(state.currentConversationId)
  }

  // Set model from localStorage
  const savedModel = localStorage.getItem("selectedModel")
  if (savedModel) {
    elements.modelSelect.value = savedModel
  }

  // Auto resize textarea
  elements.messageInput.addEventListener("input", function () {
    this.style.height = "auto"
    this.style.height = this.scrollHeight + "px"
  })

  // Focus input on page load
  setTimeout(() => {
    elements.messageInput.focus()
  }, 100)

  // Add CSS for animations
  addAnimationStyles()

  // Add event listeners
  setupEventListeners()

  // Create a new conversation if none exists
  if (!state.currentConversationId && state.conversations.length === 0) {
    createNewConversation()
  }

  // Ensure we have a valid current conversation
  if (state.currentConversationId && !state.conversations.find((conv) => conv.id === state.currentConversationId)) {
    if (state.conversations.length > 0) {
      state.currentConversationId = state.conversations[0].id
      localStorage.setItem("currentConversationId", state.currentConversationId)
      loadConversation(state.currentConversationId)
    } else {
      createNewConversation()
    }
  }
}

// Event Listeners
function setupEventListeners() {
  elements.menuToggle.addEventListener("click", toggleSideMenu)
  elements.newChatBtn.addEventListener("click", createNewConversation)
  elements.newChatIcon.addEventListener("click", createNewConversation)
  elements.sendBtn.addEventListener("click", sendMessage)
  elements.messageInput.addEventListener("keydown", handleMessageInputKeydown)
  elements.uploadBtn.addEventListener("click", handleImageUpload)
  elements.micBtn.addEventListener("click", handleVoiceInput)
  elements.modelSelect.addEventListener("change", saveModelSelection)
  elements.settingsBtn.addEventListener("click", openSettingsModal)
  elements.closeSettingsBtn.addEventListener("click", closeSettingsModal)
  elements.themeToggle.addEventListener("change", toggleTheme)
  elements.clearAllBtn.addEventListener("click", clearAllConversations)
  elements.closeImageBtn.addEventListener("click", closeImageModal)
  elements.overlay.addEventListener("click", handleOverlayClick)

  // Close side menu when clicking outside
  document.addEventListener("click", (e) => {
    if (state.isSideMenuOpen && !elements.sideMenu.contains(e.target) && e.target !== elements.menuToggle) {
      closeSideMenu()
    }
  })
}

// Functions
function toggleSideMenu() {
  if (state.isSideMenuOpen) {
    closeSideMenu()
  } else {
    openSideMenu()
  }
}

function openSideMenu() {
  elements.sideMenu.classList.add("open")
  elements.overlay.style.display = "block"
  setTimeout(() => {
    elements.overlay.classList.add("visible")
  }, 10)
  state.isSideMenuOpen = true
}

function closeSideMenu() {
  elements.sideMenu.classList.remove("open")
  elements.overlay.classList.remove("visible")
  setTimeout(() => {
    elements.overlay.style.display = "none"
  }, 300)
  state.isSideMenuOpen = false
}

function handleMessageInputKeydown(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

function saveModelSelection() {
  localStorage.setItem("selectedModel", elements.modelSelect.value)
}

function handleOverlayClick() {
  closeSettingsModal()
  closeImageModal()
  closeSideMenu()
}

function createNewConversation() {
  const id = Date.now().toString()
  const newConversation = {
    id,
    title: "New Chat",
    messages: [],
    model: elements.modelSelect.value,
    createdAt: new Date().toISOString(),
  }

  state.conversations.unshift(newConversation)
  saveConversations()

  state.currentConversationId = id
  localStorage.setItem("currentConversationId", id)

  renderConversations()

  // Clear messages area
  elements.chatMessages.innerHTML = ""
  elements.chatTitle.textContent = "New Chat"

  // Close side menu
  closeSideMenu()

  return newConversation
}

function renderConversations() {
  elements.conversationsList.innerHTML = ""

  if (state.conversations.length === 0) {
    const emptyState = document.createElement("div")
    emptyState.className = "empty-state"
    emptyState.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>No conversations yet</p>
        `
    elements.conversationsList.appendChild(emptyState)
    return
  }

  state.conversations.forEach((conversation) => {
    const conversationItem = document.createElement("div")
    conversationItem.className = `conversation-item ${conversation.id === state.currentConversationId ? "active" : ""}`
    conversationItem.dataset.id = conversation.id

    conversationItem.innerHTML = `
            <div class="conversation-title">${conversation.title}</div>
            <button class="delete-conversation" data-id="${conversation.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `

    conversationItem.addEventListener("click", (e) => {
      if (!e.target.closest(".delete-conversation")) {
        loadConversation(conversation.id)
      }
    })

    elements.conversationsList.appendChild(conversationItem)
  })

  // Add event listeners to delete buttons
  document.querySelectorAll(".delete-conversation").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation()
      deleteConversation(this.dataset.id)
    })
  })
}

function loadConversation(id) {
  const conversation = state.conversations.find((conv) => conv.id === id)
  if (!conversation) return

  state.currentConversationId = id
  localStorage.setItem("currentConversationId", id)

  elements.chatTitle.textContent = conversation.title
  elements.modelSelect.value = conversation.model || elements.modelSelect.value

  renderMessages(conversation.messages)

  // Update active state in sidebar
  document.querySelectorAll(".conversation-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.id === id)
  })

  // Close side menu
  closeSideMenu()
}

function renderMessages(messages) {
  if (!messages || !Array.isArray(messages)) {
    console.error("Invalid messages array:", messages)
    messages = []
  }

  elements.chatMessages.innerHTML = ""

  if (messages.length === 0) {
    const emptyState = document.createElement("div")
    emptyState.className = "empty-chat"
    emptyState.innerHTML = `
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Start a conversation</h3>
            <p>Send a message to begin chatting with the AI</p>
        `
    elements.chatMessages.appendChild(emptyState)
    return
  }

  messages.forEach((message, index) => {
    const messageElement = document.createElement("div")
    messageElement.className = `message ${message.role}`

    if (message.type === "code") {
      messageElement.innerHTML = `
                <div class="code-block">
                    <div class="language">${message.language || "code"}</div>
                    <button class="copy-code">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8H18C18.5304 8 19.0391 8.21071 19.4142 8.58579C19.7893 8.96086 20 9.46957 20 10V18C20 18.5304 19.7893 19.0391 19.4142 19.4142C19.0391 19.7893 18.5304 20 18 20H10C9.46957 20 8.96086 19.7893 8.58579 19.4142C8.21071 19.0391 8 18.5304 8 18V10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M16 8V6C16 5.46957 15.7893 4.96086 15.4142 4.58579C15.0391 4.21071 14.5304 4 14 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V14C4 14.5304 4.21071 15.0391 4.58579 15.4142C4.96086 15.7893 5.46957 16 6 16H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Copy
                    </button>
                    ${message.content}
                </div>
            `

      // Add copy functionality
      const copyBtn = messageElement.querySelector(".copy-code")
      copyBtn.addEventListener("click", function () {
        navigator.clipboard.writeText(message.content)
        this.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Copied!
                `
        setTimeout(() => {
          this.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8H18C18.5304 8 19.0391 8.21071 19.4142 8.58579C19.7893 8.96086 20 9.46957 20 10V18C20 18.5304 19.7893 19.0391 19.4142 19.4142C19.0391 19.7893 18.5304 20 18 20H10C9.46957 20 8.96086 19.7893 8.58579 19.4142C8.21071 19.0391 8 18.5304 8 18V10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M16 8V6C16 5.46957 15.7893 4.96086 15.4142 4.58579C15.0391 4.21071 14.5304 4 14 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V14C4 14.5304 4.21071 15.0391 4.58579 15.4142C4.96086 15.7893 5.46957 16 6 16H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Copy
                    `
        }, 2000)
      })
    } else if (message.type === "image") {
      messageElement.innerHTML = `
                <img src="${message.content}" alt="Shared image" class="message-image">
            `

      const img = messageElement.querySelector(".message-image")
      img.addEventListener("click", () => {
        openImageModal(message.content)
      })
    } else {
      messageElement.textContent = message.content
    }

    elements.chatMessages.appendChild(messageElement)
  })

  // Scroll to bottom
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight
}

async function sendMessage() {
  const content = elements.messageInput.value.trim()
  if (!content) return

  // If no current conversation, create one first
  if (!state.currentConversationId || !state.conversations.find((conv) => conv.id === state.currentConversationId)) {
    createNewConversation()
  }

  const conversation = state.conversations.find((conv) => conv.id === state.currentConversationId)
  if (!conversation) {
    console.error("Failed to find or create conversation")
    return
  }

  // Add user message
  conversation.messages.push({
    role: "user",
    content,
    timestamp: new Date().toISOString(),
  })

  // Update conversation title if it's the first message
  if (conversation.messages.length === 1) {
    conversation.title = content.substring(0, 30) + (content.length > 30 ? "..." : "")
    elements.chatTitle.textContent = conversation.title
  }

  // Clear input
  elements.messageInput.value = ""
  elements.messageInput.style.height = "auto"

  // Render messages
  renderMessages(conversation.messages)

  // Save conversations
  saveConversations()
  renderConversations()

  // Send message to Gemini API
  await sendToGeminiAPI(conversation, content)
}

async function sendToGeminiAPI(conversation, userMessage) {
  const apiKey = "AIzaSyDqu2Jz1ym6NfZi6Kt1URnBsUlMxauOkE0" // Replace with your actual API key
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

  // Show typing indicator
  const typingIndicator = document.createElement("div")
  typingIndicator.className = "message ai"
  typingIndicator.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `
  elements.chatMessages.appendChild(typingIndicator)
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: userMessage,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    // Remove typing indicator
    elements.chatMessages.removeChild(typingIndicator)

    // Extract AI response
    const aiResponse = data.candidates[0].content.parts[0].text

    // Add AI response to conversation
    conversation.messages.push({
      role: "ai",
      content: aiResponse,
      timestamp: new Date().toISOString(),
    })

    // Render messages
    renderMessages(conversation.messages)

    // Save conversations
    saveConversations()
  } catch (error) {
    console.error("Error sending message to Gemini API:", error)

    // Remove typing indicator
    elements.chatMessages.removeChild(typingIndicator)

    // Show error message
    conversation.messages.push({
      role: "ai",
      content: "Sorry, there was an error processing your request. Please try again.",
      timestamp: new Date().toISOString(),
    })

    // Render messages
    renderMessages(conversation.messages)

    // Save conversations
    saveConversations()
  }
}

function handleImageUpload() {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = "image/*"

  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const conversation = state.conversations.find((conv) => conv.id === state.currentConversationId)
      if (!conversation) return

      // Add image message
      conversation.messages.push({
        role: "user",
        type: "image",
        content: event.target.result,
        timestamp: new Date().toISOString(),
      })

      // Render messages
      renderMessages(conversation.messages)

      // Save conversations
      saveConversations()

      // Simulate AI response
      simulateAIResponse(conversation)
    }

    reader.readAsDataURL(file)
  }

  input.click()
}

function handleVoiceInput() {
  // Check if browser supports speech recognition
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = "en-US"
    recognition.interimResults = false

    if (!state.isRecording) {
      // Start recording
      state.isRecording = true

      // Change mic button to indicate recording
      elements.micBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1C11.2044 1 10.4413 1.31607 9.87868 1.87868C9.31607 2.44129 9 3.20435 9 4V12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12V4C15 3.20435 14.6839 2.44129 14.1213 1.87868C13.5587 1.31607 12.7956 1 12 1Z" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 10V12C19 13.8565 18.2625 15.637 16.9497 16.9497C15.637 18.2625 13.8565 19 12 19C10.1435 19 8.36301 18.2625 7.05025 16.9497C5.7375 15.637 5 13.8565 5 12V10" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 19V23" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 23H16" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `

      // Add pulsing animation to mic button
      elements.micBtn.classList.add("recording")

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        elements.messageInput.value = transcript

        // Reset mic button
        resetMicButton()
      }

      recognition.onerror = () => {
        // Reset mic button
        resetMicButton()
        alert("Speech recognition error. Please try again.")
      }

      recognition.onend = () => {
        // Reset mic button
        resetMicButton()
      }

      recognition.start()
    } else {
      // Stop recording
      recognition.stop()
      resetMicButton()
    }
  } else {
    alert("Speech recognition is not supported in your browser.")
  }
}

function resetMicButton() {
  state.isRecording = false
  elements.micBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1C11.2044 1 10.4413 1.31607 9.87868 1.87868C9.31607 2.44129 9 3.20435 9 4V12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12V4C15 3.20435 14.6839 2.44129 14.1213 1.87868C13.5587 1.31607 12.7956 1 12 1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19 10V12C19 13.8565 18.2625 15.637 16.9497 16.9497C15.637 18.2625 13.8565 19 12 19C10.1435 19 8.36301 18.2625 7.05025 16.9497C5.7375 15.637 5 13.8565 5 12V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 19V23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 23H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `
  elements.micBtn.classList.remove("recording")
}

function deleteConversation(id) {
  if (!confirm("Are you sure you want to delete this conversation?")) return

  state.conversations = state.conversations.filter((conv) => conv.id !== id)
  saveConversations()

  if (id === state.currentConversationId) {
    state.currentConversationId = state.conversations.length > 0 ? state.conversations[0].id : null
    localStorage.setItem("currentConversationId", state.currentConversationId)

    if (state.currentConversationId) {
      loadConversation(state.currentConversationId)
    } else {
      elements.chatMessages.innerHTML = ""
      elements.chatTitle.textContent = "New Chat"
    }
  }

  renderConversations()
}

function saveConversations() {
  localStorage.setItem("conversations", JSON.stringify(state.conversations))
}

function openSettingsModal() {
  elements.settingsModal.style.display = "block"
  elements.overlay.style.display = "block"
  setTimeout(() => {
    elements.settingsModal.classList.add("visible")
    elements.overlay.classList.add("visible")
  }, 10)
}

function closeSettingsModal() {
  elements.settingsModal.classList.remove("visible")
  elements.overlay.classList.remove("visible")
  setTimeout(() => {
    elements.settingsModal.style.display = "none"
    if (!state.isSideMenuOpen) {
      elements.overlay.style.display = "none"
    }
  }, 300)
}

function toggleTheme() {
  state.isDarkTheme = !state.isDarkTheme
  document.body.classList.toggle("dark-theme", state.isDarkTheme)
  localStorage.setItem("isDarkTheme", state.isDarkTheme)
}

function clearAllConversations() {
  if (!confirm("Are you sure you want to clear all conversations? This cannot be undone.")) return

  state.conversations = []
  state.currentConversationId = null

  localStorage.removeItem("conversations")
  localStorage.removeItem("currentConversationId")

  elements.chatMessages.innerHTML = ""
  elements.chatTitle.textContent = "New Chat"

  renderConversations()
  closeSettingsModal()
}

function openImageModal(src) {
  elements.imagePreview.src = src
  elements.imageModal.style.display = "block"
  elements.overlay.style.display = "block"

  setTimeout(() => {
    elements.imageModal.classList.add("visible")
    elements.overlay.classList.add("visible")
  }, 10)

  // Set up download button
  elements.downloadImageBtn.onclick = () => {
    const a = document.createElement("a")
    a.href = src
    a.download = "image-" + Date.now() + ".jpg"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

function closeImageModal() {
  elements.imageModal.classList.remove("visible")
  elements.overlay.classList.remove("visible")
  setTimeout(() => {
    elements.imageModal.style.display = "none"
    if (!state.isSideMenuOpen) {
      elements.overlay.style.display = "none"
    }
  }, 300)
}

function addAnimationStyles() {
  const style = document.createElement("style")
  style.textContent = `
        .typing-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 8px 0;
        }
        
        .typing-indicator span {
            width: 8px;
            height: 8px;
            background-color: var(--text-secondary);
            border-radius: 50%;
            display: inline-block;
            animation: bounce 1.5s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(1) {
            animation-delay: 0s;
        }
        
        .typing-indicator span:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
            animation-delay: 0.4s;
        }
        
        @keyframes bounce {
            0%, 60%, 100% {
                transform: translateY(0);
            }
            30% {
                transform: translateY(-4px);
            }
        }
        
        .recording {
            animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
            }
        }
    `
  document.head.appendChild(style)
}

// Initialize the app
init()