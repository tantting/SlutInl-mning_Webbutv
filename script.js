document.addEventListener("DOMContentLoaded", function () {
  clock();
  // randomBackGround();
  addNotes();
  changeHeading();
  favouriteLinks();
  showWeatherData();
});

//funktionality for writing text in notes
const addNotes = () => {
  const canvas = document.querySelector("#notesCanvas");
  canvas.addEventListener("input", function (event) {
    canvas.innerText = event.innerText;
  });
};

function clock() {
  function updateDateTime() {
    const now = new Date();

    // Formattera tid
    const time = now.toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Formattera datum
    const date = now.toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    document.getElementById("time").innerText = `${time}`;
    document.getElementById("date").innerText = `${date}`;
  }

  // Uppdatera direkt och sedan varje sekund
  updateDateTime();
  setInterval(updateDateTime, 1000);
}

// function randomBackGround() {
//   const backGroundBtn = document.querySelector("selectBackground");

//   backGroundBtn.addEventListener("click", () => {
//       body.style.backgroundImage =
//     });
// }

function changeHeading() {
  const heading = document.querySelector("#mainHeading");

  if (!heading) return;

  heading.addEventListener("click", () => {
    const headingInput = document.createElement("input");
    headingInput.classList.add("headingInput");
    headingInput.value = heading.innerText;
    heading.parentNode.replaceChild(headingInput, heading);
    headingInput.focus();

    const saveChanges = () => {
      heading.innerText = headingInput.value;
      headingInput.parentNode.replaceChild(heading, headingInput);
    };

    headingInput.addEventListener("blur", saveChanges);
    headingInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        saveChanges();
      }
    });
  });
}

const modalContainer = document.querySelector(".modalContainer");

function closeModal() {
  modalContainer.style.display = "none";
}

function favouriteLinks() {
  const startAddFavouriteBtn = document.querySelector("#addFavourite");
  const canselBtn = document.querySelector("#cancelButton");
  const addFavouriteBtn = document.querySelector("#addLinkButton");

  //show the modal when clicking the add-button in the link container
  startAddFavouriteBtn.addEventListener("click", () => {
    modalContainer.style.display = "flex";
  });

  //When klicking cancel - the modal does not show.
  canselBtn.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();
  });

  //Event for creating favoutites when clicking the "add"-button in the form
  addFavouriteBtn.addEventListener("click", (event) =>
    createNewFavourite(event)
  );
}
function createNewFavourite(event) {
  event.preventDefault(); // Förhindra formulärets submit
  event.stopPropagation(); // Förhindra att eventet "bubblar upp"

  const url = document.querySelector("#url").value;
  const linkName = document.querySelector("#linkName").value;

  if (!url || !linkName) {
    alert("Länk och/eller namn på länk saknas!");
    return;
  }
  addNewLinkDiv(url, linkName);
}

function addNewLinkDiv(url, linkName) {
  const newFavourite = document.createElement("a");

  const favIconURL = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=64`;

  newFavourite.innerHTML = `<div><img id="linkIcon" src="${favIconURL}" alt="${linkName}"><h3 id="linkTitle">${linkName}</h3></div><span class="edit fa-solid fa-pen-to-square"></span>`;
  newFavourite.href = url;
  newFavourite.target = "_blank"; //makesure the link is open in a new page
  newFavourite.classList.add("fav-link");

  document.querySelector("#links").appendChild(newFavourite);

  closeModal();

  const inputForm = document.querySelector(".inputForm");

  if (inputForm) {
    inputForm.reset();
  }
}

function showWeatherData() {
  const successCallback = (position) => {
    console.log(position);

    getWeatherData(position);
  };

  const errorCallback = (error) => {
    const message =
      "Väderdata kan inte visas om sidan inte har tillgång till position!";
    console.error(error);
    showError(message, "error-message");
  };

  //use the browsers geolocation api to get position
  navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
}

async function getWeatherData(position) {
  console.log("i getWeather");
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  console.log(longitude + " " + latitude);

  const BASE_URL = "";
  try {
    const url = `${BASE_URL}?`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = response.json();
    console.log(data);
  } catch (error) {
    console.error(`Error fetching weather data:"`, error);
  }
}

function showError(message, elementID) {
  console.log(`"#${elementID}"`);
  const errorMessageContainer = document.querySelector(`#${elementID}`);

  if (!errorMessageContainer) {
    console.log("An element with given idea does not exisit");
    return;
  }

  errorMessageContainer.textContent = message;
}
