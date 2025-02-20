// Elementos del DOM
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const resultsDiv = document.getElementById('results');
const gameDetailDiv = document.getElementById('gameDetail');

// Array para almacenar los juegos obtenidos
let gamesData = [];
const MIN_CHARACTERS = 3; // Número mínimo de caracteres para iniciar la búsqueda

// Evento para capturar lo que se escribe en el input
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  if (query.length >= MIN_CHARACTERS) {
    fetchGames(query);
  } else {
    resultsDiv.innerHTML = '';
  }
  console.log(query)
});

// Evento para cambiar el orden de los resultados
sortSelect.addEventListener('change', () => {
  renderGames();
});

/**
 * Función que realiza la petición a la API de CheapShark
 * utilizando el parámetro "title" para buscar juegos.
 */
function fetchGames(query) {
  const url = `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(
    query
  )}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      gamesData = data;
      renderGames();
    })
    .catch((error) => {
      console.error('Error al obtener los juegos:', error);
    });
}

/**
 * Función que renderiza las tarjetas de resultados en el DOM.
 * Se aplica la ordenación seleccionada.
 */
function renderGames() {
  // Clonar y ordenar los datos según el filtro seleccionado
  let sortedGames = [...gamesData];
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
  resultsDiv.innerHTML = '';

  // Crear las tarjetas para cada juego
  sortedGames.forEach((game) => {
    const card = document.createElement('div');
    card.className = 'card';

    // Imagen del juego
    const img = document.createElement('img');
    img.src = game.thumb;
    img.alt = game.external;
    card.appendChild(img);

    // Título del juego
    const title = document.createElement('h3');
    title.textContent = game.external;
    card.appendChild(title);

    // Precio más barato
    const price = document.createElement('p');
    price.textContent = `Precio: $${game.cheapest}`;
    card.appendChild(price);

    // Al hacer clic se carga el detalle del juego
    card.addEventListener('click', () => {
      showGameDetail(game.gameID);
    });

    resultsDiv.appendChild(card);
  });
}

/**
 * Función que consulta el detalle del juego utilizando el gameID.
 * Se utiliza el endpoint que permite obtener detalles pasándole el parámetro "ids".
 */
function showGameDetail(gameID) {
  const url = `https://www.cheapshark.com/api/1.0/games?ids=${gameID}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // La respuesta es un objeto con clave gameID
      const gameDetail = data[gameID];
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
  gameDetailDiv.innerHTML = ''; // Limpiar detalle previo

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
  detailCard.appendChild(closeBtn);

  gameDetailDiv.appendChild(detailCard);
}
