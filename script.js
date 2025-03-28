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
  newFavourite.classList.add("fav-link", "newContents");

  document.querySelector("#links").appendChild(newFavourite);

  closeModal();

  const inputForm = document.querySelector(".inputForm");

  if (inputForm) {
    inputForm.reset();
  }
}

async function showWeatherData() {
  try {
    // Get the coordinates.
    const coordinates = await getCoordinates();
    if (!coordinates) {
      throw new Error("Misslyckades med att hämta koordinater.");
    }

    const data = await getDataObject(coordinates[0], coordinates[1]);

    console.log(data);

    showForecast(data);
  } catch (error) {
    console.error("Fel i showWeatherData:", error.message);
    showError("Vi har dessvärre problem med vår hämtning av data :(");
  }
}

function getCoordinates() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve([position.coords.latitude, position.coords.longitude]),
      (error) => {
        console.error(error);
        showError(
          "Väderdata kan inte visas om sidan inte har tillgång till position!"
        );
        reject(error);
      }
    );
  });
}

async function getDataObject(latitude, longitude) {
  try {
    const weatherContainer = document.querySelector("#weatherContainer");
    weatherContainer.innerHTML = `<p>Laddar väderdata!</>`;
    const BASE_URL = "http://api.weatherapi.com/v1";
    const api_key = API_KEYS.weather;
    const url = `${BASE_URL}/forecast.json?key=${api_key}&q=${latitude},${longitude}&days=4`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${apiType} weather data:`, error);
    return null;
  }
}

// A function for displaying forecasts
function showForecast(data) {
  const weatherContainer = document.querySelector("#weatherContainer");
  weatherContainer.innerHTML = ``;

  for (let i = 0; i <= 2; i++) {
    const weatherDiv = document.createElement("div");
    weatherDiv.classList.add("newContents", "weatherDisplay");

    const forecastDay = data.forecast.forecastday[i];
    const displayDay = getWeekDay(forecastDay.date);

    // if (i === 1) {
    //   displayDay = "Imorgon";
    // } else {
    //   displayDay = getWeekDay(forecastDay.date);
    // }

    weatherDiv.innerHTML = `
      <img class="weatherIcon" src="${forecastDay.day.condition.icon}" alt="${forecastDay.day.condition.text}">
      <div>
          <h3>${displayDay}</h3>
      <div>
           <p>${forecastDay.day.maxtemp_c}°C</p>
           <p>${forecastDay.day.condition.text}</p>
      </div>
      </div>`;
    weatherContainer.appendChild(weatherDiv);
  }

  function getWeekDay(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    //creates an array of weekdays to show
    const weekdays = [
      "Söndag",
      "Måndag",
      "Tisdag",
      "Onsdag",
      "Torsdag",
      "Fredag",
      "Lördag",
    ];

    if (date.toDateString() === today.toDateString()) {
      return "Just nu";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Imorgon";
    } else {
      return weekdays[date.getDay()];
    }
  }
}

function showError(message, elementID = "error-message") {
  const errorMessageContainer = document.querySelector(`#${elementID}`);
  if (errorMessageContainer) {
    errorMessageContainer.textContent = message;
  }
}
