const API_BASE_URL = "https://api.github.com/users";
const STORAGE_KEY = "devfinder:favorites";

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#username");
const searchButton = document.querySelector("#search-button");
const searchMessage = document.querySelector("#search-message");
const profileSection = document.querySelector("#profile-section");
const profileCard = document.querySelector("#profile-card");
const favoritesList = document.querySelector("#favorites-list");
const emptyFavorites = document.querySelector("#empty-favorites");
const favoritesCount = document.querySelector("#favorites-count");

let currentProfile = null;
let favorites = loadFavorites();

searchForm.addEventListener("submit", handleSearchSubmit);
favoritesList.addEventListener("click", handleFavoritesClick);

renderFavorites();

function handleSearchSubmit(event) {
    event.preventDefault();

    const username = searchInput.value.trim();

    if (!username) {
        searchInput.setAttribute("aria-invalid", "true");
        setStatus("Digite um username antes de pesquisar.", "error");
        searchInput.focus();
        return;
    }

    searchInput.removeAttribute("aria-invalid");
    searchUser(username);
}

async function searchUser(username) {
    setLoading(true);
    hideProfile();

    try {
        const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(username)}`);

        if (response.status === 404) {
            throw new Error("USER_NOT_FOUND");
        }

        if (response.status === 403) {
            throw new Error("RATE_LIMIT");
        }

        if (!response.ok) {
            throw new Error("REQUEST_FAILED");
        }

        const userData = await response.json();
        currentProfile = normalizeProfile(userData);

        renderProfile(currentProfile);
        setStatus(`Perfil de @${currentProfile.login} carregado com sucesso.`, "success");
    } catch (error) {
        currentProfile = null;
        showSearchError(error);
    } finally {
        setLoading(false);
    }
}

function normalizeProfile(userData) {
    return {
        login: userData.login,
        name: userData.name || userData.login,
        avatarUrl: userData.avatar_url,
        bio: userData.bio || "Bio não informada.",
        location: userData.location || "Localização não informada.",
        followers: userData.followers,
        following: userData.following,
        publicRepos: userData.public_repos,
        profileUrl: userData.html_url
    };
}

function renderProfile(profile) {
    const isFavorite = favorites.some(
        (favorite) => favorite.login.toLowerCase() === profile.login.toLowerCase()
    );

    profileCard.innerHTML = `
        <img
            class="profile-avatar"
            src="${escapeHtml(profile.avatarUrl)}"
            alt="Avatar de ${escapeHtml(profile.name)}"
        >

        <div class="profile-main">
            <div class="profile-heading">
                <div>
                    <h3 class="profile-name">${escapeHtml(profile.name)}</h3>
                    <p class="profile-username">@${escapeHtml(profile.login)}</p>
                </div>
            </div>

            <p class="profile-bio">${escapeHtml(profile.bio)}</p>
            <p class="profile-location">📍 ${escapeHtml(profile.location)}</p>

            <ul class="profile-stats" aria-label="Estatísticas do perfil">
                <li>
                    <strong>${formatNumber(profile.followers)}</strong>
                    <span>Seguidores</span>
                </li>
                <li>
                    <strong>${formatNumber(profile.following)}</strong>
                    <span>Seguindo</span>
                </li>
                <li>
                    <strong>${formatNumber(profile.publicRepos)}</strong>
                    <span>Repositórios</span>
                </li>
            </ul>

            <div class="profile-actions">
                <a
                    class="profile-link"
                    href="${escapeHtml(profile.profileUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Abrir no GitHub
                </a>

                <button
                    id="favorite-button"
                    class="favorite-button"
                    type="button"
                    aria-pressed="${isFavorite}"
                >
                    ${isFavorite ? "★ Remover dos favoritos" : "☆ Adicionar aos favoritos"}
                </button>
            </div>
        </div>
    `;

    const favoriteButton = profileCard.querySelector("#favorite-button");
    favoriteButton.addEventListener("click", toggleCurrentFavorite);

    profileSection.hidden = false;
    profileSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleCurrentFavorite() {
    if (!currentProfile) {
        return;
    }

    const favoriteIndex = favorites.findIndex(
        (favorite) => favorite.login.toLowerCase() === currentProfile.login.toLowerCase()
    );

    if (favoriteIndex >= 0) {
        favorites.splice(favoriteIndex, 1);
        setStatus(`@${currentProfile.login} foi removido dos favoritos.`, "success");
    } else {
        favorites.push({
            login: currentProfile.login,
            name: currentProfile.name,
            avatarUrl: currentProfile.avatarUrl
        });
        setStatus(`@${currentProfile.login} foi adicionado aos favoritos.`, "success");
    }

    saveFavorites();
    renderFavorites();
    renderProfile(currentProfile);
}

function renderFavorites() {
    favoritesList.replaceChildren();

    const total = favorites.length;
    favoritesCount.textContent = `${total} ${total === 1 ? "perfil" : "perfis"}`;
    emptyFavorites.hidden = total > 0;

    favorites.forEach((favorite) => {
        const item = document.createElement("li");
        item.className = "favorite-item";

        const avatar = document.createElement("img");
        avatar.src = favorite.avatarUrl;
        avatar.alt = `Avatar de ${favorite.name}`;

        const info = document.createElement("div");
        info.className = "favorite-info";

        const name = document.createElement("strong");
        name.textContent = favorite.name;

        const username = document.createElement("span");
        username.textContent = `@${favorite.login}`;

        info.append(name, username);

        const searchFavoriteButton = document.createElement("button");
        searchFavoriteButton.className = "favorite-search";
        searchFavoriteButton.type = "button";
        searchFavoriteButton.dataset.action = "search";
        searchFavoriteButton.dataset.username = favorite.login;
        searchFavoriteButton.setAttribute("aria-label", `Abrir perfil de ${favorite.login}`);
        searchFavoriteButton.textContent = "↗";

        const removeFavoriteButton = document.createElement("button");
        removeFavoriteButton.className = "favorite-remove";
        removeFavoriteButton.type = "button";
        removeFavoriteButton.dataset.action = "remove";
        removeFavoriteButton.dataset.username = favorite.login;
        removeFavoriteButton.setAttribute("aria-label", `Remover ${favorite.login} dos favoritos`);
        removeFavoriteButton.textContent = "×";

        item.append(avatar, info, searchFavoriteButton, removeFavoriteButton);
        favoritesList.append(item);
    });
}

function handleFavoritesClick(event) {
    const actionButton = event.target.closest("button[data-action]");

    if (!actionButton) {
        return;
    }

    const { action, username } = actionButton.dataset;

    if (action === "search") {
        searchInput.value = username;
        searchUser(username);
        return;
    }

    if (action === "remove") {
        favorites = favorites.filter(
            (favorite) => favorite.login.toLowerCase() !== username.toLowerCase()
        );

        saveFavorites();
        renderFavorites();

        if (currentProfile?.login.toLowerCase() === username.toLowerCase()) {
            renderProfile(currentProfile);
        }

        setStatus(`@${username} foi removido dos favoritos.`, "success");
    }
}

function loadFavorites() {
    try {
        const savedFavorites = localStorage.getItem(STORAGE_KEY);

        if (!savedFavorites) {
            return [];
        }

        const parsedFavorites = JSON.parse(savedFavorites);
        return Array.isArray(parsedFavorites) ? parsedFavorites : [];
    } catch (error) {
        console.warn("Não foi possível carregar os favoritos.", error);
        return [];
    }
}

function saveFavorites() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

function setLoading(isLoading) {
    searchButton.disabled = isLoading;
    searchButton.textContent = isLoading ? "Buscando..." : "Buscar perfil";
    searchForm.setAttribute("aria-busy", String(isLoading));

    if (isLoading) {
        setStatus("Consultando a GitHub API...", "loading");
    }
}

function setStatus(message, type = "neutral") {
    searchMessage.textContent = message;
    searchMessage.className = `status status--${type}`;
}

function showSearchError(error) {
    if (error.message === "USER_NOT_FOUND") {
        setStatus("Usuário não encontrado. Confira o username e tente novamente.", "error");
        return;
    }

    if (error.message === "RATE_LIMIT") {
        setStatus("O limite temporário da API foi atingido. Tente novamente mais tarde.", "error");
        return;
    }

    setStatus("Não foi possível consultar o GitHub. Verifique sua conexão e tente novamente.", "error");
}

function hideProfile() {
    profileSection.hidden = true;
    profileCard.replaceChildren();
}

function formatNumber(value) {
    return new Intl.NumberFormat("pt-BR").format(value);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
