const books = [];
const RENDER_EVENT = "render-book";
const SEARCH_EVENT = "search-book";
const SAVED_EVENT = "save-books";
const STORAGE_KEY = "BOOKSHELF_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const bookForm = document.getElementById("inputBook");
  bookForm.addEventListener("submit", function (even) {
    even.preventDefault();
    addBook();
  });

  const checkBoxIsComplete = document.getElementById("inputBookIsComplete");
  checkBoxIsComplete.addEventListener("change", function () {
    const textSpan = document.getElementsByTagName("span");
    textSpan[0].innerHTML = this.checked
      ? "Selesai dibaca"
      : "Belum selesai dibaca";
  });

  const searchBook = document.getElementById("searchBook");
  searchBook.addEventListener("submit", function (even) {
    even.preventDefault();
    document.dispatchEvent(new Event(SEARCH_EVENT));
  });
});

function addBook() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const bookYear = parseInt(year);
  const isComplete = document.getElementById("inputBookIsComplete").checked
    ? true
    : false;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    bookTitle,
    bookAuthor,
    bookYear,
    isComplete
  );
  books.push(bookObject);
  const toast = document.createElement("div");
  toast.classList.add("toast");

  toast.style.opacity = "1";
  toast.style.bottom = "10px";
  toast.style.visibility = "visible";
  toast.style.maxWidth = "300px";
  toast.innerText = `Buku berhasil ${bookTitle} ditambahkan`;
  document.body.append(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.bottom = "0px";
    toast.style.visibility = "hidden";
    toast.style.borderColor = "transparent";
    toast.style.background = "transparent";
  }, 1500);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const incompleteList = document.getElementById("incompleteBookshelfList");
  incompleteList.innerHTML = "";

  const completeList = document.getElementById("completeBookshelfList");
  completeList.innerHTML = "";

  for (const book of books) {
    const bookElement = makeBook(book);
    if (book.isComplete) {
      completeList.append(bookElement);
    } else {
      incompleteList.append(bookElement);
    }
  }
});

function makeBook(bookObject) {
  const textTitle = document.createElement("h4");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = `Penulis: ${bookObject.author}`;

  let textYear = document.createElement("p");
  textYear.innerText = `Tahun: ${bookObject.year}`;

  const article = document.createElement("article");
  article.classList.add("book_item");

  const section = document.createElement("section");
  section.classList.add("book_info");

  const divAction = document.createElement("div");
  divAction.classList.add("action");

  const iconDelete = document.createElement("div");
  iconDelete.classList.add("fa", "fa-trash");

  const iconChecklist = document.createElement("div");
  iconChecklist.classList.add("fa", "fa-check");

  section.append(textTitle);
  section.append(textAuthor);
  section.append(textYear);
  article.append(section);
  article.append(divAction);
  article.setAttribute("id", `book-${bookObject.id}`);

  if (!bookObject.isComplete) {
    const completeButton = document.createElement("button");
    completeButton.classList.add("button-complete");
    completeButton.append(iconChecklist);
    divAction.append(completeButton);

    const info = document.createElement("p");
    info.classList.add("info-incomplete");
    info.innerText = "Belum selesai dibaca";
    section.append(info);

    completeButton.addEventListener("click", function () {
      addBookToCompleteList(bookObject.id);
    });
  } else {
    const incompleteButton = document.createElement("button");
    incompleteButton.classList.add("button-undo");
    incompleteButton.append(iconChecklist);
    divAction.append(incompleteButton);

    const info = document.createElement("p");
    info.classList.add("info-complete");
    info.innerText = "Sudah selesai dibaca";
    section.append(info);

    incompleteButton.addEventListener("click", function () {
      addBookToIncompleteList(bookObject.id);
    });
  }

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("button-delete");
  deleteButton.append(iconDelete);
  divAction.append(deleteButton);

  deleteButton.addEventListener("click", function () {
    deleteBookFromList(bookObject.id);
  });

  return article;
}

function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (let i = 0; i < books.length; i++) {
    if (books[i].id === bookId) {
      return i;
    }
  }
  return null;
}

function addBookToCompleteList(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToIncompleteList(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteBookFromList(bookId) {
  const bookTarget = findBookIndex(bookId);
  const book = findBook(bookId);

  const body = document.querySelector("body");

  if (bookTarget === -1) return;
  const input = document.createElement("input");
  input.setAttribute("type", `checkbox`);
  input.setAttribute("id", `check`);

  const icon = document.createElement("i");
  icon.classList.add("fa-solid", "fa-question");

  const popupAlert = document.createElement("div");
  popupAlert.classList.add("popup-alert");
  popupAlert.style.opacity = "1";
  popupAlert.style.position = "fixed";
  popupAlert.style.pointerEvents = "auto";

  const description = document.createElement("h1");
  description.innerText = "Apakah kamu yakin ingin menghapus buku ini?";

  const background = document.createElement("div");
  background.classList.add("blur-background");
  background.style.opacity = "1";
  background.style.pointerEvents = "auto";

  const btnCancel = document.createElement("a");
  btnCancel.setAttribute("class", `btn1`);
  btnCancel.innerText = "Batal";
  btnCancel.addEventListener("click", function (event) {
    event.preventDefault();
    popupAlert.style.opacity = "0";
    popupAlert.style.pointerEvents = "none";
    background.style.opacity = "0";
    background.style.pointerEvents = "none";
  });

  const toast = document.createElement("div");
  toast.classList.add("toast");

  const btnDelete = document.createElement("a");
  btnDelete.setAttribute("class", `btn2`);
  btnDelete.innerText = "Hapus";
  btnDelete.addEventListener("click", function (event) {
    event.preventDefault();
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    popupAlert.style.opacity = "0";
    popupAlert.style.pointerEvents = "none";
    background.style.opacity = "0";
    background.style.pointerEvents = "none";

    toast.style.opacity = "1";
    toast.style.bottom = "10px";
    toast.style.visibility = "visible";
    toast.style.maxWidth = "300px";
    toast.innerText = "Buku berhasil dihapus";
    document.body.append(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.bottom = "0px";
      toast.style.visibility = "hidden";
      toast.style.borderColor = "transparent";
      toast.style.background = "transparent";
    }, 1500);
  });

  const buttonContainer = document.createElement("div");
  buttonContainer.setAttribute("class", `btns`);
  buttonContainer.append(btnDelete, btnCancel);

  popupAlert.append(icon, description, buttonContainer);

  body.append(input, background, popupAlert);

  // if (bookTarget === -1) return;
  // if (
  //   window.confirm(`Hapus buku ${book.title} (${book.author} : ${book.year}) ?`)
  // ) {
  //   books.splice(bookTarget, 1);
  // }
  // document.dispatchEvent(new Event(RENDER_EVENT));
  // saveData();
}

document.addEventListener(SEARCH_EVENT, function () {
  const searchList = document.getElementById("searchBookshelfList");
  searchList.innerHTML = "";
  const searchBookTitle = document.getElementById("searchBookTitle").value;

  for (const book of books) {
    if (book.title.toLowerCase().includes(searchBookTitle.toLowerCase())) {
      const bookElement = makeBook(book);
      searchList.append(bookElement);
    }
  }
});

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser tidak mendukung local storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFormStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener("DOMContentLoaded", function () {
  if (isStorageExist) {
    loadDataFormStorage();
  }
});
