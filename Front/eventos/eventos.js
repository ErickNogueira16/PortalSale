/**
 * Arquivo JavaScript específico para a página eventos.html
 * Contém funcionalidades para exibição e interação com eventos
 */

// Elementos do DOM
const eventsList = document.getElementById("eventsList")
const backButton = document.getElementById("backButton")
const filterButtons = document.querySelectorAll(".filter-button")
const eventCardTemplate = document.getElementById("event-card-template")

/**
 * Cria um elemento HTML para um evento usando o template
 * @param {Object} evento - Dados do evento
 * @returns {HTMLElement} Elemento HTML do evento
 */
function criarElementoEvento(evento) {
  const template = eventCardTemplate.content.cloneNode(true)
  const card = template.querySelector(".event-card")

  // Adiciona categoria e estilo
  const categoryBadge = card.querySelector(".event-card__category")
  categoryBadge.textContent = evento.tipoEvento.charAt(0).toUpperCase() + evento.tipoEvento.slice(1)
  categoryBadge.classList.add(`event-card__category--${evento.tipoEvento}`)

  // Preenche os dados do evento
  card.querySelector(".event-card__title").textContent = evento.nome
  card.querySelector(".event-card__description").textContent = evento.descricao
  card.querySelector(".event-card__time").textContent = evento.dataHora
  card.querySelector(".event-card__location").textContent = evento.local
  card.querySelector(".event-card__speaker").textContent = evento.palestrante

  // Favoritos
  const favoritos = obterFavoritos()
  const botaoFavorito = document.createElement("button")
  botaoFavorito.classList.add("favorite-button")

  if (favoritos.includes(evento.id)) {
    botaoFavorito.textContent = "★"
    botaoFavorito.classList.add("favorited")
  } else {
    botaoFavorito.textContent = "☆"
  }

  botaoFavorito.addEventListener("click", () => alternarFavorito(evento.id, botaoFavorito))

  card.appendChild(botaoFavorito)

  // Configura o status de vagas
  const status = card.querySelector(".event-card__status")
  const vagasRestantes = evento.vagas - evento.inscritos
  if (vagasRestantes == 0) {
    status.textContent = `Vagas esgotadas`
    status.classList.add("event-card__status--limited")
  }
  else if (vagasRestantes == 1) {
    status.textContent = `Última vaga!`
    status.classList.add("event-card__status--limited")
  }
  else if (vagasRestantes >= 2 && vagasRestantes <= 10) {
    status.textContent = `Últimas ${vagasRestantes} vagas!`
    status.classList.add("event-card__status--limited")
  } else {
    status.textContent = `${vagasRestantes} vagas disponíveis`
    status.classList.add("event-card__status--available")
  }

  // Configura o botão de inscrição
  const button = card.querySelector(".event-card__button")
  button.addEventListener("click", () => inscreverEvento(evento.id))

  // Adiciona delay para animação
  card.style.animationDelay = `${Math.random() * 0.3}s`

  return card
}

/**
 * Carrega os eventos na página
 * @param {string} filtro - Categoria para filtrar os eventos
 */
function carregarEventos(filtro = "all") {
  fetch("http://localhost:8080/eventos")
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erro ao carregar os eventos: ${response.status}`)
      }
      return response.json()
    })
    .then(eventos => {
      eventsList.innerHTML = ""

      // Aplica o filtro, se necessário
      const favoritos = obterFavoritos()
      let eventosFiltrados

      if (filtro === "all") {
        eventosFiltrados = eventos
      } else if (filtro === "favoritos") {
        eventosFiltrados = eventos.filter(evento => favoritos.includes(evento.id))
      } else {
        eventosFiltrados = eventos.filter(evento => evento.tipoEvento === filtro)
      }

      // Exibe os eventos
      eventosFiltrados.forEach(evento => {
        const eventoElement = criarElementoEvento(evento)
        eventsList.appendChild(eventoElement)
      })

    })
    .catch(error => {
      console.error("Erro ao carregar eventos", error)
      alert(error)
    })
}

function salvarEventos(favoritos) {
  localStorage.setItem("favoritos", JSON.stringify(favoritos))
}

function obterFavoritos() {
  return JSON.parse(localStorage.getItem("favoritos")) || []
}

function alternarFavorito(eventoId, botao) {
  let favoritos = obterFavoritos()

  if (favoritos.includes(eventoId)) {
    favoritos = favoritos.filter(id => id !== eventoId)
    botao.textContent = "☆"
    botao.classList.remove("favorited")
  } else {
    favoritos.push(eventoId)
    botao.textContent = "★"
    botao.classList.add("favorited")
  }

  salvarEventos(favoritos)
}

/**
 * Função para inscrição em um evento
 * @param {number} eventoId - ID do evento
 */
function inscreverEvento(eventoId) {
  const evento = eventosDisponiveis.find((e) => e.id === eventoId)
  if (evento) {
    const vagasRestantes = evento.vagas - evento.inscritos
    if (vagasRestantes > 0) {
      alert(`Inscrição realizada com sucesso para o evento: ${evento.titulo}`)
      evento.inscritos++ // Incrementa o número de inscritos
      carregarEventos(document.querySelector(".filter-button.active").dataset.filter) // Recarrega os eventos
    } else {
      alert("Desculpe, não há mais vagas disponíveis para este evento.")
    }
  }
}

/**
 * Volta para a página inicial
 */
function voltarParaInicio() {
  window.location.href = "../login/login.html"
}

// Event Listeners
backButton.addEventListener("click", voltarParaInicio)

// Configuração dos filtros
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Remove a classe active de todos os botões
    filterButtons.forEach((btn) => btn.classList.remove("active"))
    // Adiciona a classe active ao botão clicado
    button.classList.add("active")
    // Carrega os eventos com o filtro selecionado
    carregarEventos(button.dataset.filter)
  })
})

// Inicialização
document.addEventListener("DOMContentLoaded", () => carregarEventos())

