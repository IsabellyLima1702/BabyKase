"use strict";

let hospitalSelecionadoId = null;

const CENTRO_INICIAL = [-23.5505, -46.6333];
const CHAVE_CACHE = "atendimento-psicologico-coordenadas-v1";

const elementoLista = document.getElementById("lista-hospitais");
const elementoStatus = document.getElementById("status");
const elementoContador = document.getElementById("contador");
const elementoOrdenacao = document.getElementById("ordenacao");
const elementoBusca = document.getElementById("busca");
const elementoFiltro = document.getElementById("filtro-zona");
const botaoLocalizacao = document.getElementById("btn-localizacao");

let hospitais = [];
let usuario = null;
let marcadorUsuario = null;
let carregandoLocalizacao = false;
let sequenciaGeocodificacao = 0;

const mapa = L.map("mapa").setView(CENTRO_INICIAL, 11);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">' +
    "OpenStreetMap</a> contributors"
}).addTo(mapa);

const camadaHospitais = L.layerGroup().addTo(mapa);
const camadaUsuario = L.layerGroup().addTo(mapa);

function lerCache() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_CACHE) || "{}");
  } catch {
    return {};
  }
}

function salvarCache(cache) {
  try {
    localStorage.setItem(CHAVE_CACHE, JSON.stringify(cache));
  } catch (erro) {
    console.warn("Não foi possível salvar as coordenadas:", erro);
  }
}

function temCoordenadas(hospital) {
  return Number.isFinite(hospital.lat) &&
    Number.isFinite(hospital.lon) &&
    hospital.lat >= -90 &&
    hospital.lat <= 90 &&
    hospital.lon >= -180 &&
    hospital.lon <= 180;
}

function chaveEndereco(hospital) {
  return [
    hospital.endereco,
    hospital.bairro,
    hospital.cidade
  ].filter(Boolean).join(", ").trim();
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function escaparHTML(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[caractere]);
}

function formatarTelefone(telefone) {
  if (!telefone) return "";

  const numeros = String(telefone).replace(/\D/g, "");

  if (numeros.length === 11) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }

  return String(telefone);
}

function formatarDistancia(km) {
  if (!Number.isFinite(km)) return "Distância indisponível";

  if (km < 1) {
    return `${Math.round(km * 1000)} m em linha reta`;
  }

  return `${km.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })} km em linha reta`;
}

// Calcula a distância aproximada em linha reta.
function calcularDistancia(origem, destino) {
  const rad = graus => graus * Math.PI / 180;
  const raioTerra = 6371;

  const dLat = rad(destino.lat - origem.lat);
  const dLon = rad(destino.lon - origem.lon);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(origem.lat)) *
    Math.cos(rad(destino.lat)) *
    Math.sin(dLon / 2) ** 2;

  return 2 * raioTerra *
    Math.asin(Math.sqrt(Math.min(1, a)));
}

function calcularTodasAsDistancias() {
  for (const hospital of hospitais) {
    if (!usuario || !temCoordenadas(hospital)) {
      hospital.distancia = null;
      continue;
    }

    hospital.distancia = calcularDistancia(usuario, {
      lat: hospital.lat,
      lon: hospital.lon
    });
  }
}

// Transforma o endereço em latitude e longitude.
// O resultado é guardado localmente para evitar consultas repetidas.
async function geocodificar(hospital) {
  if (temCoordenadas(hospital)) {
    return {
      lat: hospital.lat,
      lon: hospital.lon
    };
  }

  const cache = lerCache();
  const chave = chaveEndereco(hospital);
  const coordenadasSalvas = cache[chave];

  if (
    coordenadasSalvas &&
    Number.isFinite(coordenadasSalvas.lat) &&
    Number.isFinite(coordenadasSalvas.lon)
  ) {
    return coordenadasSalvas;
  }

  const consulta = [
    hospital.endereco,
    hospital.bairro,
    hospital.cidade,
    "Brasil"
  ].filter(Boolean).join(", ");

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", consulta);
  url.searchParams.set("limit", "5");
  url.searchParams.set("lang", "pt");

  try {
    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}`);
    }

    const dados = await resposta.json();
    const resultados = dados.features || [];

    if (!resultados.length) {
      return null;
    }

    const cidadeEsperada = String(hospital.cidade || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    // Tenta evitar selecionar um resultado de outra cidade.
    const resultado = resultados.find(item => {
      const props = item.properties || {};

      const campos = [
        props.city,
        props.name,
        props.district,
        props.county,
        props.locality
      ];

      const texto = campos.filter(Boolean).join(" ")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      if (cidadeEsperada.includes("mogi das cruzes")) {
        return texto.includes("mogi das cruzes");
      }

      return texto.includes("sao paulo");
    }) || resultados[0];

    const [lon, lat] = resultado.geometry.coordinates;

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 || lat > 90 ||
      lon < -180 || lon > 180
    ) {
      return null;
    }

    const coordenadas = { lat, lon };

    cache[chave] = coordenadas;
    salvarCache(cache);

    return coordenadas;
  } catch (erro) {
    console.warn(
      "Não foi possível geocodificar:",
      chave,
      erro
    );
    return null;
  }
}

function urlRota(hospital) {
  const destino = temCoordenadas(hospital)
    ? `${hospital.lat},${hospital.lon}`
    : [
        hospital.endereco,
        hospital.bairro,
        hospital.cidade
      ].filter(Boolean).join(", ");

  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("destination", destino);
  url.searchParams.set("travelmode", "driving");

  if (usuario) {
    url.searchParams.set(
      "origin",
      `${usuario.lat},${usuario.lon}`
    );
  }

  return url.toString();
}

function criarPopup(hospital) {
  const telefone = hospital.telefone
    ? `<br><a href="tel:+55${String(hospital.telefone).replace(/\D/g, "")}">Ligar para a unidade</a>`
    : "<br>Telefone não informado";

  return `
    <div class="popup-hospital">
      <strong>${escaparHTML(hospital.nome)}</strong>
      <br>${escaparHTML(hospital.endereco)}
      <br>${escaparHTML(hospital.bairro || "")}
      ${telefone}
      <br><a href="${escaparHTML(urlRota(hospital))}"
        target="_blank" rel="noopener noreferrer">
        Abrir rota
      </a>
    </div>
  `;
}

function obterHospitaisFiltrados() {
  const termo = elementoBusca.value
    .trim()
    .toLocaleLowerCase("pt-BR");

  const zona = elementoFiltro.value;

  return hospitais
    .filter(hospital => {
      return zona === "Todas" || hospital.zona === zona;
    })
    .filter(hospital => {
      const texto = [
        hospital.nome,
        hospital.endereco,
        hospital.bairro,
        hospital.cidade,
        hospital.zona
      ].filter(Boolean).join(" ").toLocaleLowerCase("pt-BR");

      return texto.includes(termo);
    })
    .sort((a, b) => {
      if (usuario) {
        const distanciaA = Number.isFinite(a.distancia)
          ? a.distancia
          : Infinity;

        const distanciaB = Number.isFinite(b.distancia)
          ? b.distancia
          : Infinity;

        if (distanciaA !== distanciaB) {
          return distanciaA - distanciaB;
        }
      }

      return a.nome.localeCompare(b.nome, "pt-BR");
    });
}

function selecionarHospital(id) {
  const hospital = hospitais.find(item => item.id === id);

  if (!hospital) return;

  if (!temCoordenadas(hospital)) {
    elementoStatus.textContent =
      "Ainda não foi possível localizar este endereço no mapa. " +
      "Você pode abrir o endereço no Google Maps pelo cartão.";
    return;
  }

  mapa.setView([hospital.lat, hospital.lon], 16);
  renderizar();

  if (hospital.marcador) {
    hospital.marcador.openPopup();
  }

  const cartao = elementoLista.querySelector(
    `[data-hospital-id="${id}"]`
  );

  if (cartao) {
    cartao.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }
  hospitalSelecionadoId = id;
}

function renderizar() {
  const filtrados = obterHospitaisFiltrados();

  camadaHospitais.clearLayers();
  camadaUsuario.clearLayers();
  elementoLista.innerHTML = "";

  if (usuario) {
    marcadorUsuario = L.circleMarker(
      [usuario.lat, usuario.lon],
      {
        radius: 9,
        color: "#ffffff",
        weight: 3,
        fillColor: "#2563eb",
        fillOpacity: 1
      }
    ).addTo(camadaUsuario);

    marcadorUsuario.bindPopup("Sua localização atual");
  }

  for (const hospital of filtrados) {
    hospital.marcador = null;

    if (temCoordenadas(hospital)) {
      const marcador = L.marker([
        hospital.lat,
        hospital.lon
      ]).addTo(camadaHospitais);

      marcador.bindPopup(criarPopup(hospital));

      marcador.on("click", () => {
        renderizar();
        selecionarHospital(hospital.id);
      });

      hospital.marcador = marcador;
    }

    const cartao = document.createElement("article");
    cartao.className = "hospital-card";
    cartao.dataset.hospitalId = hospital.id;

    const titulo = escaparHTML(hospital.nome);
    const endereco = escaparHTML(hospital.endereco);
    const bairro = escaparHTML(hospital.bairro || "");
    const cidade = escaparHTML(hospital.cidade || "");
    const zona = escaparHTML(hospital.zona || "");

    const telefoneHTML = hospital.telefone
      ? `
        <a class="card-telefone"
           href="tel:+55${String(hospital.telefone).replace(/\D/g, "")}">
          ☎ ${escaparHTML(formatarTelefone(hospital.telefone))}
          — Ligar
        </a>
      `
      : `<p class="telefone-indisponivel">Telefone não informado</p>`;

    const distanciaHTML = usuario && temCoordenadas(hospital)
      ? `<span class="distancia">📍 ${formatarDistancia(hospital.distancia)}</span>`
      : `<span class="distancia">${
          temCoordenadas(hospital)
            ? "Ative sua localização para ver a distância"
            : "Endereço ainda não localizado no mapa"
        }</span>`;

    cartao.innerHTML = `
      <div class="card-cabecalho">
        <div class="icone-hospital" aria-hidden="true">✚</div>
        <div class="card-titulo">
          <h3>${titulo}</h3>
          <span class="badge-zona">${zona}</span>
        </div>
      </div>

      <p class="card-endereco">${endereco}</p>
      <p class="card-bairro">${bairro}${bairro && cidade ? " · " : ""}${cidade}</p>

      ${telefoneHTML}
      ${distanciaHTML}

      <div class="card-acoes">
        <button class="btn-ver" type="button">
          Ver no mapa
        </button>

        <a class="btn-rota"
           href="${escaparHTML(urlRota(hospital))}"
           target="_blank"
           rel="noopener noreferrer">
          Como chegar ↗
        </a>
      </div>
    `;

    cartao.querySelector(".btn-ver").addEventListener("click", () => {
      selecionarHospital(hospital.id);
    });

    if (hospital.id === hospitalSelecionadoId) {
      cartao.classList.add("selecionado");
    }

    elementoLista.appendChild(cartao);
  }

  const comCoordenadas = hospitais.filter(temCoordenadas).length;
  const comCoordenadasVisiveis = filtrados.filter(temCoordenadas).length;

  elementoContador.textContent =
    `${filtrados.length} ${filtrados.length === 1 ? "local" : "locais"}`;

  elementoOrdenacao.textContent = usuario
    ? "Mais próximos primeiro"
    : "Ordem alfabética";

  if (filtrados.length === 0) {
    elementoLista.innerHTML = `
      <div class="mensagem-vazia">
        Nenhum local encontrado.<br>
        Tente outro nome, bairro ou região.
      </div>
    `;
  }

  if (usuario) {
    elementoStatus.textContent =
      `${comCoordenadasVisiveis} local(is) com coordenadas nesta busca. ` +
      (comCoordenadas < hospitais.length
        ? `${hospitais.length - comCoordenadas} endereço(s) precisam ser conferidos.`
        : "Resultados ordenados por distância em linha reta.");
  } else {
    elementoStatus.textContent =
      `${comCoordenadas} de ${hospitais.length} locais localizados no mapa. ` +
      "Use sua localização para ordenar por proximidade.";
  }
}

async function carregarHospitais() {
  elementoStatus.textContent = "Carregando a lista de locais...";

  try {
    const resposta = await fetch("hospitais.json");

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar hospitais.json");
    }

    const dados = await resposta.json();

    hospitais = dados.map((hospital, indice) => {
      const lat = hospital.lat;
      const lon = hospital.lon;

      return {
        ...hospital,
        id: hospital.id ?? indice + 1,
        lat: lat !== null && lat !== undefined && lat !== ""
          ? Number(lat)
          : null,
        lon: lon !== null && lon !== undefined && lon !== ""
          ? Number(lon)
          : null,
        distancia: null,
        marcador: null
      };
    });

    renderizar();

    const pendentes = hospitais.filter(
      hospital => !temCoordenadas(hospital)
    );

    if (pendentes.length) {
      const inicio = ++sequenciaGeocodificacao;

      for (let i = 0; i < pendentes.length; i++) {
        if (inicio !== sequenciaGeocodificacao) return;

        const hospital = pendentes[i];

        elementoStatus.textContent =
          `Localizando endereços: ${i + 1} de ${pendentes.length}. ` +
          "A lista já pode ser utilizada.";

        const coordenadas = await geocodificar(hospital);

        if (coordenadas) {
          hospital.lat = coordenadas.lat;
          hospital.lon = coordenadas.lon;
        }

        calcularTodasAsDistancias();
        renderizar();

        if (i < pendentes.length - 1) {
          await esperar(1100);
        }
      }
    }

    const localInicial = hospitais.find(temCoordenadas);

    if (localInicial) {
      mapa.setView([localInicial.lat, localInicial.lon], 11);
    }

    renderizar();

    if (hospitais.some(hospital => !temCoordenadas(hospital))) {
      elementoStatus.textContent +=
        " Alguns endereços não foram localizados. Confira-os manualmente.";
    }
  } catch (erro) {
    console.error(erro);

    elementoStatus.textContent =
      "Não foi possível carregar a lista. " +
      "Verifique o arquivo hospitais.json e execute o projeto usando Live Server.";
  }
}

function solicitarLocalizacao() {
  if (carregandoLocalizacao) return;

  if (!navigator.geolocation) {
    elementoStatus.textContent =
      "Seu navegador não oferece suporte à localização.";
    return;
  }

  carregandoLocalizacao = true;
  botaoLocalizacao.disabled = true;
  botaoLocalizacao.textContent = "Obtendo localização...";

  navigator.geolocation.getCurrentPosition(
    posicao => {
      usuario = {
        lat: posicao.coords.latitude,
        lon: posicao.coords.longitude
      };

      calcularTodasAsDistancias();

      mapa.setView([usuario.lat, usuario.lon], 12);
      renderizar();

      carregandoLocalizacao = false;
      botaoLocalizacao.disabled = false;
      botaoLocalizacao.textContent = "📍 Atualizar localização";
    },
    erro => {
      const mensagens = {
        1: "Acesso à localização negado. Permita o acesso nas configurações do navegador.",
        2: "Não foi possível determinar sua localização. Verifique o GPS ou a conexão.",
        3: "A solicitação demorou muito. Tente novamente."
      };

      elementoStatus.textContent =
        mensagens[erro.code] || "Não foi possível obter a localização.";

      carregandoLocalizacao = false;
      botaoLocalizacao.disabled = false;
      botaoLocalizacao.textContent = "📍 Tentar novamente";
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000
    }
  );
}

elementoBusca.addEventListener("input", renderizar);
elementoFiltro.addEventListener("change", renderizar);
botaoLocalizacao.addEventListener("click", solicitarLocalizacao);

carregarHospitais();
