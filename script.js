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
    const apiTypes = ["current.json", "forecast.json"];

    // Get the coordinates.
    const coordinates = await getCoordinates();
    if (!coordinates) {
      throw new Error("Misslyckades med att hämta koordinater.");
    }

    // Use Promise.all() to fetch data for both current weather and forecast at once.
    // Promice.all() let me do async operations in paralell and wait for all to be done
    // before continuing. Promise.all() receives an array of Promises and returns a promise
    // that is resolve if all promises are ready and reject if any of them fail.
    const dataArray = await Promise.all(
      apiTypes.map((apiType) =>
        getDataObject(coordinates[0], coordinates[1], apiType)
      )
    );

    console.log(dataArray);

    // Loop through the result and display weather data with different
    // functions (one for current weather and one for forecast that is a bit different)
    dataArray.forEach((data) => {
      if (data && data.current) {
        showCurrentWeather(data);
      } else if (data && data.forecast) {
        showForecast(data);
      }
    });
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

async function getDataObject(latitude, longitude, apiType) {
  try {
    const BASE_URL = "http://api.weatherapi.com/v1";
    const api_key = API_KEYS.weather;
    const url = `${BASE_URL}/${apiType}?key=${api_key}&q=${latitude},${longitude}`;

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

// A function for displaying current weather
function showCurrentWeather(data) {
  const weatherContainer = document.querySelector("#weatherContainer");
  const weatherDiv = document.createElement("div");
  weatherDiv.classList.add("newContents", "weatherDisplay");

  weatherDiv.innerHTML = `
      <img class="weatherIcon" src="${data.current.condition.icon}" alt="${data.current.condition.text}">
      <div>
      <h3 class="Just nu"></h3>
      <div>
        <p>${data.current.temp_c}°C</p><p>${data.current.condition.text}</p>
      </div>
      </div>`;
  weatherContainer.appendChild(weatherDiv);
}

// A function for displaying forecasts
function showForecast(data) {
  console.log("Väderprognos:", data);
  // Lägg till kod
}

// //use icons from https://erikflowers.github.io/weather-icons/
// function getWeatherIcon(data) {

//   const dayTime = data.is_day;
//   const weather =
//   const weatherString = `wi-${daytime ? day : night}-{weather}`;
//  }

function showError(message, elementID = "error-message") {
  const errorMessageContainer = document.querySelector(`#${elementID}`);
  if (errorMessageContainer) {
    errorMessageContainer.textContent = message;
  }
}
