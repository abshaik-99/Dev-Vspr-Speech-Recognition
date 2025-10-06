// window.onload = function () {
//     var recognition = new webkitSpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = true;

//     var finalTranscript = ''; 

//     recognition.onresult = function (event) {
//         var interimTranscript = '';
//         for (var i = event.resultIndex; i < event.results.length; ++i) {
//             if (event.results[i].isFinal) {
//                 finalTranscript += event.results[i][0].transcript;
//             } else {
//                 interimTranscript += event.results[i][0].transcript;
//             }
//         }
//         document.getElementById('text').innerHTML = finalTranscript + '<i style="color:#aaa;">' + interimTranscript + '</i>';
//     };

//     document.getElementById('startBtn').addEventListener('click', function() {
//         recognition.start();
//     });

//     document.getElementById('stopBtn').addEventListener('click', function() {
//         recognition.stop();
//         finalTranscript += '<br><br>'; 
//         document.getElementById('text').innerHTML = finalTranscript;
//     });

// };


// // Update your form submission handler
// document.getElementById('signupForm').addEventListener('submit', async function(e) {
//     e.preventDefault();
    
//     // Clear previous errors
//     document.getElementById('passwordError').textContent = '';
//     document.getElementById('passwordMatchError').textContent = '';

//     // Get CSRF token from hidden input BEFORE building formData
//     const csrfToken = document.querySelector('input[name="csrf_token"]').value;
    
//     // Get form values
//     const formData = {
//         username: this.username.value,
//         email: this.email.value,
//         phonenumber: this.phonenumber.value,
//         password: this.password.value,
//         retype_password: this.retype_password.value,
//     };
    
//     // Client-side validation
//     if (!validatePassword()) return;
//     if (!validatePasswordMatch()) return;
    
//     try {
        
//         const response = await fetch("/signup", {  // Fixed URL
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Accept': 'application/json',
//                 'X-CSRFToken': csrfToken
//             },
//             body: JSON.stringify(formData)
//         });
        
//         if (!response.ok) {
//             // Optional: try to get JSON error message, else fallback
//             const errorData = await response.json().catch(() => null);
//             const message = errorData?.error || `HTTP error ${response.status}`;
//             throw new Error(message);
//         }
        
//         const data = await response.json();
        
//         if (data.success) {
//             window.location.href = "/signin";  // Redirect on success
//         } else {
//             // Show server-side errors
//             if (data.error) {
//                 document.getElementById('passwordError').textContent = data.error;
//             }
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         document.getElementById('passwordError').textContent = 'An error occurred. Please try again.';
//     }
// });

// // Standalone validation functions
// function validatePassword() {
//     const password = document.getElementById('password').value;
//     const errorDiv = document.getElementById('passwordError');
//     errorDiv.textContent = '';
    
//     if (password.length < 8) {
//         errorDiv.textContent = 'Password must be at least 8 characters';
//         return false;
//     }
//     if (!/\d/.test(password)) {
//         errorDiv.textContent = 'Password must contain at least 1 number';
//         return false;
//     }
//     if (!/[A-Z]/.test(password)) {
//         errorDiv.textContent = 'Password must contain at least 1 uppercase letter';
//         return false;
//     }
//     return true;
// }

// function validatePasswordMatch() {
//     const password = document.getElementById('password').value;
//     const retypePassword = document.getElementById('retype_password').value;
//     const errorDiv = document.getElementById('passwordMatchError');
//     errorDiv.textContent = '';
    
//     if (password !== retypePassword) {
//         errorDiv.textContent = 'Passwords do not match';
//         return false;
//     }
//     return true;
// }

// document.addEventListener('DOMContentLoaded', function() {
//     // Ensure elements exist before adding event listeners
//     const startBtn = document.getElementById('startBtn');
//     const stopBtn = document.getElementById('stopBtn');
//     const saveBtn = document.getElementById('saveBtn');
//     const clearBtn = document.getElementById('clearBtn');
    
//     if (startBtn) startBtn.addEventListener('click', startRecording);
//     if (stopBtn) stopBtn.addEventListener('click', stopRecording);
//     if (saveBtn) saveBtn.addEventListener('click', saveTranscript);
//     if (clearBtn) clearBtn.addEventListener('click', clearTranscript);
    
//     // Add null checks for other elements your code might reference
//     const textElement = document.getElementById('text');
//     if (textElement) {
//         textElement.addEventListener('input', updateWordCount);
//     }
    
//     // Initialize word count
//     updateWordCount();
// });


// document.addEventListener('DOMContentLoaded', function() {
//             // Get all navigation links
//             const navLinks = document.querySelectorAll('.sidebar-nav a');
            
//             // Add click event listeners
//             navLinks.forEach(link => {
//                 // Skip external links (those starting with http or /)
//                 if (!link.getAttribute('href').startsWith('#') && 
//                     !link.getAttribute('href').startsWith('http') && 
//                     !link.getAttribute('href').startsWith('/')) {
//                     return;
//                 }
                
//                 link.addEventListener('click', function(e) {
//                     // Skip if it's an external link
//                     if (this.getAttribute('href').startsWith('http') || 
//                         this.getAttribute('href').startsWith('/')) {
//                         return;
//                     }
                    
//                     e.preventDefault();
                    
//                     // Get the target section ID
//                     const targetId = this.getAttribute('href').substring(1);
                    
//                     // Hide all sections
//                     document.querySelectorAll('.content-section').forEach(section => {
//                         section.classList.remove('active');
//                     });
                    
//                     // Show the target section
//                     document.getElementById(`${targetId}-section`).classList.add('active');
                    
//                     // Update active nav link
//                     document.querySelectorAll('.sidebar-nav a').forEach(navLink => {
//                         navLink.classList.remove('active');
//                     });
//                     this.classList.add('active');
//                 });
//             });
//         });



// Speech Recognition Variables
let recognition;
let finalTranscript = '';

// Initialize the application
function initializeApp() {
    setupSpeechRecognition();
    setupEventListeners();
    setupNavigation();
    updateWordCount();
}

// Speech Recognition Setup
function setupSpeechRecognition() {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = function(event) {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        
        const textElement = document.getElementById('text');
        if (textElement) {
            textElement.innerHTML = finalTranscript + '<i style="color:#aaa;">' + interimTranscript + '</i>';
            updateWordCount();
        }
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error', event.error);
    };
}

// Event Listeners Setup
function setupEventListeners() {
    // Speech controls
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const saveBtn = document.getElementById('saveBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    if (startBtn) startBtn.addEventListener('click', startRecording);
    if (stopBtn) stopBtn.addEventListener('click', stopRecording);
    if (saveBtn) saveBtn.addEventListener('click', saveTranscript);
    if (clearBtn) clearBtn.addEventListener('click', clearTranscript);
    
    // Text input
    const textElement = document.getElementById('text');
    if (textElement) {
        textElement.addEventListener('input', updateWordCount);
    }
    
    // Form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

// Navigation Setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    
    navLinks.forEach(link => {
        if (!link.getAttribute('href').startsWith('#') && 
            !link.getAttribute('href').startsWith('http') && 
            !link.getAttribute('href').startsWith('/')) {
            return;
        }
        
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('http') || 
                this.getAttribute('href').startsWith('/')) {
                return;
            }
            
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            const targetSection = document.getElementById(`${targetId}-section`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            document.querySelectorAll('.sidebar-nav a').forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
}

// Speech Functions
function startRecording() {
    try {
        finalTranscript = '';
        recognition.start();
        document.getElementById('recording-indicator')?.classList.remove('hidden');
    } catch (error) {
        console.error('Error starting recording:', error);
    }
}

function stopRecording() {
    try {
        recognition.stop();
        document.getElementById('recording-indicator')?.classList.add('hidden');
        finalTranscript += '<br><br>';
        document.getElementById('text').innerHTML = finalTranscript;
    } catch (error) {
        console.error('Error stopping recording:', error);
    }
}

function saveTranscript() {
    const text = document.getElementById('text')?.innerText;
    if (text) {
        // Implement your save functionality here
        console.log('Transcript saved:', text);
        alert('Transcript saved successfully!');
    }
}

function clearTranscript() {
    // Clear the final transcript variable
    finalTranscript = '';
    
    // Clear the text element content
    const textElement = document.getElementById('text');
    if (textElement) {
        textElement.innerHTML = '';
    }
    
    // Reset the word count
    updateWordCount();
    
    // If you want to also stop any ongoing recording
    try {
        recognition.stop();
        document.getElementById('recording-indicator')?.classList.add('hidden');
    } catch (error) {
        console.error('Error stopping recording:', error);
    }
    
    console.log('Transcript cleared'); // For debugging
}

// Word Count Function
function updateWordCount() {
    const textElement = document.getElementById('text');
    const wordCountElement = document.getElementById('word-count');
    
    if (textElement && wordCountElement) {
        const text = textElement.innerText.trim();
        const words = text ? text.split(/\s+/).length : 0;
        const characters = text.length;
        
        wordCountElement.textContent = `Words: ${words} | Characters: ${characters}`;
    }
}



// Form Handling
async function handleSignup(e) {
    e.preventDefault();
    
    // Clear all error messages first
    document.getElementById('usernameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('phoneError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('passwordMatchError').textContent = '';

    // Get CSRF token
    const csrfToken = document.querySelector('input[name="csrf_token"]')?.value;
    if (!csrfToken) {
        console.error('CSRF token missing');
        return;
    }
    
    // Get form values
    const formData = {
        username: this.username.value,
        email: this.email.value,
        phonenumber: this.phonenumber.value,
        password: this.password.value,
        retype_password: this.retype_password.value,
    };
    
    // Client-side validation
    if (!validatePassword()) return;
    if (!validatePasswordMatch()) return;
    
    try {
        const response = await fetch("/signup", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();

        if (response.ok && data.success) {
            const successDiv = document.getElementById('signupSuccess');
            successDiv.textContent = data.message;
            successDiv.style.display = 'block';

            // Wait 3 seconds, then redirect
            setTimeout(() => {
                window.location.href = "/signin";
            }, 3000);
        } else {
            // Show specific errors
            if (data.error) {
                const msg = data.error.toLowerCase();
                if (msg.includes("username")) {
                    document.getElementById('usernameError').textContent = data.error;
                } else if (msg.includes("email")) {
                    document.getElementById('emailError').textContent = data.error;
                } else if (msg.includes("phone")) {
                    document.getElementById('phoneError').textContent = data.error;
                } else {
                    document.getElementById('passwordError').textContent = data.error;
                }
            }
        }
    } catch (error) {
        console.error('Signup error:', error);
        document.getElementById('passwordError').textContent = 'An unexpected error occurred. Please try again.';
    }
}

// Validation Functions (unchanged)
function validatePassword() {
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('passwordError');
    errorDiv.textContent = '';
    
    if (password.length < 8) {
        errorDiv.textContent = 'Password must be at least 8 characters';
        return false;
    }
    if (!/\d/.test(password)) {
        errorDiv.textContent = 'Password must contain at least 1 number';
        return false;
    }
    if (!/[A-Z]/.test(password)) {
        errorDiv.textContent = 'Password must contain at least 1 uppercase letter';
        return false;
    }
    return true;
}

document.querySelector('a[href="#profile"]').addEventListener('click', function(e) {
    e.preventDefault();
    
    fetch(PROFILE_CONTENT_URL, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'  // Important for sending session cookies
    })
    .then(response => {
        if (response.status === 401) {
            // Unauthorized - redirect to login
            window.location.href = "{{ url_for('signin') }}";
            return;
        }
        return response.text();
    })
    .then(html => {
        if (html) {
            document.getElementById('profile-container').innerHTML = html;
            // Show the profile section
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById('profile-section').classList.add('active');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const retypePassword = document.getElementById('retype_password').value;
    const errorDiv = document.getElementById('passwordMatchError');
    errorDiv.textContent = '';
    
    if (password !== retypePassword) {
        errorDiv.textContent = 'Passwords do not match';
        return false;
    }
    return true;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
