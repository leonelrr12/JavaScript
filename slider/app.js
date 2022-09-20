class IndexForSiblings {
  static get(el) {
    let children = el.parentNode.children;

    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      if( child == el ) return i;
    }
  }
}

class Slider {
  constructor(selector, withMove=true) {
    this.move = this.move.bind(this);
    this.moveToNext = this.moveToNext.bind(this);
    this.slider = document.querySelector(selector);
    this.itemsCount = this.slider.querySelectorAll(".container > *").length;
    this.interval = null;
    this.contador = 0;
    this.withMove = withMove;

    this.start();
    this.buildControls();
    this.bindEvents();
  }

  start() {
    if(!this.withMove) return;
    this.interval = window.setInterval(this.move, 1000)
  }

  restart() {
    if(this.interval) window.clearInterval(this.interval);
    this.start();
  }

  bindEvents() {
    this.slider.querySelectorAll(".controls li")
      .forEach(item => {
        item.addEventListener("click", this.moveToNext)
      })
  }

  buildControls() {
    for (var i = 0; i < this.itemsCount; i++) {
      let control = document.createElement("li"); 
      if(i == 0) control.classList.add("active");
      this.slider.querySelector(".controls ul").appendChild(control);
    }
  }

  move() {
    this.contador++;
    if(this.contador > this.itemsCount -1) this.contador = 0;
    this.moveTo(this.contador);
  }

  moveToNext(ev) {
    let index = IndexForSiblings.get(ev.currentTarget);
    this.contador = index;
    this.moveTo(index);
    this.restart();
  }

  resetIndicator() {
    this.slider.querySelectorAll(".controls li.active")
      .forEach(item => item.classList.remove("active"));
  }

  moveTo(index) {
    let left = index * 100;
    this.resetIndicator();
    this.slider.querySelector(".controls li:nth-child("+ (index + 1) +")").classList.add("active");
    this.slider.querySelector(".container").style.left = "-"+left + "%";
  }

  previewFile() {
    document.querySelector("#file-uploader")
      .addEventListener("change", function(ev) {
        let files = ev.target.files;
        let image = files[0];
        let imageURL = URL.createObjectURL(image);

        document.querySelector(".profile .img")
          .style.backgroundImage = "url('"+ imageURL +"')"
      })
  }
}


class Search {
  static get(url) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.send();
    return new Promise((resolve, reject) => {
      xhr.onreadystatechange = () => {
        if(xhr.readyState == 4) {
          if(xhr.status == 200) return resolve(JSON.parse(xhr.responseText));
          // Algo salio mal
          reject(xhr.status);
        } 
      }
    });
  }
}

class Autocomplete {
  constructor(input_selector, base_url) {
    this.search = this.search.bind(this);
    this.input = document.querySelector(input_selector);
    this.url = base_url;
    this.value = "";
    this.interval = null;
    this.buildDataList();
    this.bindEvents();
  }

  bindEvents() {  
    this.input.addEventListener("keyup", () => {
      if(this.value === this.input.value || this.input.value.length < 3) return;
      if(this.interval) window.clearInterval(this.interval);

      this.value = this.input.value;
      this.interval = window.setTimeout(this.search, 500);
    });
  }

  buildDataList() {
    this.dataList = document.createElement("datalist");
    this.dataList.id = "datalist-autocomplete";
    document.querySelector("body").appendChild(this.dataList);
    this.input.setAttribute("list", "datalist-autocomplete");
  }

  search() {
    Search.get(this.url + this.value)
      .then( results => this.build(results));
  }

  build(response) {
    this.dataList.innerHTML = "";
    response.items.forEach(item => {
      let optionEl = document.createElement("option");
      optionEl.value = item.volumeInfo.title;
      if(item.volumeInfo.subtitle)
        optionEl.innerHTML = item.volumeInfo.subtitle;

      this.dataList.appendChild(optionEl);
    })
  }
}

class InputMD {
  constructor(selector) {
    this.input = document.querySelector(selector);
    this.bindEvents();
  }

  bindEvents() {
    this.input.addEventListener("keyup", () => {
      if(this.input.value == "") return this.input.classList.remove("non-empty");

      this.input.classList.add("non-empty");
    })
  }
}

(function(){

  // new Slider(".slider", true);

  const GooglBooksApiURL = "https://www.googleapis.com/books/v1/volumes?q=";
  let autocomplete = new Autocomplete("#searcher", GooglBooksApiURL)

  new InputMD(".input-form input");

})()