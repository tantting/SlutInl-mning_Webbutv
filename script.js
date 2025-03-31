document.addEventListener("DOMContentLoaded", function () {
  clock();
  randomBackGround();
  notes();
  changeHeading();
  favouriteLinks();
  showWeatherData();
  randomRecipe();
});

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

function randomBackGround() {
  const backGroundBtn = document.querySelector("#selectBackground");

  backGroundBtn.addEventListener("click", () => getRandomImage());
}

async function getRandomImage() {
  const url = `https://api.unsplash.com//photos/random/?client_id=${API_KEYS.unsplashed.accessKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Kan inte hämta data från API: ${response.status}`);
    }
    const data = await response.json();

    displayNewBackground(data);

    console.log(data);
  } catch (error) {
    console.error(error.message);
  }
}

function displayNewBackground(data) {
  //Fetch image info:
  const imageURL = data.urls.regular;
  const altDesc = data.alt_description;
  const photographer = data.user.name;
  const profileURL = data.links.html;

  //Updating background image
  document.body.style.backgroundImage = `url(${imageURL})`;
  document.body.setAttribute("aria-label", altDesc);

  const creditPhotog = document.querySelector("#credit");

  //Credit to photographer. target= "_blank" makes the url open in a new window
  creditPhotog.innerHTML = `Bakgrundsfoto av: <a href="${profileURL}" target="_blank" >${photographer}</a> via Unsplashed`;
}

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
const inputForm = document.querySelector("#addLinks");
const favLinksDiv = document.querySelector("#links");

// function saveLinks() {
//   localStorage.setItem("favouriteLinks", favLinksDiv.value);
// }

function closeModal() {
  modalContainer.style.display = "none";
  inputForm.style.display = "none";
}

function favouriteLinks() {
  const startAddFavouriteBtn = document.querySelector("#addFavourite");
  const canselBtn = document.querySelector("#cancelButton");
  const addFavouriteBtn = document.querySelector("#addLinkButton");

  //if there are any saved notes in localStorage, they will be fetched.
  loadFavouriteLinks();

  //show the modal when clicking the add-button in the link container
  startAddFavouriteBtn.addEventListener("click", () => {
    modalContainer.style.display = "flex";
    inputForm.style.display = "flex";
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
  //fetched links saved in LocalStorage if there are any
  const savedLinks = JSON.parse(localStorage.getItem("favouriteLinks")) || [];
  //att the new link to the array of links
  savedLinks.push({ url, linkName });
  //save the updated array of links to localStrage
  localStorage.setItem("favouriteLinks", JSON.stringify(savedLinks));

  //Updating DOM with the new link.
  addNewLinkDiv(url, linkName);
}

function addNewLinkDiv(url, linkName) {
  const newFavourite = document.createElement("a");

  const favIconURL = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=64`;

  newFavourite.innerHTML = `
      <div>
        <img id="linkIcon" src="${favIconURL}" alt="${linkName}">
        <h3 id="linkTitle">${linkName}</h3>
      </div>
      <span class="edit fa-solid fa-pen-to-square"></span>`;
  newFavourite.href = url;
  newFavourite.target = "_blank"; //makesure the link is open in a new page
  newFavourite.classList.add("fav-link", "newContents");

  favLinksDiv.appendChild(newFavourite);

  closeModal();

  if (inputForm) {
    inputForm.reset();
  }
}

function loadFavouriteLinks() {
  //makes sure favLinksDiv is empty before rending links from localStorage
  favLinksDiv.innerHTML = "";

  const storedLinks = localStorage.getItem("favouriteLinks");

  if (!storedLinks) {
    console.warn("Finns inga sparade länkar i localStorage");
    return;
  }

  try {
    const savedLinks = JSON.parse(storedLinks);

    if (!Array.isArray(savedLinks)) {
      throw new Error("Fel format i localStorage");
    }

    //for each array-item of links and name - a new link-div is rendered.
    savedLinks.forEach(({ url, linkName }) => {
      addNewLinkDiv(url, linkName);
    });
  } catch (error) {
    console.error("Kunde inte ladda länkar från localStorage:", error);
    localStorage.removeItem("favouriteLinks"); // Erase "korrupt" data
  }
}

//funktionality for writing text in notes
function notes() {
  const modalContainer = document.querySelector(".modalContainer");
  const notesCanvas = document.querySelector("#notesCanvas");
  const notesDiv = document.querySelector("#notes");

  //notes, if there are any, will be fetched from localStorage
  const savedNotes = localStorage.getItem("dashboardNotes") || "";

  //if there are notes in localStorage when starting, it will be displayed in notesCanvas
  notesCanvas.value = savedNotes;
  console.log(notesCanvas.value);

  updateNotesPreview();

  //Event-listnere that display the  notesCanvas when clicking on notesDiv.
  notesDiv.addEventListener("click", function (event) {
    // use the same modalContainer as for display addLinksForm above.
    modalContainer.style.display = "flex";
    notesCanvas.style.display = "block";
    notesCanvas.focus();
  });

  //An event-listner that makes sure the nots are always saved.
  notesCanvas.addEventListener("input", () => {
    localStorage.setItem("dashboardNotes", notesCanvas.value);
  });

  notesCanvas.addEventListener("blur", () => {
    // When the user leaves the notesCanvas-area, the notesDiv is updated and the modal is closed.
    updateNotesPreview();
    modalContainer.style.display = "none";
    notesCanvas.style.display = "none";
  });

  function updateNotesPreview() {
    notesDiv.textContent = notesCanvas.value;
    console.log(notesDiv.value);
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
           <p class="forecastText">${forecastDay.day.condition.text}</p>
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

async function randomRecipe() {
  const url = `https://api.spoonacular.com/recipes/random?number=1&apiKey=${API_KEYS.recipe2}&tags=vegetarian`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Could not fetch data: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(data);
    displayRecipe(data);
  } catch (error) {
    console.error("Problems fetching data", error.message);
  }
}

function displayRecipe(data) {
  const recipe = data.recipes[0];
  const imageURL = recipe.image;
  const title = recipe.title;
  const recipeURL = recipe.sourceUrl;

  const recipeContainer = document.querySelector("#recipeSubContainer");
  console.log(recipeContainer);

  recipeContainer.innerHTML = `<a href="${recipeURL}"><h3>${title}</h3> <img src="${imageURL}" alt="picture of ${title}"></a>`;
}
