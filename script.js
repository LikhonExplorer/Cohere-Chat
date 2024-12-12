const chatWindow = document.getElementById("chat-window");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const usernameElement = document.querySelector(".username");
const logoutButton = document.querySelector(".logout-button");

let accessToken;

// Function to fetch access token from GitHub
async function fetchAccessToken() {
    const response = await axios.post("https://github.com/login/oauth/access_token", null, {
        params: {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code: process.env.CODE,
        },
        headers: {
            accept: "application/json",
        },
    });

    accessToken = response.data.access_token;
    usernameElement.textContent = "Logged in as: " + response.data.user.login;
}

// Function to send user message to Cohere API and display response
async function sendUserMessage() {
    const userMessage = messageInput.value.trim();
    if (userMessage !== "") {
        displayMessage("You", userMessage, "user-message");
        messageInput.value = "";

        const response = await axios.post("https://api.cohere.com/v1/chat", {
            message: userMessage,
            max_tokens: 4050,
            model: "command-r-plus-08-2024",
            preamble: "You are an AI-assistant chatbot. You are trained to assist users by providing thorough and helpful responses to their queries.",
        }, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        displayMessage("Cohere AI", response.data.text, "bot-message");
    }
}

// Function to display messages in the chat window
function displayMessage(sender, message, className) {
    const messageElement = document.createElement("div");
    messageElement.className = "message " + className;
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Event listeners
sendButton.addEventListener("click", sendUserMessage);
messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendUserMessage();
    }
});

logoutButton.addEventListener("click", () => {
    // Clear access token and redirect to GitHub logout
    accessToken = null;
    window.location.href = "https://github.com/logout";
});

// Initialize the application
fetchAccessToken().then(() => {
    // Initialize any other necessary components or data
    // ...
});
