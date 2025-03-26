console.log("Finns knappen?", document.querySelector("#addLinkButton"));

document.addEventListener("DOMContentLoaded", function () {
  clock();
  addNotes();
  changeHeading();
  favouriteLinks();
});

console.log("Script laddat!");

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

function favouriteLinks() {
  const startAddFavouriteBtn = document.querySelector("#addFavourite");
  const modalContainer = document.querySelector(".modalContainer");
  const inputForm = document.querySelector(".inputForm");
  const canselBtn = document.querySelector("#cancelButton");
  const addFavouriteBtn = document.querySelector("#addLinkButton");

  function closeModal() {
    modalContainer.style.display = "none";
  }

  //show the modal when clicking the add-button
  startAddFavouriteBtn.addEventListener("click", () => {
    modalContainer.style.display = "flex";
  });

  //When klicking cansel - the modal does not show.
  canselBtn.addEventListener("click", (e) => {
    e.preventDefault;
    closeModal();
  });

  //When clicking outside the form-modal, the modal will close
  // modalContainer.addEventListener("click", (e) => {
  //   if (e.target !== inputForm) {
  //     closeModal();
  //   }
  // });

  // const form = document.querySelector("#addLinks");
  // form.addEventListener("submit", (e) => {

  //   console.log("Submit event triggered");
  //   e.preventDefault;

  document
    .querySelector("#addLinkButton")
    .addEventListener("click", function (event) {
      event.preventDefault(); // Förhindra formulärets submit
      event.stopPropagation(); // Förhindra att eventet "bubblar upp"

      console.log("Klick på knappen!");

      const url = document.querySelector("#url").value;
      const linkName = document.querySelector("#linkName").value;

      if (!url || !linkName) {
        console.log("Fält saknas!");
        return;
      }

      const newFavourite = document.createElement("a");

      newFavourite.textContent = linkName;
      newFavourite.href = url;
      newFavourite.target = "_blank"; //make sure the link is open in a new page
      newFavourite.classList.add("fav-link");

      // newFavourite.addEventListener(() => {
      //   window.open(url, "blank");
      // });

      document.querySelector("#links").appendChild(newFavourite);
      console.log("Länk tillagd:", linkName, url);
      // form.reset();
      closeModal();
    });
}
