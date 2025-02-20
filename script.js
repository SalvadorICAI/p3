
// en las constantes se van a almacenar los elementos del DOM que se van a utilizar
// Elementos del DOM
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const resultsDiv = document.getElementById('results');
const gameDetailDiv = document.getElementById('gameDetail');

// Array para almacenar los juegos obtenidos
let gamesData = [];
const MIN_CHARACTERS = 3; // Número mínimo de caracteres para iniciar la búsqueda de juegos

// Evento para capturar lo que se escribe en el input
// Al escribir en el input se realiza la búsqueda de juegos
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  if (query.length >= MIN_CHARACTERS) {
    fetchGames(query);
  } else {
    resultsDiv.innerHTML = '';
  }
  
});

// Evento para cambiar el orden de los resultados
// cuando se cambia el orden se vuelven a renderizar los juegos
sortSelect.addEventListener('change', () => {
  renderGames();
});

/**
 * Función que realiza la petición a la API de CheapShark para obtener los juegos.
 */

// esta primera búqueda se realiza con el título del juego, pero solo se obtiene el id del juego. luego se debe hacer una segunda petición para obtener el detalle del juego
function fetchGames(query) {
  const url = `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent( // se utiliza encodeURIComponent para que se codifiquen los caracteres especiales y no haya problemas con la url. previamente habiamos quitado los espacios en blanco al principio y al final
    query
  )}`;
  fetch(url)
    .then((response) => response.json()) // hay que convertir la respuesta a json
    .then((data) => {
      gamesData = data;
      renderGames();
    })
    .catch((error) => {
      console.error('Error al obtener los juegos:', error); // esto por si acaso hay un error
    });
}

/**
 * Función que renderiza las tarjetas de resultados en el DOM.
 */

function renderGames() {
  // Clonar y ordenar los datos según el filtro seleccionado
  let sortedGames = [...gamesData]; // se clona el array para no modificar el original y asi poder ordenar los datos sin afectar la búsqueda original
  const sortValue = sortSelect.value;

  if (sortValue === 'priceAsc') {
    sortedGames.sort(
      (a, b) => parseFloat(a.cheapest) - parseFloat(b.cheapest)
    );
  } else if (sortValue === 'priceDesc') {
    sortedGames.sort(
      (a, b) => parseFloat(b.cheapest) - parseFloat(a.cheapest)
    );
  } else if (sortValue === 'alphabetical') {
    sortedGames.sort((a, b) => a.external.localeCompare(b.external));
  }

  // Limpiar resultados previos
  resultsDiv.innerHTML = '';  // siempre que hay que actualizar los resultados se limpia el div para que no haya duplicados

  // Crear las tarjetas para cada juego
  sortedGames.forEach((game) => {
    const card = document.createElement('div');
    card.className = 'card';

    // Imagen del juego
    const img = document.createElement('img');
    img.src = game.thumb; // en este caso se utiliza thumb en lugar de external para obtener la imagen del juego, que es donde se guarda la url de la imagen en el objeto game que se obtiene de la API
    img.alt = game.external; // el external contiene el título del juego
    card.appendChild(img); // hay que agregar la imagen al card y agregarla al DOM

    //igual con el resto de elementos
    // Título del juego
    const title = document.createElement('h3');
    title.textContent = game.external;
    card.appendChild(title);

    // Precio más barato
    const price = document.createElement('p');
    price.textContent = `Precio: $${game.cheapest}`;
    card.appendChild(price);

    // hay que añadirle un evento al card para que al hacer clic se cargue el detalle del juego
    // Al hacer clic se carga el detalle del juego
    card.addEventListener('click', () => {
      showGameDetail(game.gameID);
    });

    resultsDiv.appendChild(card);
  });
}

/**
 * Función que consulta el detalle del juego utilizando el gameID.
 */
function showGameDetail(gameID) { // hay que volver a hacer una petición al servidor para obtener el detalle del juego, puesto que la primera vez solo se obtiene el id
  const url = `https://www.cheapshark.com/api/1.0/games?ids=${gameID}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // La respuesta es un objeto con clave gameID
      const gameDetail = data[gameID]; // se obtiene el detalle del juego
      displayGameDetail(gameDetail);
    })
    .catch((error) => {
      console.error('Error al obtener el detalle del juego:', error);
    });
}

/**
 * Función que muestra en el DOM el detalle del juego.
 */
function displayGameDetail(detail) {
  gameDetailDiv.innerHTML = ''; // Limpiar detalle previo si lo hay

  // Contenedor del detalle
  const detailCard = document.createElement('div');

  // Título del juego
  const title = document.createElement('h2');
  title.textContent = detail.info.title;
  detailCard.appendChild(title);

  // Imagen del juego
  const img = document.createElement('img');
  img.src = detail.info.thumb;
  img.alt = detail.info.title;
  detailCard.appendChild(img);

  // Puntuación de Metacritic (si existe)
  const metacritic = document.createElement('p');
  metacritic.textContent = `Metacritic Score: ${
    detail.info.metacriticScore || 'N/A'
  }`;
  detailCard.appendChild(metacritic);

  // Mostrar ofertas disponibles (si las hay)
  if (detail.deals && detail.deals.length > 0) {
    const dealsTitle = document.createElement('h3');
    dealsTitle.textContent = 'Ofertas disponibles:';
    detailCard.appendChild(dealsTitle);

    detail.deals.forEach((deal) => {
      const dealInfo = document.createElement('p');
      dealInfo.textContent = `Tienda: ${deal.storeID} - Precio: $${deal.price}`;
      detailCard.appendChild(dealInfo);
    });
  }

  // Botón para cerrar el detalle
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Cerrar';
  closeBtn.addEventListener('click', () => {
    gameDetailDiv.innerHTML = '';
  });
  detailCard.appendChild(closeBtn);// esta linea se pone antes de añadir el detalle al DOM para que se muestre el botón de cerrar

  gameDetailDiv.appendChild(detailCard); // se añade el detalle al DOM. hay que poner esta línea al final para que se muestre todo el detalle
}
