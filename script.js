let player;
let isPlaying = false;
let index = 0;

let songs = [
    {
        name: "Bi Saraha",
        artist: "Abeer Nehme",
        youtubeId: "Os8n_cqlt4M",
        cover: "Images/1.jpg",
        category:"Nasheed"
    },
    {
         name: "Back to You",
         artist: "Siedd",
         youtubeId: "6t1k2W_sxtU",
         cover: "Images/4.jpg",
         category: "Nasheed"
     },
     {
         name: "Hasn't death called you?",
         artist: "Mishary Al Rashid",
         youtubeId: "noLBypfK8BU",
         cover: "Images/5.jpg",
         category: "Nasheed"
     },
    {
        name: "Dil Ali Dilbar Ali",
        artist: "Sajjad Muhammadi",
        youtubeId: "KgLWCwEF6Ys",
        cover: "Images/2.jpg",
        category: "Noha"
    },
    {
        name: "Surah al Mursalat",
        artist: "Qari Umar al Hisham",
        youtubeId: "m8DVFQJ6GT8",
        cover: "Images/3.png",
        category: "Quran Recitation"
    },
    {
        name: " Rahmatun Lil’Alameen",
        artist: "Maher Zain",
        youtubeId: "PWPlfL_LTko",
        cover: "Images/6.jpg",
        category: "Nasheed"
    }
];

let title = document.getElementById("title");
let artist = document.getElementById("artist");
let cover = document.getElementById("cover");
let progress = document.getElementById("progress");
let currentTimeEl = document.getElementById("currentTime");
let durationEl = document.getElementById("duration");
let playBtn = document.getElementById("playBtn");
let volume = document.getElementById("volume");
let playlistItems = document.getElementById("playlist-items");
let playlistToggle = document.getElementById("playlist-toggle");
let playlistSidebar = document.querySelector(".playlist-sidebar");
let closePlaylist = document.querySelector(".close-playlist");
let playlistSearch = document.getElementById("playlist-search");
let categoryFilter = document.getElementById("category-filter");


function onYouTubeIframeAPIReady() {
    loadSong();
    buildPlaylist();
    populateCategories();
}

function loadSong() {
    const song = songs[index];
    title.textContent = song.name;
    artist.textContent = song.artist;
    cover.src = song.cover;

    if (player) {
        player.destroy();
    }

    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: song.youtubeId,
        playerVars: {
            'playsinline': 1,
            'controls': 0,
            'rel': 0,
            'showinfo': 0,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });

    highlightCurrentSong();
}

function onPlayerReady(event) {

    event.target.setVolume(volume.value);
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        playBtn.textContent = "⏸";
        cover.style.animationPlayState = "running";
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
        isPlaying = false;
        playBtn.textContent = "▶";
        cover.style.animationPlayState = "paused";
        if (event.data === YT.PlayerState.ENDED) {
            nextSong();
        }
    }
}


function togglePlay() {
    if (!player) return;
    if (isPlaying) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}


function nextSong() {
    index = (index + 1) % songs.length;
    loadSong();
    setTimeout(() => { if (player) player.playVideo(); }, 800);
}

function prevSong() {
    index = (index - 1 + songs.length) % songs.length;
    loadSong();
    setTimeout(() => { if (player) player.playVideo(); }, 800);
}


function skipForward() {
    if (player) {
        player.seekTo(player.getCurrentTime() + 10);
    }
}

function skipBackward() {
    if (player) {
        player.seekTo(player.getCurrentTime() - 10);
    }
}

function buildPlaylist(filteredSongs = songs) {
    playlistItems.innerHTML = "";
    filteredSongs.forEach((song, i) => {
        const li = document.createElement("li");
        li.textContent = `${song.name} – ${song.artist}`;
        li.dataset.index = songs.indexOf(song);
        li.addEventListener("click", () => {
            index = parseInt(li.dataset.index);
            loadSong();
            player.playVideo();
            highlightCurrentSong();
            if (window.innerWidth <= 500) {
                playlistSidebar.classList.remove("open");
            }
        });
        playlistItems.appendChild(li);
    });
    highlightCurrentSong();
}

function highlightCurrentSong() {
    const items = playlistItems.querySelectorAll("li");
    items.forEach((item) => {
        item.classList.toggle("active", parseInt(item.dataset.index) === index);
    });
}


function populateCategories() {
    const categories = [...new Set(
            songs
                .map(s => s.category)
                .filter(cat => cat && typeof cat === "string")
        )];


        categoryFilter.innerHTML = '<option value="all">All Categories</option>';

        categories.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });
    }


function filterPlaylist() {
    const searchTerm = playlistSearch.value.toLowerCase();
    const selectedCat = categoryFilter.value;

    let filtered = songs;
    if (selectedCat !== "all") {
        filtered = filtered.filter(s => (s.category || "") === selectedCat);
    }
    if (searchTerm) {
        filtered = filtered.filter(s =>
            s.name.toLowerCase().includes(searchTerm) ||
            s.artist.toLowerCase().includes(searchTerm)
        );
    }

    buildPlaylist(filtered);
}


playBtn.addEventListener("click", togglePlay);

if (playlistToggle) {
    playlistToggle.addEventListener("click", () => {
        playlistSidebar.classList.toggle("open");
    });
}

if (closePlaylist) {
    closePlaylist.addEventListener("click", () => {
        playlistSidebar.classList.remove("open");
    });
}

volume.addEventListener("input", () => {
    if (player) {
        player.setVolume(volume.value);
    }
});

playlistSearch.addEventListener("input", filterPlaylist);
categoryFilter.addEventListener("change", filterPlaylist);


setInterval(() => {
    if (player && player.getCurrentTime && player.getDuration) {
        const current = player.getCurrentTime();
        const dur = player.getDuration();
        if (dur > 0) {
            progress.value = (current / dur) * 100;
            currentTimeEl.textContent = formatTime(current);
            durationEl.textContent = formatTime(dur);
        }
    }
}, 500);

progress.addEventListener("input", () => {
    if (player && player.seekTo) {
        const dur = player.getDuration();
        player.seekTo((progress.value / 100) * dur);
    }
});

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    sec = sec < 10 ? "0" + sec : sec;
    return min + ":" + sec;
}