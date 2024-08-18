let currentMode = 'normal'; 

/**
 * Sets the bot's operational mode based on user selection and updates the UI accordingly.
 * The mode selected by the user. If not provided, logs an error.
 */

function selectBotMode(selectedMode) {
  if (selectedMode) {
    currentMode = selectedMode;
    $('.bot-mode-button').html(selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1) + ' <span class="dropdown-arrow"></span>');
    $('#botModeMenu').hide();
  } else {
    console.error('Selected mode is undefined');
  }
}

/**
 * Initializes event listeners when the document is ready, to handle clicks on bot mode options.
 */
$(document).ready(function() {
  $('.bot-mode-option').on('click', function() {
    const mode = $(this).data('mode');
    selectBotMode(mode);
  });
});

/**
 * Submits the user's chat input via AJAX to a server-side API and handles the response.
 * Appends the user's message to the chat interface, sends the data including the role and mode to the API,
 * and displays a loading animation until a response is received.
 */
const submitForm = () => {
  const chatInput = $(".chat-input").val();
  const chatrole = $(".role-names").val();
  const chatmode = currentMode;

  $("main").append(`
  <div class="chat-msg-box clint">
      <p>${chatInput}</p>
  </div>
  `);

  scrollToBottom();

  $.ajax({
    url: `./api/question/?q=${encodeURIComponent(chatInput)}&r=${encodeURIComponent(chatrole)}&m=${encodeURIComponent(chatmode)}`,
    method: "GET",
    cache: false,
    beforeSend: () => {

      $(".user-answer").val(chatInput);
      $(".counter").val(1);

      $(".chat-input").val("");
      $(".typing").show();
      $("main").append(`
        <div class="chat-msg-box bot">
          <div class="spinner">
            <div class="bounce1"></div>
            <div class="bounce2"></div>
            <div class="bounce3"></div>
          </div>
        </div>
        `);
      if ($(".chat-msg-box").length >= 10) {
        $([document.documentElement, document.body]).animate({
          scrollTop: $(".chat-msg-box.bot:last-child").offset().top,
        }, { duration: 500 });
      }
    },
    success: (data) => {
      const response = (data.responseText).replace(/\n/gm, "</br>");
      scrollToBottom(); 
      $(".chat-msg-box.bot:last-child").html(`
      <p>${response}</p>

      <div class="response">
          <input type="hidden" name="response" value="${response}">
          <input type="hidden" name="question" value="${chatInput}">
          <input type="hidden" name="role" value="${chatrole}">
          <input type="hidden" name="mode" value="${chatmode}">
          <button class="good">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192H96c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z"/></svg>
          </button>
          <button class="bad">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M313.4 479.1c26-5.2 42.9-30.5 37.7-56.5l-2.3-11.4c-5.3-26.7-15.1-52.1-28.8-75.2H464c26.5 0 48-21.5 48-48c0-18.5-10.5-34.6-25.9-42.6C497 236.6 504 223.1 504 208c0-23.4-16.8-42.9-38.9-47.1c4.4-7.3 6.9-15.8 6.9-24.9c0-21.3-13.9-39.4-33.1-45.6c.7-3.3 1.1-6.8 1.1-10.4c0-26.5-21.5-48-48-48H294.5c-19 0-37.5 5.6-53.3 16.1L202.7 73.8C176 91.6 160 121.6 160 153.7V192v48 24.9c0 29.2 13.3 56.7 36 75l7.4 5.9c26.5 21.2 44.6 51 51.2 84.2l2.3 11.4c5.2 26 30.5 42.9 56.5 37.7zM32 384H96c17.7 0 32-14.3 32-32V128c0-17.7-14.3-32-32-32H32C14.3 96 0 110.3 0 128V352c0 17.7 14.3 32 32 32z"/></svg>
          </button>
      </div>

      `);
      scrollToBottom();
      
    },
    error: () => {
      $(".chat-msg-box.bot:last-child").remove();
    },
    complete: () => {
      $(".typing").hide();
    },
  });
};

/**
 * Attaches a click event listener to "good" feedback buttons to send user feedback to the server.
 * Displays a thank you message and submits feedback-related data via AJAX to the API.
 */
$(document).on('click', '.response .good', function(){
    alert("thank you for your feedback");
    const response = $(this).closest("div.response").find("input[name='response']").val();
    const question = $(this).closest("div.response").find("input[name='question']").val();
    const role = $(this).closest("div.response").find("input[name='role']").val();

    $.ajax({
    url: `./api/feedback/?question=${encodeURIComponent(question)}&r=${encodeURIComponent(response)}&role=${encodeURIComponent(role)}&feedback=${encodeURIComponent("good")}`,
    method: "GET",
    cache: false,
    beforeSend: () => {},
    success: (data) => {
      const response = (data.responseText).replace(/\n/gm, "</br>");
    },
    error: () => {},
    complete: () => {},
  });

});

/**
 * Attaches a click event listener to "bad" feedback buttons to send negative feedback to the server.
 * Shows a thank you message and submits feedback-related data via AJAX to the API.
 */
$(document).on('click', '.response .bad', function(){
    alert("thank you for your feedback");
    const response = $(this).closest("div.response").find("input[name='response']").val();
    const question = $(this).closest("div.response").find("input[name='question']").val();
    const role = $(this).closest("div.response").find("input[name='role']").val();

    $.ajax({
    url: `./api/feedback/?question=${encodeURIComponent(question)}&r=${encodeURIComponent(response)}&role=${encodeURIComponent(role)}&feedback=${encodeURIComponent("bad")}`,
    method: "GET",
    cache: false,
    beforeSend: () => {},
    success: (data) => {
      const response = (data.responseText).replace(/\n/gm, "</br>");
    },
    error: () => {},
    complete: () => {},
  });

});

/**
 * Loads initial chat messages and questions on window load.
 * requests a welcome message via AJAX and displays it.
 * Also retrieves and displays all available questions from the server.
 */
window.onload = () => {
  if (document.querySelectorAll(".chat-msg-box").length == 0) {
    $.ajax({
      url: "./api/welcome",
      beforeSend: () => {
        $(".typing").show();
        $("main").append(`
          <div class="chat-msg-box bot">
            <div class="spinner">
              <div class="bounce1"></div>
              <div class="bounce2"></div>
              <div class="bounce3"></div>
            </div>
          </div>
        `);
      },
      success: (data) => {
        const response = (data.responseText).replace(/\n/gm, "<br>");
        $(".chat-msg-box.bot:last-child").html(`<p>${response}</p>`);
      },
      error: () => {
        $(".chat-msg-box.bot:last-child").remove();
      },
      complete: () => {
        $(".typing").hide();
      },
    });
  }
};

/**
 * Adjusts the position of the header based on the window height during resize events.
 * Hides the header by moving it upward when the window height is below 580 pixels.
 */
window.onresize = () => {
  if (window.innerHeight < 580) {
    $("header").css("top", "-4em");
  } else {
    $("header").css("top", "0vh");
  }
};


/**
 * Prevents the default form submission, triggers a message send function,
 * clears the message input, and adjusts the textarea size.
 */
$("#chat-form").submit((e) => {
  e.preventDefault();
  submitForm();
  $('#chat-input-messageBox').val('');
  resizeTextarea();
});


/**
 * Handles the "regenerate" button click: prevents default behavior, updates counter, clears input, shows loader, 
 * and sends an AJAX request with chat details to regenerate the response. Updates or clears the chat box based on AJAX outcomes.
 */
$("#chat-form button[type=regenerate]").click(function (e) {
  e.preventDefault();
  const chatInput = $(".user-answer").val();
  const chatrole = $(".role-names").val();
  const chatmode = currentMode;
  const counter = $(".counter").val();

  $.ajax({
    url: `./api/regenerate/?q=${encodeURIComponent(chatInput)}&r=${encodeURIComponent(chatrole)}&c=${encodeURIComponent(counter)}&m=${encodeURIComponent(chatmode)}`,
    method: "GET",
    cache: false,
    beforeSend: () => {

      $(".counter").val(parseInt(counter)+1);

      $(".chat-input").val("");
      $(".typing").show();
      $("main").append(`
        <div class="chat-msg-box bot">
          <div class="spinner">
            <div class="bounce1"></div>
            <div class="bounce2"></div>
            <div class="bounce3"></div>
          </div>
        </div>
        `);
      if ($(".chat-msg-box").length >= 10) {
        $([document.documentElement, document.body]).animate({
          scrollTop: $(".chat-msg-box.bot:last-child").offset().top,
        }, { duration: 500 });
      }
    },
    success: (data) => {
      const response = (data.responseText).replace(/\n/gm, "</br>");
      $(".chat-msg-box.bot:last-child").html(`

       <p>${response}</p>

       <div class="response">
          <input type="hidden" name="response" value="${response}">
          <input type="hidden" name="question" value="${chatInput}">
          <input type="hidden" name="role" value="${chatrole}">
          <input type="hidden" name="mode" value="${chatmode}">
          <button class="good">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192H96c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z"/></svg>
          </button>
          <button class="bad">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M313.4 479.1c26-5.2 42.9-30.5 37.7-56.5l-2.3-11.4c-5.3-26.7-15.1-52.1-28.8-75.2H464c26.5 0 48-21.5 48-48c0-18.5-10.5-34.6-25.9-42.6C497 236.6 504 223.1 504 208c0-23.4-16.8-42.9-38.9-47.1c4.4-7.3 6.9-15.8 6.9-24.9c0-21.3-13.9-39.4-33.1-45.6c.7-3.3 1.1-6.8 1.1-10.4c0-26.5-21.5-48-48-48H294.5c-19 0-37.5 5.6-53.3 16.1L202.7 73.8C176 91.6 160 121.6 160 153.7V192v48 24.9c0 29.2 13.3 56.7 36 75l7.4 5.9c26.5 21.2 44.6 51 51.2 84.2l2.3 11.4c5.2 26 30.5 42.9 56.5 37.7zM32 384H96c17.7 0 32-14.3 32-32V128c0-17.7-14.3-32-32-32H32C14.3 96 0 110.3 0 128V352c0 17.7 14.3 32 32 32z"/></svg>
          </button>
      </div>

      `);
    },
    error: () => {
      $(".chat-msg-box.bot:last-child").remove();
    },
    complete: () => {
      $(".typing").hide();
    },
  });
});

/**
 * Initializes a typing animation for the chat input field, 
 * setting a dynamic placeholder that simulates typing.
 */
const typed = new Typed(".chat-input", {
  strings: [
    "enter your question here",
  ],
  showCursor: true,
  cursorChar: "|",
  attr: "placeholder",
});

/**
 * Sets up event listeners when the document is loaded.
 * Prevents default form submission, collects input values, 
 * and sends them as a JSON POST request to the server.
 */
document.addEventListener("DOMContentLoaded", function() {
  var form = document.getElementById('chat-form');

  // Add submit event listener
  form.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    var chatInput = document.querySelector('.chat-input').value;
    var role = document.getElementById('role-names').value;
    var mode = document.getElementById('bot-mode').value;

    var data = {
      message: chatInput,
      role: role,
      mode: mode
    };

    fetch('/api/chat-response', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  });
});

/**
 * Adjusts the height of the chat input field dynamically 
 * as the user types to ensure all input is visible without scrolling.
 */
$(document).ready(function() {
  $('.chat-input').on('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
  }).each(function() {
      this.style.height = (this.scrollHeight) + 'px';
  });
});

/**
 * Prevents form submission with the Enter key unless the Shift key is also pressed.
 * Submits the form if the input is not empty. Provides feedback if the input is empty.
 */
$(document).ready(function() {
  $('.chat-input').keydown(function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); 

      var inputText = $.trim($(this).val());
      if (inputText !== '') {
        $('#chat-form').submit();
      } else {
        $(this).addClass('input-error');
        $('.error-message').text('Please enter a message.').show();
      }
    }
  });

/**
 * Handles the form submission for the chat interface. 
 * Prevents the default form submission to manage message sending manually.
 * Checks if the message is non-empty.
 */
  $('#chat-form').on('submit', function(event) {
    event.preventDefault(); 

    var messageToSend = $('.chat-input').val().trim();
    if (messageToSend !== '') {
      console.log("Sending message:", messageToSend); 

      $('.chat-input').val('');
    }
  });
});



function resizeTextarea() {
  var textarea = $('#chat-input-messageBox');
  textarea.css('height', '55px');
}
$('#chatInput').on('input', function() {
  resizeTextarea();
});


  function toggleBotModeMenu() {
    var menu = document.getElementById("botModeMenu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  }
  

  function scrollToBottom() {
    const chatHistory = document.querySelector('.chat-history');
    console.log(chatHistory, chatHistory.scrollHeight); // Check if the element and values are correct
    chatHistory.scrollTop = chatHistory.scrollHeight;
}
